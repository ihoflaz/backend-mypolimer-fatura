const tcmbService = require('../services/tcmbService');

exports.getExchangeRates = async (req, res) => {
    try {
        const rates = await tcmbService.getExchangeRates();
        res.json(rates);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
