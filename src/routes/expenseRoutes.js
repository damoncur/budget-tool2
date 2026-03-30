// src/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.get('/expenses', expenseController.showExpensesPage);
router.post('/expense-categories', expenseController.createExpenseCategory);
router.get('/api/expense-categories', expenseController.getExpenseCategoriesApi);

module.exports = router;
