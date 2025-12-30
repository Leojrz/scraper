const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { scrapeGoogleMaps } = require('./scraper/googleMaps');
const { generateExcel } = require('./scraper/excelGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for exclusion list
app.use(express.static(path.join(__dirname, 'public')));

// Store for active jobs
const jobs = new Map();

// Start scraping endpoint
app.post('/api/scrape', async (req, res) => {
    const { category, city, country, exclusionList = [] } = req.body;

    if (!category || !city || !country) {
        return res.status(400).json({ error: 'Category, city, and country are required' });
    }

    const jobId = uuidv4();

    // Initialize job
    jobs.set(jobId, {
        status: 'running',
        progress: 0,
        totalFound: 0,
        currentBusiness: '',
        results: [],
        skippedCount: 0,
        excelPath: null,
        error: null
    });

    // Start scraping in background
    (async () => {
        try {
            const { results, skippedCount } = await scrapeGoogleMaps(
                category,
                city,
                country,
                exclusionList,
                (progress) => {
                    const job = jobs.get(jobId);
                    if (job) {
                        job.progress = progress.percent;
                        job.totalFound = progress.totalFound;
                        job.currentBusiness = progress.currentBusiness || '';
                        job.phase = progress.phase || 'searching';
                        job.skippedCount = progress.skippedCount || 0;
                    }
                }
            );

            const job = jobs.get(jobId);
            if (job) {
                job.results = results;
                job.skippedCount = skippedCount;
                job.progress = 100;
                job.status = 'generating_excel';

                // Generate Excel
                const excelPath = await generateExcel(results, jobId, category, city, country);
                job.excelPath = excelPath;
                job.status = 'completed';
            }
        } catch (error) {
            console.error('Scraping error:', error);
            const job = jobs.get(jobId);
            if (job) {
                job.status = 'error';
                job.error = error.message;
            }
        }
    })();

    res.json({ jobId });
});

// Progress endpoint (Server-Sent Events)
app.get('/api/progress/:jobId', (req, res) => {
    const { jobId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const sendProgress = () => {
        const job = jobs.get(jobId);

        if (!job) {
            res.write(`data: ${JSON.stringify({ error: 'Job not found' })}\n\n`);
            res.end();
            return;
        }

        res.write(`data: ${JSON.stringify({
            status: job.status,
            progress: job.progress,
            totalFound: job.totalFound,
            currentBusiness: job.currentBusiness,
            phase: job.phase,
            resultsCount: job.results.length,
            skippedCount: job.skippedCount,
            error: job.error
        })}\n\n`);

        if (job.status === 'completed' || job.status === 'error') {
            res.end();
            return;
        }

        setTimeout(sendProgress, 500);
    };

    sendProgress();

    req.on('close', () => {
        // Client disconnected
    });
});

// Download Excel endpoint
app.get('/api/download/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status !== 'completed' || !job.excelPath) {
        return res.status(400).json({ error: 'Excel file not ready' });
    }

    res.download(job.excelPath, `leads_${jobId.slice(0, 8)}.xlsx`, (err) => {
        if (err) {
            console.error('Download error:', err);
        }
    });
});

// Get results as JSON
app.get('/api/results/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = jobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
        status: job.status,
        results: job.results,
        totalFound: job.totalFound,
        skippedCount: job.skippedCount
    });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Google Maps Lead Scraper v2.0 ready!`);
});
