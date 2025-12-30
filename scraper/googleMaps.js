const puppeteer = require('puppeteer');

/**
 * Scrape businesses from Google Maps
 * @param {string} category - Business category (e.g., "plumber", "dentist")
 * @param {string} city - City name
 * @param {string} country - Country name
 * @param {Array} exclusionList - List of business URLs/IDs to skip (already scraped)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Object with results array and skippedCount
 */
async function scrapeGoogleMaps(category, city, country, exclusionList = [], onProgress) {
    const searchQuery = `${category} in ${city}, ${country}`;
    console.log(`🔍 Searching: ${searchQuery}`);
    console.log(`📋 Exclusion list has ${exclusionList.length} items`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
            '--window-size=1920,1080'
        ]
    });

    const results = [];
    let skippedCount = 0;

    // Create a Set for faster lookup
    const exclusionSet = new Set(exclusionList);

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Navigate to Google Maps
        const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
        console.log(`📍 Navigating to: ${mapsUrl}`);

        await page.goto(mapsUrl, { waitUntil: 'networkidle2', timeout: 60000 });

        // Wait for results to load
        await delay(2000);

        // Accept cookies if dialog appears
        try {
            const acceptButton = await page.$('[aria-label="Accept all"]');
            if (acceptButton) {
                await acceptButton.click();
                await delay(1000);
            }
        } catch (e) {
            // Cookie dialog might not appear
        }

        onProgress({ percent: 5, totalFound: 0, phase: 'loading', currentBusiness: 'Cargando resultados...', skippedCount: 0 });

        // Wait for the results panel
        await page.waitForSelector('[role="feed"]', { timeout: 30000 }).catch(() => null);

        // Scroll to load all results
        console.log('📜 Scrolling to load all results...');
        const businessLinks = await scrollAndCollectLinks(page, onProgress);

        console.log(`✅ Found ${businessLinks.length} businesses`);

        // Filter out already scraped businesses
        const newBusinessLinks = businessLinks.filter(link => !exclusionSet.has(link));
        skippedCount = businessLinks.length - newBusinessLinks.length;

        console.log(`⏭️ Skipping ${skippedCount} already scraped businesses`);
        console.log(`🆕 Processing ${newBusinessLinks.length} new businesses`);

        onProgress({
            percent: 30,
            totalFound: businessLinks.length,
            phase: 'extracting',
            currentBusiness: `Procesando ${newBusinessLinks.length} nuevos (${skippedCount} saltados)`,
            skippedCount
        });

        // Extract details for each NEW business
        for (let i = 0; i < newBusinessLinks.length; i++) {
            const link = newBusinessLinks[i];
            const progress = 30 + Math.floor((i / newBusinessLinks.length) * 65);

            onProgress({
                percent: progress,
                totalFound: businessLinks.length,
                phase: 'extracting',
                currentBusiness: `Procesando ${i + 1}/${newBusinessLinks.length}`,
                skippedCount
            });

            try {
                const businessData = await extractBusinessDetails(page, link);

                if (businessData && businessData.name) {
                    results.push(businessData);
                    console.log(`  ✓ ${businessData.name}`);
                }
            } catch (error) {
                console.error(`  ✗ Error extracting business: ${error.message}`);
            }

            // Reduced delay for faster processing
            await delay(300 + Math.random() * 300);
        }

        onProgress({ percent: 95, totalFound: businessLinks.length, phase: 'finishing', currentBusiness: 'Finalizando...', skippedCount });

    } catch (error) {
        console.error('Scraping error:', error);
        throw error;
    } finally {
        await browser.close();
    }

    return { results, skippedCount };
}

/**
 * Scroll the results panel and collect all business links
 */
async function scrollAndCollectLinks(page, onProgress) {
    const links = new Set();
    let previousCount = 0;
    let noNewResultsCount = 0;
    const maxScrollAttempts = 50;

    for (let attempt = 0; attempt < maxScrollAttempts; attempt++) {
        // Get all business links currently visible
        const newLinks = await page.evaluate(() => {
            const items = document.querySelectorAll('[role="feed"] > div > div > a[href*="/maps/place/"]');
            return Array.from(items).map(a => a.href);
        });

        newLinks.forEach(link => links.add(link));

        onProgress({
            percent: 5 + Math.min(25, Math.floor((attempt / maxScrollAttempts) * 25)),
            totalFound: links.size,
            phase: 'scrolling',
            currentBusiness: `Encontrados: ${links.size} negocios`,
            skippedCount: 0
        });

        // Check if we got new results
        if (links.size === previousCount) {
            noNewResultsCount++;
            if (noNewResultsCount >= 3) {
                console.log('No more results to load');
                break;
            }
        } else {
            noNewResultsCount = 0;
        }
        previousCount = links.size;

        // Scroll down in the results panel
        await page.evaluate(() => {
            const feed = document.querySelector('[role="feed"]');
            if (feed) {
                feed.scrollTop += 1000;
            }
        });

        // Reduced delay for faster scrolling
        await delay(1000);

        // Check for "end of list" indicator
        const endReached = await page.evaluate(() => {
            const endText = document.querySelector('[role="feed"]')?.textContent || '';
            return endText.includes("You've reached the end") ||
                endText.includes('No hay más resultados') ||
                endText.includes('Has llegado al final');
        });

        if (endReached) {
            console.log('Reached end of results');
            break;
        }
    }

    return Array.from(links);
}

/**
 * Extract details from a business page (all data from Google Maps directly)
 */
async function extractBusinessDetails(page, businessUrl) {
    try {
        await page.goto(businessUrl, { waitUntil: 'networkidle2', timeout: 20000 });
        await delay(1500);

        const data = await page.evaluate(() => {
            const result = {
                name: '',
                address: '',
                phone: '',
                website: '',
                rating: '',
                reviews: '',
                category: '',
                mapsLink: window.location.href,
                instagram: '',
                facebook: '',
                linkedin: '',
                twitter: '',
                youtube: ''
            };

            // Name
            const nameEl = document.querySelector('h1');
            result.name = nameEl?.textContent?.trim() || '';

            // Try to find info buttons/sections
            const buttons = document.querySelectorAll('button[data-item-id]');
            buttons.forEach(btn => {
                const itemId = btn.getAttribute('data-item-id');
                const text = btn.textContent?.trim() || '';
                const ariaLabel = btn.getAttribute('aria-label') || '';

                if (itemId?.includes('phone') || ariaLabel.toLowerCase().includes('phone') || ariaLabel.toLowerCase().includes('teléfono')) {
                    result.phone = text.replace(/[^\d+\-\s()]/g, '').trim();
                }

                if (itemId?.includes('address') || ariaLabel.toLowerCase().includes('address') || ariaLabel.toLowerCase().includes('dirección')) {
                    result.address = text;
                }
            });

            // Alternative phone extraction
            if (!result.phone) {
                const phoneLink = document.querySelector('a[href^="tel:"]');
                if (phoneLink) {
                    result.phone = phoneLink.href.replace('tel:', '');
                }
            }

            // Alternative: look for phone in aria-labels
            if (!result.phone) {
                const allButtons = document.querySelectorAll('button');
                for (const btn of allButtons) {
                    const ariaLabel = btn.getAttribute('aria-label') || '';
                    const phoneMatch = ariaLabel.match(/[\d\s\-+()]{7,}/);
                    if (phoneMatch && !ariaLabel.toLowerCase().includes('review')) {
                        result.phone = phoneMatch[0].trim();
                        break;
                    }
                }
            }

            // Website
            const websiteLink = document.querySelector('a[data-item-id="authority"]');
            if (websiteLink) {
                result.website = websiteLink.href;
            } else {
                // Alternative website detection
                const allLinks = document.querySelectorAll('a[href]');
                for (const link of allLinks) {
                    const href = link.href;
                    const ariaLabel = link.getAttribute('aria-label') || '';
                    if ((ariaLabel.toLowerCase().includes('website') || ariaLabel.toLowerCase().includes('sitio web')) &&
                        !href.includes('google.com')) {
                        result.website = href;
                        break;
                    }
                }
            }

            // Rating
            const ratingEl = document.querySelector('[role="img"][aria-label*="star"]') ||
                document.querySelector('[aria-label*="estrellas"]');
            if (ratingEl) {
                const match = ratingEl.getAttribute('aria-label')?.match(/[\d.,]+/);
                result.rating = match ? match[0] : '';
            }

            // Reviews count
            const reviewsEl = document.querySelector('button[aria-label*="reviews"]') ||
                document.querySelector('button[aria-label*="reseñas"]');
            if (reviewsEl) {
                const match = reviewsEl.textContent?.match(/[\d,.]+/);
                result.reviews = match ? match[0] : '';
            }

            // Category
            const categoryEl = document.querySelector('button[jsaction*="category"]');
            result.category = categoryEl?.textContent?.trim() || '';

            // Address from different location
            if (!result.address) {
                const addressButton = document.querySelector('button[data-item-id*="address"]');
                if (addressButton) {
                    result.address = addressButton.textContent?.trim() || '';
                }
            }

            // Social Media Links - Extract from Google Maps directly
            const allLinks = document.querySelectorAll('a[href]');
            for (const link of allLinks) {
                const href = link.href.toLowerCase();

                // Instagram
                if (href.includes('instagram.com/') && !result.instagram) {
                    result.instagram = link.href;
                }

                // Facebook
                if (href.includes('facebook.com/') && !href.includes('/sharer') && !result.facebook) {
                    result.facebook = link.href;
                }

                // LinkedIn
                if (href.includes('linkedin.com/') && !href.includes('/share') && !result.linkedin) {
                    result.linkedin = link.href;
                }

                // Twitter/X
                if ((href.includes('twitter.com/') || href.includes('x.com/')) && !href.includes('/share') && !result.twitter) {
                    result.twitter = link.href;
                }

                // YouTube
                if (href.includes('youtube.com/') && !result.youtube) {
                    result.youtube = link.href;
                }
            }

            return result;
        });

        return data;

    } catch (error) {
        console.error(`Error extracting details: ${error.message}`);
        return null;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { scrapeGoogleMaps };
