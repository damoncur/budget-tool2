// src/controllers/incomeController.js
const store = require('../data/store');
const incomeService = require('../services/incomeService');
const expenseService = require('../services/expenseService');
const groupAssetService = require('../services/groupAssetService');
const incomeView = require('../views/incomeView');

function showHomePage(req, res) {
  const totalMonthlyIncome = incomeService.calculateTotalMonthlyIncome(store.incomeCategories);
  const totalMonthlyExpenses = expenseService.calculateTotalMonthlyExpenses(store.expenseCategories);
  const totalGroupAssets = groupAssetService.calculateTotalValue(store.groupAssets);
  res.send(incomeView.renderHomePage(store.incomeCategories, totalMonthlyIncome, totalMonthlyExpenses, store.groupAssets, totalGroupAssets));
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
  store.save();
  res.redirect('/');
}

function deleteIncomeCategory(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).send('Invalid ID.');
  }

  const removed = store.removeIncomeById(id);
  if (!removed) {
    return res.status(404).send('Income category not found.');
  }

  store.save();
  res.redirect('/');
}

function showEditIncomePage(req, res) {
  const id = Number(req.params.id);
  const item = store.findIncomeById(id);
  if (!item) {
    return res.status(404).send('Income category not found.');
  }

  res.send(incomeView.renderEditIncomePage(item));
}

function updateIncomeCategory(req, res) {
  const id = Number(req.params.id);
  const item = store.findIncomeById(id);
  if (!item) {
    return res.status(404).send('Income category not found.');
  }

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

  item.name = name;
  item.type = type;
  item.typeLabel = incomeService.getIncomeTypeLabel(type);
  item.amount = amount;
  item.monthlyEquivalent = incomeService.calculateMonthlyAmount(type, amount);

  store.save();
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
  deleteIncomeCategory,
  showEditIncomePage,
  updateIncomeCategory,
  getIncomeCategoriesApi,
};
