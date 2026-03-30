// src/controllers/bigTicketController.js
const store = require('../data/store');
const bigTicketService = require('../services/bigTicketService');

function createBigTicketExpense(req, res) {
  const name = (req.body.name || '').trim();
  const cost = Number(req.body.cost);
  const targetDate = (req.body.targetDate || '').trim(); // YYYY-MM format
  const fundedByAssetId = req.body.fundedByAssetId ? Number(req.body.fundedByAssetId) : null;

  // Validate name
  if (!name) return res.status(400).send('Expense name is required.');

  // Validate cost
  if (!Number.isFinite(cost) || cost <= 0) return res.status(400).send('Cost must be a positive number.');

  // Validate target date
  if (!bigTicketService.isValidTargetDate(targetDate)) return res.status(400).send('Target date must be a future date in YYYY-MM format.');

  // Validate funded-by asset (if provided)
  if (fundedByAssetId !== null) {
    const asset = store.incomeCategories.find(i => i.id === fundedByAssetId && i.type === 'asset-withdrawal');
    if (!asset) return res.status(400).send('Invalid asset ID.');
  }

  const monthsUntilDue = bigTicketService.calculateMonthsUntilDue(targetDate);

  const item = {
    id: store.getNextBigTicketId(),
    name,
    cost,
    targetDate,
    fundedByAssetId,
    monthsUntilDue,
    monthlySetAside: fundedByAssetId ? null : bigTicketService.calculateMonthlySetAside(cost, monthsUntilDue),
  };

  store.bigTicketExpenses.push(item);
  store.save();
  res.redirect('/');
}

function deleteBigTicketExpense(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).send('Invalid ID.');
  }

  const removed = store.removeBigTicketById(id);
  if (!removed) {
    return res.status(404).send('Big ticket expense not found.');
  }

  store.save();
  res.redirect('/');
}

function getBigTicketExpensesApi(req, res) {
  res.json({ items: store.bigTicketExpenses });
}

module.exports = { createBigTicketExpense, deleteBigTicketExpense, getBigTicketExpensesApi };
