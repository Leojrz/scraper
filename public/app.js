// DOM Elements
const searchSection = document.getElementById('searchSection');
const progressSection = document.getElementById('progressSection');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');

const searchForm = document.getElementById('searchForm');
const submitBtn = document.getElementById('submitBtn');
const downloadBtn = document.getElementById('downloadBtn');
const newSearchBtn = document.getElementById('newSearchBtn');
const retryBtn = document.getElementById('retryBtn');

const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const progressTitle = document.getElementById('progressTitle');
const progressStatus = document.getElementById('progressStatus');
const totalFoundEl = document.getElementById('totalFound');
const processedEl = document.getElementById('processed');
const phaseEl = document.getElementById('phase');
const currentBusinessName = document.getElementById('currentBusinessName');

const resultsSummary = document.getElementById('resultsSummary');
const resultsBody = document.getElementById('resultsBody');
const errorMessage = document.getElementById('errorMessage');

// State
let currentJobId = null;
let eventSource = null;

// Category suggestions
document.querySelectorAll('.suggestions button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('category').value = btn.dataset.value;
    });
});

// Form submission
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = document.getElementById('category').value.trim();
    const city = document.getElementById('city').value.trim();
    const country = document.getElementById('country').value.trim();

    if (!category || !city || !country) {
        alert('Por favor completa todos los campos');
        return;
    }

    startScraping(category, city, country);
});

// Start scraping
async function startScraping(category, city, country) {
    try {
        submitBtn.disabled = true;

        // Show progress section
        showSection('progress');
        resetProgress();

        // Start the scraping job
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category, city, country })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error starting scraping');
        }

        currentJobId = data.jobId;

        // Connect to progress updates
        connectToProgress(currentJobId);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

// Connect to SSE for progress updates
function connectToProgress(jobId) {
    if (eventSource) {
        eventSource.close();
    }

    eventSource = new EventSource(`/api/progress/${jobId}`);

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.error) {
            eventSource.close();
            showError(data.error);
            return;
        }

        updateProgress(data);

        if (data.status === 'completed') {
            eventSource.close();
            fetchResults(jobId);
        } else if (data.status === 'error') {
            eventSource.close();
            showError(data.error || 'Error during scraping');
        }
    };

    eventSource.onerror = () => {
        eventSource.close();
        // Don't show error immediately, might just be connection closed
    };
}

// Update progress UI
function updateProgress(data) {
    const percent = Math.round(data.progress || 0);

    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    totalFoundEl.textContent = data.totalFound || 0;
    processedEl.textContent = data.resultsCount || 0;

    // Phase translation
    const phases = {
        'loading': 'Cargando',
        'scrolling': 'Buscando',
        'extracting': 'Extrayendo',
        'scraping_website': 'Analizando',
        'finishing': 'Finalizando',
        'generating_excel': 'Generando Excel'
    };
    phaseEl.textContent = phases[data.phase] || data.phase || '-';

    // Status messages
    const statusMessages = {
        'loading': 'Cargando resultados de Google Maps...',
        'scrolling': 'Buscando todos los negocios disponibles...',
        'extracting': 'Extrayendo información de cada negocio...',
        'finishing': 'Procesando datos finales...',
        'generating_excel': 'Generando archivo Excel...'
    };
    progressStatus.textContent = statusMessages[data.phase] || 'Procesando...';

    if (data.currentBusiness) {
        currentBusinessName.textContent = data.currentBusiness;
    }

    if (data.status === 'generating_excel') {
        progressTitle.textContent = 'Generando Excel...';
    }
}

// Reset progress UI
function resetProgress() {
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    totalFoundEl.textContent = '0';
    processedEl.textContent = '0';
    phaseEl.textContent = '-';
    currentBusinessName.textContent = 'Preparando...';
    progressTitle.textContent = 'Buscando negocios...';
    progressStatus.textContent = 'Iniciando búsqueda en Google Maps';
}

// Fetch final results
async function fetchResults(jobId) {
    try {
        const response = await fetch(`/api/results/${jobId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error fetching results');
        }

        displayResults(data.results);

    } catch (error) {
        console.error('Error fetching results:', error);
        showError(error.message);
    }
}

// Display results
function displayResults(results) {
    // Summary cards
    const withPhone = results.filter(r => r.phone).length;
    const withWebsite = results.filter(r => r.website).length;
    const withSocial = results.filter(r => r.instagram || r.facebook || r.linkedin || r.twitter || r.youtube).length;

    resultsSummary.innerHTML = `
        <div class="summary-card">
            <div class="value">${results.length}</div>
            <div class="label">Total Negocios</div>
        </div>
        <div class="summary-card">
            <div class="value">${withPhone}</div>
            <div class="label">Con Teléfono</div>
        </div>
        <div class="summary-card">
            <div class="value">${withWebsite}</div>
            <div class="label">Con Website</div>
        </div>
        <div class="summary-card">
            <div class="value">${withSocial}</div>
            <div class="label">Con Redes</div>
        </div>
    `;

    // Table rows
    resultsBody.innerHTML = results.map((business, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>
                <strong>${escapeHtml(business.name || '-')}</strong>
                ${business.address ? `<br><small style="color: var(--text-muted)">${escapeHtml(truncate(business.address, 50))}</small>` : ''}
            </td>
            <td>${business.phone ? `<a href="tel:${business.phone}">${escapeHtml(business.phone)}</a>` : '-'}</td>
            <td>${business.website ? `<a href="${business.website}" target="_blank" rel="noopener">Visitar</a>` : '-'}</td>
            <td>
                <div class="social-links">
                    ${business.instagram ? `
                        <a href="${business.instagram}" target="_blank" rel="noopener" class="social-link instagram" title="Instagram">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                <circle cx="12" cy="12" r="4"/>
                                <circle cx="17.5" cy="6.5" r="1.5"/>
                            </svg>
                        </a>
                    ` : ''}
                    ${business.facebook ? `
                        <a href="${business.facebook}" target="_blank" rel="noopener" class="social-link facebook" title="Facebook">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                            </svg>
                        </a>
                    ` : ''}
                    ${business.linkedin ? `
                        <a href="${business.linkedin}" target="_blank" rel="noopener" class="social-link linkedin" title="LinkedIn">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                <rect x="2" y="9" width="4" height="12"/>
                                <circle cx="4" cy="4" r="2"/>
                            </svg>
                        </a>
                    ` : ''}
                    ${business.twitter ? `
                        <a href="${business.twitter}" target="_blank" rel="noopener" class="social-link twitter" title="Twitter">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                            </svg>
                        </a>
                    ` : ''}
                    ${business.youtube ? `
                        <a href="${business.youtube}" target="_blank" rel="noopener" class="social-link youtube" title="YouTube">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                            </svg>
                        </a>
                    ` : ''}
                    ${!business.instagram && !business.facebook && !business.linkedin && !business.twitter && !business.youtube ? '-' : ''}
                </div>
            </td>
            <td>
                ${business.rating ? `
                    <div class="rating">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        ${business.rating}
                    </div>
                ` : '-'}
            </td>
        </tr>
    `).join('');

    showSection('results');
    submitBtn.disabled = false;
}

// Download Excel
downloadBtn.addEventListener('click', () => {
    if (currentJobId) {
        window.location.href = `/api/download/${currentJobId}`;
    }
});

// New search
newSearchBtn.addEventListener('click', () => {
    currentJobId = null;
    searchForm.reset();
    showSection('search');
});

// Retry
retryBtn.addEventListener('click', () => {
    showSection('search');
    submitBtn.disabled = false;
});

// Show error
function showError(message) {
    errorMessage.textContent = message;
    showSection('error');
    submitBtn.disabled = false;
}

// Show section helper
function showSection(section) {
    searchSection.classList.add('hidden');
    progressSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    errorSection.classList.add('hidden');

    switch (section) {
        case 'search':
            searchSection.classList.remove('hidden');
            break;
        case 'progress':
            progressSection.classList.remove('hidden');
            break;
        case 'results':
            resultsSection.classList.remove('hidden');
            break;
        case 'error':
            errorSection.classList.remove('hidden');
            break;
    }
}

// Utility functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(text, length) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
}
