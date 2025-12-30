const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

/**
 * Generate an Excel file from scraped business data
 * @param {Array} data - Array of business objects
 * @param {string} jobId - Unique job identifier
 * @param {string} category - Search category
 * @param {string} city - Search city
 * @param {string} country - Search country
 * @returns {Promise<string>} Path to generated Excel file
 */
async function generateExcel(data, jobId, category, city, country) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Google Maps Lead Scraper';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Leads', {
        properties: { tabColor: { argb: '4F46E5' } }
    });

    // Define columns
    worksheet.columns = [
        { header: '#', key: 'index', width: 5 },
        { header: 'Nombre', key: 'name', width: 35 },
        { header: 'Teléfono', key: 'phone', width: 20 },
        { header: 'Email', key: 'email', width: 35 },
        { header: 'Website', key: 'website', width: 40 },
        { header: 'Dirección', key: 'address', width: 50 },
        { header: 'Rating', key: 'rating', width: 10 },
        { header: 'Reseñas', key: 'reviews', width: 10 },
        { header: 'Instagram', key: 'instagram', width: 35 },
        { header: 'Facebook', key: 'facebook', width: 35 },
        { header: 'LinkedIn', key: 'linkedin', width: 35 },
        { header: 'Google Maps', key: 'mapsLink', width: 50 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4F46E5' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Add data rows
    data.forEach((business, index) => {
        const row = worksheet.addRow({
            index: index + 1,
            name: business.name || '',
            phone: business.phone || '',
            email: business.email || '',
            website: business.website || '',
            address: business.address || '',
            rating: business.rating || '',
            reviews: business.reviews || '',
            instagram: business.instagram || '',
            facebook: business.facebook || '',
            linkedin: business.linkedin || '',
            mapsLink: business.mapsLink || ''
        });

        // Make URLs clickable
        if (business.website) {
            row.getCell('website').value = {
                text: business.website,
                hyperlink: business.website
            };
            row.getCell('website').font = { color: { argb: '0066CC' }, underline: true };
        }

        if (business.instagram) {
            row.getCell('instagram').value = {
                text: business.instagram,
                hyperlink: business.instagram
            };
            row.getCell('instagram').font = { color: { argb: 'E4405F' }, underline: true };
        }

        if (business.facebook) {
            row.getCell('facebook').value = {
                text: business.facebook,
                hyperlink: business.facebook
            };
            row.getCell('facebook').font = { color: { argb: '1877F2' }, underline: true };
        }

        if (business.linkedin) {
            row.getCell('linkedin').value = {
                text: business.linkedin,
                hyperlink: business.linkedin
            };
            row.getCell('linkedin').font = { color: { argb: '0A66C2' }, underline: true };
        }

        if (business.mapsLink) {
            row.getCell('mapsLink').value = {
                text: 'Ver en Maps',
                hyperlink: business.mapsLink
            };
            row.getCell('mapsLink').font = { color: { argb: '34A853' }, underline: true };
        }

        // Alternate row colors
        if (index % 2 === 0) {
            row.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'F8FAFC' }
            };
        }
    });

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Resumen', {
        properties: { tabColor: { argb: '10B981' } }
    });

    summarySheet.columns = [
        { header: 'Campo', key: 'field', width: 25 },
        { header: 'Valor', key: 'value', width: 40 }
    ];

    summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
    summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '10B981' }
    };

    const summaryData = [
        { field: 'Categoría', value: category },
        { field: 'Ciudad', value: city },
        { field: 'País', value: country },
        { field: 'Total Negocios', value: data.length },
        { field: 'Con Teléfono', value: data.filter(b => b.phone).length },
        { field: 'Con Email', value: data.filter(b => b.email).length },
        { field: 'Con Website', value: data.filter(b => b.website).length },
        { field: 'Con Instagram', value: data.filter(b => b.instagram).length },
        { field: 'Con Facebook', value: data.filter(b => b.facebook).length },
        { field: 'Con LinkedIn', value: data.filter(b => b.linkedin).length },
        { field: 'Fecha de Extracción', value: new Date().toLocaleString('es-AR') }
    ];

    summaryData.forEach(row => summarySheet.addRow(row));

    // Ensure output directory exists
    const outputDir = path.join(__dirname, '..', 'output');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate filename
    const sanitizedCategory = category.replace(/[^a-zA-Z0-9]/g, '_');
    const sanitizedCity = city.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `leads_${sanitizedCategory}_${sanitizedCity}_${jobId.slice(0, 8)}.xlsx`;
    const filePath = path.join(outputDir, filename);

    // Save file
    await workbook.xlsx.writeFile(filePath);
    console.log(`📁 Excel saved: ${filePath}`);

    return filePath;
}

module.exports = { generateExcel };
