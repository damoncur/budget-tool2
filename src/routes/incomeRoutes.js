// src/routes/incomeRoutes.js
const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');

router.get('/', incomeController.showHomePage);
router.post('/income-categories', incomeController.createIncomeCategory);
router.get('/api/income-categories', incomeController.getIncomeCategoriesApi);

module.exports = router