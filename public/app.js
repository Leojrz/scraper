// ===== DOM Elements =====
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
const skippedEl = document.getElementById('skipped');
const phaseEl = document.getElementById('phase');
const currentBusinessName = document.getElementById('currentBusinessName');

const resultsSummary = document.getElementById('resultsSummary');
const resultsBody = document.getElementById('resultsBody');
const errorMessage = document.getElementById('errorMessage');

// Header buttons
const historyBtn = document.getElementById('historyBtn');
const clearCacheBtn = document.getElementById('clearCacheBtn');
const historyBadge = document.getElementById('historyBadge');
const historyModal = document.getElementById('historyModal');
const closeHistoryModal = document.getElementById('closeHistoryModal');
const historyList = document.getElementById('historyList');

// Stats
const totalScrapedEl = document.getElementById('totalScraped');
const totalSearchesEl = document.getElementById('totalSearches');

// Autocomplete elements
const categoryInput = document.getElementById('category');
const countryInput = document.getElementById('country');
const cityInput = document.getElementById('city');
const categoryDropdown = document.getElementById('categoryDropdown');
const countryDropdown = document.getElementById('countryDropdown');
const cityDropdown = document.getElementById('cityDropdown');

// ===== State =====
let currentJobId = null;
let eventSource = null;
let selectedCountry = null;
let skippedCount = 0;

// ===== Local Storage Keys =====
const STORAGE_KEYS = {
    SCRAPED_BUSINESSES: 'leadScraper_scrapedBusinesses',
    SEARCH_HISTORY: 'leadScraper_searchHistory',
    STATS: 'leadScraper_stats'
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    initAutocomplete();
    updateStats();
    updateHistoryBadge();
});

// ===== Autocomplete System =====
function initAutocomplete() {
    // Category autocomplete
    setupAutocomplete(categoryInput, categoryDropdown, () => {
        return CATEGORIES.map(cat => ({
            value: cat.value,
            label: cat.label,
            search: `${cat.value} ${cat.label} ${cat.es}`.toLowerCase()
        }));
    }, (item) => {
        categoryInput.value = item.value;
    });

    // Country autocomplete
    setupAutocomplete(countryInput, countryDropdown, () => {
        return COUNTRIES.map(country => ({
            value: country.value,
            label: country.label,
            count: country.cities.length,
            search: `${country.value} ${country.label}`.toLowerCase()
        }));
    }, (item) => {
        countryInput.value = item.value;
        selectedCountry = COUNTRIES.find(c => c.value === item.value);
        cityInput.placeholder = 'Escribe para buscar ciudades...';
        cityInput.value = '';
    });

    // City autocomplete (depends on selected country)
    setupAutocomplete(cityInput, cityDropdown, () => {
        if (!selectedCountry) {
            return [{ value: '', label: '⚠️ Primero selecciona un país', disabled: true }];
        }
        return selectedCountry.cities.map(city => ({
            value: city,
            label: city,
            search: city.toLowerCase()
        }));
    }, (item) => {
        if (!item.disabled) {
            cityInput.value = item.value;
        }
    });
}

function setupAutocomplete(input, dropdown, getItems, onSelect) {
    let selectedIndex = -1;
    let items = [];

    input.addEventListener('focus', () => {
        showDropdown();
    });

    input.addEventListener('input', () => {
        showDropdown();
    });

    input.addEventListener('blur', () => {
        // Delay to allow click on dropdown item
        setTimeout(() => {
            dropdown.classList.remove('active');
        }, 200);
    });

    input.addEventListener('keydown', (e) => {
        if (!dropdown.classList.contains('active')) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, 0);
            updateSelection();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && items[selectedIndex]) {
                selectItem(items[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            dropdown.classList.remove('active');
        }
    });

    function showDropdown() {
        items = getItems();
        const query = input.value.toLowerCase();

        // Filter items
        const filtered = query
            ? items.filter(item => item.search?.includes(query) || item.label.toLowerCase().includes(query))
            : items;

        if (filtered.length === 0) {
            dropdown.innerHTML = '<div class="autocomplete-empty">No se encontraron resultados</div>';
        } else {
            dropdown.innerHTML = filtered.slice(0, 20).map((item, index) => `
                <div class="autocomplete-item ${item.disabled ? 'disabled' : ''}" data-index="${index}">
                    <span class="item-label">${item.label}</span>
                    ${item.count ? `<span class="item-count">${item.count} ciudades</span>` : ''}
                </div>
            `).join('');

            // Add click handlers
            dropdown.querySelectorAll('.autocomplete-item:not(.disabled)').forEach((el, idx) => {
                el.addEventListener('click', () => {
                    selectItem(filtered[idx]);
                });
            });
        }

        items = filtered;
        selectedIndex = -1;
        dropdown.classList.add('active');
    }

    function updateSelection() {
        dropdown.querySelectorAll('.autocomplete-item').forEach((el, idx) => {
            el.classList.toggle('selected', idx === selectedIndex);
        });
    }

    function selectItem(item) {
        onSelect(item);
        dropdown.classList.remove('active');
    }
}

// ===== Duplicate Prevention System =====
function getScrapedBusinesses() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SCRAPED_BUSINESSES)) || {};
    } catch {
        return {};
    }
}

function saveScrapedBusinesses(businesses) {
    localStorage.setItem(STORAGE_KEYS.SCRAPED_BUSINESSES, JSON.stringify(businesses));
}

function addScrapedBusiness(business) {
    const scraped = getScrapedBusinesses();
    const key = generateBusinessKey(business);
    scraped[key] = {
        name: business.name,
        mapsLink: business.mapsLink,
        scrapedAt: new Date().toISOString()
    };
    saveScrapedBusinesses(scraped);
}

function generateBusinessKey(business) {
    // Use Maps link or name+address as unique key
    if (business.mapsLink) {
        return business.mapsLink;
    }
    return `${business.name}_${business.address}`.toLowerCase().replace(/\s+/g, '_');
}

function getExclusionList() {
    const scraped = getScrapedBusinesses();
    return Object.keys(scraped);
}

function clearScrapedBusinesses() {
    if (confirm('¿Estás seguro? Esto eliminará el historial de negocios scrapeados y se podrán repetir en futuras búsquedas.')) {
        localStorage.removeItem(STORAGE_KEYS.SCRAPED_BUSINESSES);
        updateStats();
        alert('Cache de duplicados limpiado correctamente');
    }
}

// ===== Search History =====
function getSearchHistory() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)) || [];
    } catch {
        return [];
    }
}

function addSearchToHistory(category, city, country, resultsCount) {
    const history = getSearchHistory();
    history.unshift({
        category,
        city,
        country,
        resultsCount,
        date: new Date().toISOString()
    });
    // Keep only last 50 searches
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(history.slice(0, 50)));
    updateHistoryBadge();
}

function updateHistoryBadge() {
    const history = getSearchHistory();
    historyBadge.textContent = history.length;
}

function showHistory() {
    const history = getSearchHistory();

    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No hay búsquedas en el historial</div>';
    } else {
        historyList.innerHTML = history.map(item => `
            <div class="history-item">
                <div class="history-item-header">
                    <span class="history-item-title">${item.category} en ${item.city}, ${item.country}</span>
                    <span class="history-item-date">${new Date(item.date).toLocaleDateString('es-AR')}</span>
                </div>
                <div class="history-item-stats">
                    <span>📊 ${item.resultsCount} negocios</span>
                </div>
            </div>
        `).join('');
    }

    historyModal.classList.remove('hidden');
}

// ===== Stats =====
function updateStats() {
    const scraped = getScrapedBusinesses();
    const history = getSearchHistory();

    totalScrapedEl.textContent = Object.keys(scraped).length;
    totalSearchesEl.textContent = history.length;
}

// ===== Event Listeners =====

// Header buttons
historyBtn.addEventListener('click', showHistory);
closeHistoryModal.addEventListener('click', () => historyModal.classList.add('hidden'));
historyModal.addEventListener('click', (e) => {
    if (e.target === historyModal) historyModal.classList.add('hidden');
});
clearCacheBtn.addEventListener('click', clearScrapedBusinesses);

// Form submission
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = categoryInput.value.trim();
    const city = cityInput.value.trim();
    const country = countryInput.value.trim();

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
        skippedCount = 0;

        // Show progress section
        showSection('progress');
        resetProgress();

        // Get exclusion list
        const exclusionList = getExclusionList();

        // Start the scraping job
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                category,
                city,
                country,
                exclusionList: exclusionList
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error starting scraping');
        }

        currentJobId = data.jobId;

        // Connect to progress updates
        connectToProgress(currentJobId, category, city, country);

    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

// Connect to SSE for progress updates
function connectToProgress(jobId, category, city, country) {
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
            fetchResults(jobId, category, city, country);
        } else if (data.status === 'error') {
            eventSource.close();
            showError(data.error || 'Error during scraping');
        }
    };

    eventSource.onerror = () => {
        eventSource.close();
    };
}

// Update progress UI
function updateProgress(data) {
    const percent = Math.round(data.progress || 0);

    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    totalFoundEl.textContent = data.totalFound || 0;
    processedEl.textContent = data.resultsCount || 0;
    skippedEl.textContent = data.skippedCount || 0;

    // Phase translation
    const phases = {
        'loading': 'Cargando',
        'scrolling': 'Buscando',
        'extracting': 'Extrayendo',
        'finishing': 'Finalizando',
        'generating_excel': 'Excel'
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
    skippedEl.textContent = '0';
    phaseEl.textContent = '-';
    currentBusinessName.textContent = 'Preparando...';
    progressTitle.textContent = 'Buscando negocios...';
    progressStatus.textContent = 'Iniciando búsqueda en Google Maps';
}

// Fetch final results
async function fetchResults(jobId, category, city, country) {
    try {
        const response = await fetch(`/api/results/${jobId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Error fetching results');
        }

        // Save results to prevent duplicates
        data.results.forEach(business => addScrapedBusiness(business));

        // Add to search history
        addSearchToHistory(category, city, country, data.results.length);

        // Update stats
        updateStats();

        // Display results
        displayResults(data.results, data.skippedCount || 0);

    } catch (error) {
        console.error('Error fetching results:', error);
        showError(error.message);
    }
}

// Display results
function displayResults(results, skipped) {
    // Summary cards
    const withPhone = results.filter(r => r.phone).length;
    const withWebsite = results.filter(r => r.website).length;
    const withSocial = results.filter(r => r.instagram || r.facebook || r.linkedin || r.twitter || r.youtube).length;

    resultsSummary.innerHTML = `
        <div class="summary-card">
            <div class="value">${results.length}</div>
            <div class="label">Nuevos Negocios</div>
        </div>
        <div class="summary-card">
            <div class="value">${skipped}</div>
            <div class="label">Saltados (duplicados)</div>
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
    selectedCountry = null;
    cityInput.placeholder = 'Primero selecciona un país...';
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
