// src/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.get('/expenses', expenseController.showExpensePage);
router.post('/expense-categories', expenseController.createExpenseCategory);
router.post('/expense-categories/:id/delete', expenseController.deleteExpenseCategory);
router.get('/expense-categories/:id/edit', expenseController.showEditExpensePage);
router.post('/expense-categories/:id/edit', expenseController.updateExpenseCategory);
router.get('/api/expense-categories', expenseController.getExpenseCategoriesApi);

module.exports = router;
