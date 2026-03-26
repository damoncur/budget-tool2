// src/routes/incomeRoutes.js
const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');

router.get('/', incomeController.showHomePage);
router.post('/income-categories', incomeController.createIncomeCategory);
router.post('/income-categories/:id/delete', incomeController.deleteIncomeCategory);
router.get('/income-categories/:id/edit', incomeController.showEditIncomePage);
router.post('/income-categories/:id/edit', incomeController.updateIncomeCategory);
router.get('/api/income-categories', incomeController.getIncomeCategoriesApi);

module.exports = router
