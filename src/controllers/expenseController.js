// src/controllers/expenseController.js
const store = require('../data/store');
const expenseService = require('../services/expenseService');
const expenseView = require('../views/expenseView');

function showExpensesPage(req, res) {
  const enrichedItems = store.expenseCategories.map((item) =>
    expenseService.enrichExpenseItem(item)
  );
  const totalMonthly = expenseService.calculateTotalMonthlyExpenses(enrichedItems);
  res.send(expenseView.renderExpensesPage(enrichedItems, totalMonthly));
}

function createExpenseCategory(req, res) {
  const name = (req.body.name || '').trim();
  const type = req.body.type;
  const amount = Number(req.body.amount);

  if (!name) {
    return res.status(400).send('Expense name is required.');
  }

  if (!expenseService.isValidExpenseType(type)) {
    return res.status(400).send('Invalid expense type.');
  }

  if (!Number.isFinite(amount) || amount < 0) {
    return res.status(400).send('Amount must be a valid non-negative number.');
  }

  let termMonths = null;
  let startDate = null;

  if (type === 'fixed-term') {
    termMonths = Number(req.body.termMonths);
    startDate = req.body.startDate;

    if (!Number.isFinite(termMonths) || termMonths <= 0) {
      return res.status(400).send('Term months must be a positive number for fixed-term expenses.');
    }

    if (!startDate || isNaN(new Date(startDate).getTime())) {
      return res.status(400).send('A valid start date is required for fixed-term expenses.');
    }
  }

  const item = {
    id: store.getNextId(),
    name,
    type,
    typeLabel: expenseService.getExpenseTypeLabel(type),
    amount,
    monthlyAmount: expenseService.calculateMonthlyAmount(type, amount),
    termMonths: type === 'fixed-term' ? termMonths : null,
    startDate: type === 'fixed-term' ? startDate : null,
  };

  store.expenseCategories.push(item);
  res.redirect('/expenses');
}

function getExpenseCategoriesApi(req, res) {
  const enrichedItems = store.expenseCategories.map((item) =>
    expenseService.enrichExpenseItem(item)
  );
  const totalMonthlyExpenses = expenseService.calculateTotalMonthlyExpenses(enrichedItems);

  res.json({
    items: enrichedItems,
    totalMonthlyExpenses,
  });
}

module.exports = {
  showExpensesPage,
  createExpenseCategory,
  getExpenseCategoriesApi,
};
