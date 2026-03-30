// src/routes/forecastRoutes.js
const express = require('express');
const router = express.Router();
const forecastController = require('../controllers/forecastController');

router.get('/forecast', forecastController.showForecastPage);
router.get('/api/forecast', forecastController.getForecastApi);
router.post('/forecast/starting-balance', forecastController.setStartingBalance);

module.exports = router;
