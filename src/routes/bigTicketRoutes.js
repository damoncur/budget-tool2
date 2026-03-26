// src/routes/bigTicketRoutes.js
const express = require('express');
const router = express.Router();
const bigTicketController = require('../controllers/bigTicketController');

router.post('/big-ticket-expenses', bigTicketController.createBigTicketExpense);
router.post('/big-ticket-expenses/:id/delete', bigTicketController.deleteBigTicketExpense);
router.get('/api/big-ticket-expenses', bigTicketController.getBigTicketExpensesApi);

module.exports = router;
