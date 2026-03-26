// src/controllers/expenseController.js
const store = require('../data/store');
const expenseService = require('../services/expenseService');
const expenseView = require('../views/expenseView');

function showExpensePage(req, res) {
  const totalMonthly = expenseService.calculateTotalMonthlyExpenses(store.expenseCategories);
  const expenseTypes = expenseService.getExpenseTypes();
  res.send(expenseView.renderExpensePage(store.expenseCategories, totalMonthly, expenseTypes));
}

function createExpenseCategory(req, res) {
  const name = (req.body.name || '').trim();
  const type = req.body.type;
  const amount = Number(req.body.amount);

  if (!name) {
    return res.status(400).send('Category name is required.');
  }

  if (!expenseService.isValidExpenseType(type)) {
    return res.status(400).send('Invalid expense frequency type.');
  }

  if (!Number.isFinite(amount) || amount < 0) {
    return res.status(400).send('Amount must be a valid non-negative number.');
  }

  const item = {
    id: store.getNextExpenseId(),
    name,
    type,
    typeLabel: expenseService.getExpenseTypeLabel(type),
    amount,
    monthlyEquivalent: expenseService.calculateMonthlyAmount(type, amount),
  };

  store.expenseCategories.push(item);
  store.save();
  res.redirect('/expenses');
}

function deleteExpenseCategory(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).send('Invalid ID.');
  }

  const removed = store.removeExpenseById(id);
  if (!removed) {
    return res.status(404).send('Expense category not found.');
  }

  store.save();
  res.redirect('/expenses');
}

function showEditExpensePage(req, res) {
  const id = Number(req.params.id);
  const item = store.findExpenseById(id);
  if (!item) {
    return res.status(404).send('Expense category not found.');
  }

  const expenseTypes = expenseService.getExpenseTypes();
  res.send(expenseView.renderEditExpensePage(item, expenseTypes));
}

function updateExpenseCategory(req, res) {
  const id = Number(req.params.id);
  const item = store.findExpenseById(id);
  if (!item) {
    return res.status(404).send('Expense category not found.');
  }

  const name = (req.body.name || '').trim();
  const type = req.body.type;
  const amount = Number(req.body.amount);

  if (!name) {
    return res.status(400).send('Category name is required.');
  }

  if (!expenseService.isValidExpenseType(type)) {
    return res.status(400).send('Invalid expense frequency type.');
  }

  if (!Number.isFinite(amount) || amount < 0) {
    return res.status(400).send('Amount must be a valid non-negative number.');
  }

  item.name = name;
  item.type = type;
  item.typeLabel = expenseService.getExpenseTypeLabel(type);
  item.amount = amount;
  item.monthlyEquivalent = expenseService.calculateMonthlyAmount(type, amount);

  store.save();
  res.redirect('/expenses');
}

function getExpenseCategoriesApi(req, res) {
  const totalMonthlyExpenses = expenseService.calculateTotalMonthlyExpenses(store.expenseCategories);

  res.json({
    items: store.expenseCategories,
    totalMonthlyExpenses,
  });
}

module.exports = {
  showExpensePage,
  createExpenseCategory,
  deleteExpenseCategory,
  showEditExpensePage,
  updateExpenseCategory,
  getExpenseCategoriesApi,
};
