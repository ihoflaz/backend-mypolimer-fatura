const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
// Conditionally load puppeteer/chromium
const chromium = require('@sparticuz/chromium');
const puppeteerCore = require('puppeteer-core');
// Standard puppeteer for local dev fallback requires a try-catch for import if not needed, 
// but since we have it installed, we can just require it conditionally or check env.
// A simpler dual-mode approach:

let browser;

// URL'den görsel indirip base64'e çeviren yardımcı fonksiyon
async function fetchImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (response) => {
            const chunks = [];
            response.on('data', (chunk) => chunks.push(chunk));
            response.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const contentType = response.headers['content-type'] || 'image/png';
                const base64 = buffer.toString('base64');
                resolve(`data:${contentType};base64,${base64}`);
            });
            response.on('error', reject);
        }).on('error', reject);
    });
}

async function getBrowser() {
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
        // Vercel / Lambda environment
        return puppeteerCore.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
    } else {
        // Local environment
        const puppeteer = require('puppeteer');
        return puppeteer.launch({ headless: 'new' });
    }
}

async function generateInvoicePDF(invoiceData, companySettings) {
    try {
        const browser = await getBrowser();
        const page = await browser.newPage();

        // Logo işleme (Sol üst köşe için)
        let logoBase64 = '';
        if (companySettings.logo_path) {
            try {
                // Cloudinary URL veya yerel dosya kontrolü
                if (companySettings.logo_path.startsWith('http')) {
                    logoBase64 = await fetchImageAsBase64(companySettings.logo_path);
                } else {
                    const logoPath = path.resolve(companySettings.logo_path);
                    if (fs.existsSync(logoPath)) {
                        const logoData = fs.readFileSync(logoPath).toString('base64');
                        const ext = path.extname(logoPath).substring(1);
                        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                        logoBase64 = `data:${mimeType};base64,${logoData}`;
                    }
                }
            } catch (err) {
                console.error('Logo yükleme hatası:', err);
            }
        }

        // Watermark işleme (Filigran için ayrı görsel)
        let watermarkBase64 = '';
        if (companySettings.watermark_path) {
            try {
                // Cloudinary URL veya yerel dosya kontrolü
                if (companySettings.watermark_path.startsWith('http')) {
                    watermarkBase64 = await fetchImageAsBase64(companySettings.watermark_path);
                } else {
                    const watermarkPath = path.resolve(companySettings.watermark_path);
                    if (fs.existsSync(watermarkPath)) {
                        const watermarkData = fs.readFileSync(watermarkPath).toString('base64');
                        const ext = path.extname(watermarkPath).substring(1);
                        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
                        watermarkBase64 = `data:${mimeType};base64,${watermarkData}`;
                    }
                }
            } catch (err) {
                console.error('Watermark yükleme hatası:', err);
            }
        }
        // Eğer watermark yoksa, logo'yu filigran olarak kullan
        if (!watermarkBase64 && logoBase64) {
            watermarkBase64 = logoBase64;
        }

        // Tarih formatlama (DD.MM.YYYY)
        const formatDate = (dateStr) => {
            const date = new Date(dateStr);
            return date.toLocaleDateString('tr-TR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        };

        // Para birimi formatlama
        const formatCurrency = (amount, curr = 'USD') => {
            let symbol = '$';
            if (curr === 'EUR') symbol = '€';
            else if (curr === 'TRY') symbol = 'TL ';  // ₺ yerine TL kullan (Vercel Chromium font sorunu)
            else if (curr === 'USD') symbol = '$';

            const formatted = Number(amount).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            // TRY için sembol sona gelsin: 1,000.00 TL
            if (curr === 'TRY') {
                return `${formatted} TL`;
            }
            return `${symbol}${formatted}`;
        };

        // Miktar formatlama
        const formatQuantity = (qty) => {
            return Number(qty).toLocaleString('de-DE', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
            });
        };
        // Para birimi - faturadan al (Sequelize model'den)
        const invoiceCurrency = invoiceData.currency || invoiceData.dataValues?.currency || 'USD';
        console.log('Invoice currency value:', invoiceCurrency, 'Type:', typeof invoiceCurrency);
        const currency = invoiceCurrency;

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="tr">
            <head>
                <meta charset="UTF-8">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: Arial, Helvetica, sans-serif;
                        font-size: 10px;
                        color: #000;
                        padding: 20px 25px;
                        position: relative;
                    }

                    /* ========== 1. EN ÜST BAŞLIK ========== */
                    .page-title {
                        text-align: center;
                        font-size: 22px;
                        font-weight: bold;
                        color: #000;
                        text-transform: uppercase;
                        margin-bottom: 20px;
                        /* Altı çizgi kaldırıldı */
                    }

                    /* ========== 2. LOGO VE ŞİRKET BAŞLIĞI ========== */
                    .header-row {
                        display: flex;
                        align-items: center;
                        margin-bottom: 20px;
                    }

                    .logo-box {
                        width: 80px;
                        height: 80px;
                        margin-right: 15px;
                        flex-shrink: 0;
                        background-color: #000;
                        padding: 2px;
                    }

                    .logo-box img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    }

                    .company-title {
                        font-size: 13px;
                        font-weight: bold;
                        color: #000;
                        text-transform: uppercase;
                    }

                    /* ========== SARI ŞERİT (Kurumun/Müşterinin) ========== */
                    .section-strip {
                        background-color: rgb(248, 194, 36);
                        padding: 3px 10px;
                        margin-bottom: 0;
                    }

                    .section-strip-label {
                        font-size: 10px;
                        font-weight: bold;
                        color: #000;
                        /* İtalik kaldırıldı */
                    }

                    /* ========== 3. KURUMUN BÖLÜMÜ ========== */
                    .info-block {
                        padding: 5px 10px;
                        font-size: 9px;
                        line-height: 1.3;
                        border: 1px solid #ccc;
                        border-top: none;
                        margin-bottom: 10px;
                    }

                    .info-grid {
                        display: table;
                        font-size: 9px;
                    }

                    .info-row {
                        display: table-row;
                    }

                    .info-row .i-label {
                        display: table-cell;
                        font-weight: bold;
                        text-transform: uppercase;
                        padding: 1px 15px 1px 0;
                        white-space: nowrap;
                    }

                    .info-row .i-value {
                        display: table-cell;
                        padding: 1px 0;
                    }

                    /* ========== 4. SİP SIRA NO (Dışarıda, sağa yaslı) ========== */
                    .order-info-box {
                        text-align: right;
                        font-size: 10px;
                        margin-bottom: 10px;
                    }

                    .sip-no {
                        font-weight: bold;
                        color: #000;
                    }

                    /* ========== 5. SİPARİŞ TABLOSU ========== */
                    .table-container {
                        position: relative;
                        margin-bottom: 20px;
                    }

                    .watermark {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        opacity: 0.08;
                        z-index: 0;
                        width: 60%;
                        pointer-events: none;
                    }

                    .products-table {
                        width: 100%;
                        border-collapse: collapse;
                        position: relative;
                        z-index: 1;
                    }

                    .products-table thead th {
                        background-color: rgb(79, 129, 189);
                        color: #fff;
                        font-weight: bold;
                        padding: 10px 6px;
                        text-align: center;
                        text-transform: uppercase;
                        font-size: 9px;
                        border: 1px solid rgb(60, 100, 150);
                    }

                    .products-table tbody td {
                        padding: 10px 6px;
                        border: 1px solid #CBD5E0;
                        font-size: 9px;
                    }

                    .products-table tbody tr:nth-child(odd) {
                        background-color: rgba(79, 129, 189, 0.1);
                    }

                    .products-table tbody tr:nth-child(even) {
                        background-color: transparent;
                    }

                    .products-table tbody td:first-child {
                        text-align: left;
                    }

                    .products-table tbody td:not(:first-child) {
                        text-align: center;
                    }

                    .products-table tfoot td {
                        padding: 10px 6px;
                        border: 1px solid #CBD5E0;
                        font-size: 10px;
                        background-color: #fff;
                    }

                    .total-label {
                        text-align: right;
                        font-weight: bold;
                    }

                    .total-value {
                        text-align: center;
                        font-weight: bold;
                    }

                    /* ========== 6. BANKA HESAPLARI ========== */
                    .bank-section {
                        margin-top: 25px;
                    }

                    .bank-title {
                        font-size: 10px;
                        font-weight: bold;
                        margin-bottom: 10px;
                        text-transform: uppercase;
                    }

                    .bank-block {
                        border: 2px solid #000;
                        margin-bottom: 8px;
                    }

                    .bank-row {
                        display: flex;
                        border-bottom: 1px solid #000;
                    }

                    .bank-row:last-child {
                        border-bottom: none;
                    }

                    .bank-label {
                        width: 70px;
                        font-weight: bold;
                        padding: 4px 8px;
                        font-size: 9px;
                        border-right: 1px solid #000;
                        background-color: #f0f0f0;
                    }

                    .bank-value {
                        flex: 1;
                        padding: 4px 8px;
                        font-size: 9px;
                    }

                    /* ========== 7. FOOTER ========== */
                    .foreign-note {
                        font-size: 9px;
                        font-style: italic;
                        color: #333;
                        margin-top: 12px;
                        text-align: left;
                    }

                    .footer-message {
                        text-align: center;
                        font-size: 11px;
                        font-weight: bold;
                        color: #000;
                        margin-top: 30px;
                    }
                </style>
            </head>
            <body>

                <!-- 1. EN ÜST BAŞLIK (altı çizgi yok) -->
                <div class="page-title">SİPARİŞ FORMU</div>

                <!-- 2. LOGO VE ŞİRKET BAŞLIĞI -->
                <div class="header-row">
                    <div class="logo-box">
                        ${logoBase64 ? `<img src="${logoBase64}" alt="Logo" />` : ''}
                    </div>
                    <div class="company-title">${companySettings.company_name || ''}</div>
                </div>

                <!-- 3. KURUMUN BÖLÜMÜ -->
                <div class="section-strip">
                    <span class="section-strip-label">Kurumun</span>
                </div>
                <div class="info-block">
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="i-label">ÜNVAN:</span>
                            <span class="i-value">${companySettings.company_name || ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="i-label">ADRES:</span>
                            <span class="i-value">${companySettings.address || ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="i-label">ŞEHİR:</span>
                            <span class="i-value">${companySettings.city || ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="i-label">VERGİ DAİRESİ:</span>
                            <span class="i-value">${companySettings.tax_office || ''} ${companySettings.tax_id || ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="i-label">TİC.SİCİL NO:</span>
                            <span class="i-value">${companySettings.trade_registry_no || ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="i-label">E-MAIL:</span>
                            <span class="i-value">${companySettings.email || ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="i-label">TEL:</span>
                            <span class="i-value">${companySettings.phone || ''}</span>
                        </div>
                    </div>
                </div>

                <!-- 4. MÜŞTERİNİN BÖLÜMÜ -->
                <div class="section-strip">
                    <span class="section-strip-label">Müşterinin</span>
                </div>
                <div class="info-block">
                    <div class="info-grid">
                        <div class="info-row">
                            <span class="i-label">ÜNVAN:</span>
                            <span class="i-value">${invoiceData.Customer?.company_title || invoiceData.Customer?.name || ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="i-label">ADRES:</span>
                            <span class="i-value">${invoiceData.Customer?.address || ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="i-label">ŞEHİR:</span>
                            <span class="i-value">${invoiceData.Customer?.city || ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="i-label">VERGİ DAİRESİ:</span>
                            <span class="i-value">${invoiceData.Customer?.tax_office || ''}</span>
                        </div>
                        <div class="info-row">
                            <span class="i-label">VKN:</span>
                            <span class="i-value">${invoiceData.Customer?.tax_number || invoiceData.Customer?.tax_id || ''}</span>
                        </div>
                    </div>
                </div>

                <!-- SİP SIRA NO (Müşterinin dışında, sağa yaslı) -->
                <div class="order-info-box">
                    <div class="sip-no">SİP SIRA NO:${invoiceData.invoice_no}</div>
                    <div>${formatDate(invoiceData.date)}</div>
                </div>

                <!-- 5. SİPARİŞ TABLOSU -->
                <div class="table-container">
                    ${watermarkBase64 ? `<img src="${watermarkBase64}" class="watermark" />` : ''}
                    <table class="products-table">
                        <thead>
                            <tr>
                                <th style="width: 28%;">AÇIKLAMA</th>
                                <th style="width: 15%;">MİKTAR (KG)</th>
                                <th style="width: 15%;">FİYAT</th>
                                <th style="width: 20%;">TUTAR</th>
                                <th style="width: 22%;">TESLİM YERİ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(invoiceData.InvoiceItems || []).map(item => {
            // KDV Dahil ise fiyatı %20 artır, Antrepolu Devir ise aynı kalır
            const displayPrice = invoiceData.is_vat_included
                ? Number(item.unit_price) * 1.20
                : Number(item.unit_price);
            const displayTotal = invoiceData.is_vat_included
                ? Number(item.line_total) * 1.20
                : Number(item.line_total);
            return `
                                <tr>
                                    <td>${item.Product?.product_name || ''}</td>
                                    <td>${formatQuantity(item.quantity)}</td>
                                    <td>${formatCurrency(displayPrice, currency)}</td>
                                    <td>${formatCurrency(displayTotal, currency)}</td>
                                    <td>${item.delivery_location || ''}</td>
                                </tr>
                            `}).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2"></td>
                                <td class="total-label">TOPLAM:</td>
                                <td class="total-value">${formatCurrency(invoiceData.is_vat_included ? Number(invoiceData.total_amount_currency) * 1.20 : invoiceData.total_amount_currency, currency)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- SİPARİŞ NOTU -->
                ${invoiceData.notes ? `
                <div style="margin: 15px 0; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9;">
                    <div style="font-weight: bold; font-size: 10px; margin-bottom: 5px;">SİPARİŞ NOTU:</div>
                    <div style="font-size: 9px; white-space: pre-wrap;">${invoiceData.notes}</div>
                </div>
                ` : ''}

                <!-- 6. BANKA HESAPLARI -->
                <div class="bank-section">
                    <div class="bank-title">BANKA HESAPLARIMIZ</div>
                    
                    ${(companySettings.bank_accounts || []).map(bank => `
                        <div class="bank-block">
                            <div class="bank-row">
                                <div class="bank-label">BANKA:</div>
                                <div class="bank-value">${bank.bank_name || ''} ${bank.branch_name ? '/ ' + bank.branch_name : ''}</div>
                            </div>
                            <div class="bank-row">
                                <div class="bank-label">AD:</div>
                                <div class="bank-value">${bank.account_holder || companySettings.company_name || ''}</div>
                            </div>
                            <div class="bank-row">
                                <div class="bank-label">TL IBAN:</div>
                                <div class="bank-value">${bank.iban_tl || ''}</div>
                            </div>
                        </div>
                    `).join('')}

                    <!-- 7. FOOTER -->
                    <div class="foreign-note">DÖVİZ IBANLARIMIZ İÇİN BİZİMLE İLETİŞİME GEÇİNİZ</div>
                </div>

                <div class="footer-message">ONAYINIZI BEKLER HAYIRLI İŞLER DİLERİZ.</div>

            </body>
            </html>
        `;

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '15mm',
                bottom: '15mm',
                left: '15mm',
                right: '15mm'
            }
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        console.error('PDF oluşturma hatası:', error);
        throw error;
    }
}

module.exports = {
    generateInvoicePDF,
};
