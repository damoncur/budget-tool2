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

  let termMonths = null;
  let remainingMonths = null;

  if (type === 'fixed-term') {
    termMonths = Number(req.body.termMonths);
    remainingMonths = Number(req.body.remainingMonths);

    if (!Number.isInteger(termMonths) || termMonths <= 0) {
      return res.status(400).send('Term months must be a positive integer.');
    }

    if (!Number.isInteger(remainingMonths) || remainingMonths < 0 || remainingMonths > termMonths) {
      return res.status(400).send('Remaining months must be between 0 and term months.');
    }
  }

  const monthlyAmount = expenseService.calculateMonthlyAmount(type, amount);

  const item = {
    id: store.getNextExpenseId(),
    name,
    type,
    typeLabel: expenseService.getExpenseTypeLabel(type),
    amount,
    monthlyAmount,
    monthlyEquivalent: monthlyAmount,
    termMonths: type === 'fixed-term' ? termMonths : null,
    remainingMonths: type === 'fixed-term' ? remainingMonths : null,
    totalRemaining: type === 'fixed-term' ? amount * remainingMonths : null,
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

  let termMonths = null;
  let remainingMonths = null;

  if (type === 'fixed-term') {
    termMonths = Number(req.body.termMonths);
    remainingMonths = Number(req.body.remainingMonths);

    if (!Number.isInteger(termMonths) || termMonths <= 0) {
      return res.status(400).send('Term months must be a positive integer.');
    }

    if (!Number.isInteger(remainingMonths) || remainingMonths < 0 || remainingMonths > termMonths) {
      return res.status(400).send('Remaining months must be between 0 and term months.');
    }
  }

  const monthlyAmount = expenseService.calculateMonthlyAmount(type, amount);

  item.name = name;
  item.type = type;
  item.typeLabel = expenseService.getExpenseTypeLabel(type);
  item.amount = amount;
  item.monthlyAmount = monthlyAmount;
  item.monthlyEquivalent = monthlyAmount;
  item.termMonths = type === 'fixed-term' ? termMonths : null;
  item.remainingMonths = type === 'fixed-term' ? remainingMonths : null;
  item.totalRemaining = type === 'fixed-term' ? amount * remainingMonths : null;

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

// Fixed-term expense handlers

function createFixedTermExpense(req, res) {
  const name = (req.body.name || '').trim();
  const monthlyPayment = Number(req.body.monthlyPayment);
  const totalPayments = Number(req.body.totalPayments);
  const startDate = (req.body.startDate || '').trim(); // YYYY-MM format

  if (!name) {
    return res.status(400).send('Expense name is required.');
  }

  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) {
    return res.status(400).send('Monthly payment must be a positive number.');
  }

  if (!Number.isInteger(totalPayments) || totalPayments <= 0) {
    return res.status(400).send('Total payments must be a positive integer.');
  }

  if (!expenseService.isValidStartDate(startDate)) {
    return res.status(400).send('Start date must be in YYYY-MM format.');
  }

  // Store only static/immutable data — derived fields are calculated at render time
  const item = {
    id: store.getNextFixedTermId(),
    name,
    monthlyPayment,
    totalPayments,
    startDate,
  };

  store.fixedTermExpenses.push(item);
  store.save();
  res.redirect('/');
}

function getFixedTermExpensesApi(req, res) {
  const enriched = store.fixedTermExpenses.map(expenseService.enrichExpense);
  const totalMonthlyExpenses = expenseService.calculateTotalMonthlyFixedTermExpenses(enriched);
  res.json({
    items: enriched,
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
  createFixedTermExpense,
  getFixedTermExpensesApi,
};
