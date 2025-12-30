const puppeteer = require('puppeteer');

/**
 * Scrape a business website for email and social media links
 * @param {string} websiteUrl - The website URL to scrape
 * @returns {Promise<Object>} Object with email and social media links
 */
async function scrapeWebsite(websiteUrl) {
    const result = {
        email: '',
        instagram: '',
        facebook: '',
        linkedin: ''
    };

    if (!websiteUrl || websiteUrl.includes('google.com')) {
        return result;
    }

    let browser = null;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });

        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // Set a short timeout for website scraping
        await page.goto(websiteUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 15000
        });

        await delay(2000);

        // Extract data from the page
        const pageData = await page.evaluate(() => {
            const data = {
                email: '',
                instagram: '',
                facebook: '',
                linkedin: ''
            };

            const html = document.documentElement.innerHTML;
            const text = document.body?.innerText || '';

            // Email patterns
            const emailPatterns = [
                /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g,
                /mailto:([\w.-]+@[\w.-]+\.[a-zA-Z]{2,})/g
            ];

            // Find emails in mailto links first (most reliable)
            const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
            for (const link of mailtoLinks) {
                const email = link.href.replace('mailto:', '').split('?')[0];
                if (email && !email.includes('example') && !email.includes('sentry')) {
                    data.email = email;
                    break;
                }
            }

            // If no mailto, search in text
            if (!data.email) {
                const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
                if (emailMatch && !emailMatch[0].includes('example') && !emailMatch[0].includes('sentry')) {
                    data.email = emailMatch[0];
                }
            }

            // Social media links
            const allLinks = document.querySelectorAll('a[href]');
            for (const link of allLinks) {
                const href = link.href.toLowerCase();

                if (href.includes('instagram.com/') && !href.includes('/p/') && !data.instagram) {
                    data.instagram = link.href;
                }

                if (href.includes('facebook.com/') && !href.includes('/sharer') && !data.facebook) {
                    data.facebook = link.href;
                }

                if (href.includes('linkedin.com/') && !href.includes('/share') && !data.linkedin) {
                    data.linkedin = link.href;
                }
            }

            return data;
        });

        Object.assign(result, pageData);

        // Also check common pages like /contact, /about
        if (!result.email) {
            const contactPages = ['/contact', '/contacto', '/about', '/sobre-nosotros'];
            for (const contactPath of contactPages) {
                try {
                    const contactUrl = new URL(contactPath, websiteUrl).href;
                    await page.goto(contactUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
                    await delay(1000);

                    const contactData = await page.evaluate(() => {
                        const mailtoLinks = document.querySelectorAll('a[href^="mailto:"]');
                        for (const link of mailtoLinks) {
                            const email = link.href.replace('mailto:', '').split('?')[0];
                            if (email && !email.includes('example')) {
                                return email;
                            }
                        }

                        const text = document.body?.innerText || '';
                        const match = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
                        return match ? match[0] : '';
                    });

                    if (contactData && !contactData.includes('example')) {
                        result.email = contactData;
                        break;
                    }
                } catch (e) {
                    // Contact page might not exist
                }
            }
        }

    } catch (error) {
        // Website might be unreachable or have errors
        console.log(`  ⚠ Could not scrape website: ${websiteUrl}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }

    return result;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { scrapeWebsite };
