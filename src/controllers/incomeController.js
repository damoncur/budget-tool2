// src/controllers/incomeController.js
const store = require('../data/store');
const incomeService = require('../services/incomeService');
const incomeView = require('../views/incomeView');

function showHomePage(req, res) {
  const totalMonthly = incomeService.calculateTotalMonthlyIncome(store.incomeCategories);
  res.send(incomeView.renderHomePage(store.incomeCategories, totalMonthly));
}

function createIncomeCategory(req, res) {
  const name = (req.body.name || '').trim();
  const type = req.body.type;
  const amount = Number(req.body.amount);

  if (!name) {
    return res.status(400).send('Category name is required.');
  }

  if (!incomeService.isValidIncomeType(type)) {
    return res.status(400).send('Invalid income type.');
  }

  if (!Number.isFinite(amount) || amount < 0) {
    return res.status(400).send('Amount must be a valid non-negative number.');
  }

  const item = {
    id: store.getNextId(),
    name,
    type,
    typeLabel: incomeService.getIncomeTypeLabel(type),
    amount,
    monthlyEquivalent: incomeService.calculateMonthlyAmount(type, amount),
  };

  store.incomeCategories.push(item);
  res.redirect('/');
}

function getIncomeCategoriesApi(req, res) {
  const totalMonthlyIncome = incomeService.calculateTotalMonthlyIncome(store.incomeCategories);

  res.json({
    items: store.incomeCategories,
    totalMonthlyIncome,
  });
}

module.exports = {
  showHomePage,
  createIncomeCategory,
  getIncomeCategoriesApi,
};