const axios = require('axios');
const xml2js = require('xml2js');

const TCMB_URL = 'https://www.tcmb.gov.tr/kurlar/today.xml';

async function getExchangeRates() {
    try {
        const response = await axios.get(TCMB_URL);
        const parser = new xml2js.Parser({ explicitArray: false });
        const result = await parser.parseStringPromise(response.data);

        const currencies = result.Tarih_Date.Currency;
        const usd = currencies.find(c => c.$.CurrencyCode === 'USD');
        const eur = currencies.find(c => c.$.CurrencyCode === 'EUR');

        return {
            USD: {
                buying: usd.ForexBuying,
                selling: usd.ForexSelling, // Döviz Satış
            },
            EUR: {
                buying: eur.ForexBuying,
                selling: eur.ForexSelling, // Döviz Satış
            }
        };
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        throw error;
    }
}

module.exports = {
    getExchangeRates,
};
