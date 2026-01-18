const express = require('express');
const router = express.Router();
const commonController = require('../controllers/commonController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/exchange-rates', authMiddleware, commonController.getExchangeRates);

module.exports = router;
