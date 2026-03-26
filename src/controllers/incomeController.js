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

  let item;

  if (type === 'asset-withdrawal') {
    const assetValue = Number(req.body.assetValue);
    const growthRatePercent = Number(req.body.growthRate);
    const withdrawalFrequency = req.body.withdrawalFrequency;

    if (!Number.isFinite(assetValue) || assetValue <= 0) {
      return res.status(400).send('Asset value must be a finite positive number.');
    }
    if (!Number.isFinite(growthRatePercent) || growthRatePercent < 0) {
      return res.status(400).send('Growth rate must be a finite non-negative number.');
    }
    if (!incomeService.isValidWithdrawalFrequency(withdrawalFrequency)) {
      return res.status(400).send('Invalid withdrawal frequency.');
    }

    const growthRateDecimal = growthRatePercent / 100;
    const monthlyEquivalent = incomeService.calculateMonthlyFromFrequency(withdrawalFrequency, amount);
    const withdrawalRate = incomeService.calculateWithdrawalRate(assetValue, monthlyEquivalent);
    const netRate = growthRateDecimal - withdrawalRate;

    const durationMonths = incomeService.calculateAssetDurationMonths(assetValue, growthRateDecimal, monthlyEquivalent);

    item = {
      id: store.getNextId(),
      name,
      type,
      typeLabel: incomeService.getIncomeTypeLabel(type),
      amount,
      assetValue,
      growthRate: growthRateDecimal,
      withdrawalFrequency,
      withdrawalRate,
      netRate,
      durationMonths,
      monthlyEquivalent,
    };
  } else {
    item = {
      id: store.getNextId(),
      name,
      type,
      typeLabel: incomeService.getIncomeTypeLabel(type),
      amount,
      monthlyEquivalent: incomeService.calculateMonthlyAmount(type, amount),
    };
  }

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

  if (type === 'asset-withdrawal') {
    const assetValue = Number(req.body.assetValue);
    const growthRatePercent = Number(req.body.growthRate);
    const withdrawalFrequency = req.body.withdrawalFrequency;

    if (!Number.isFinite(assetValue) || assetValue <= 0) {
      return res.status(400).send('Asset value must be a finite positive number.');
    }
    if (!Number.isFinite(growthRatePercent) || growthRatePercent < 0) {
      return res.status(400).send('Growth rate must be a finite non-negative number.');
    }
    if (!incomeService.isValidWithdrawalFrequency(withdrawalFrequency)) {
      return res.status(400).send('Invalid withdrawal frequency.');
    }

    const growthRateDecimal = growthRatePercent / 100;
    const monthlyEquivalent = incomeService.calculateMonthlyFromFrequency(withdrawalFrequency, amount);
    const withdrawalRate = incomeService.calculateWithdrawalRate(assetValue, monthlyEquivalent);
    const netRate = growthRateDecimal - withdrawalRate;

    // Mutate item only after all validation passes
    const durationMonths = incomeService.calculateAssetDurationMonths(assetValue, growthRateDecimal, monthlyEquivalent);

    item.name = name;
    item.type = type;
    item.typeLabel = incomeService.getIncomeTypeLabel(type);
    item.amount = amount;
    item.assetValue = assetValue;
    item.growthRate = growthRateDecimal;
    item.withdrawalFrequency = withdrawalFrequency;
    item.withdrawalRate = withdrawalRate;
    item.netRate = netRate;
    item.durationMonths = durationMonths;
    item.monthlyEquivalent = monthlyEquivalent;
  } else {
    // Mutate item only after all validation passes
    item.name = name;
    item.type = type;
    item.typeLabel = incomeService.getIncomeTypeLabel(type);
    item.amount = amount;
    item.monthlyEquivalent = incomeService.calculateMonthlyAmount(type, amount);
    // Clear asset-withdrawal fields if type changed
    delete item.assetValue;
    delete item.growthRate;
    delete item.withdrawalFrequency;
    delete item.withdrawalRate;
    delete item.netRate;
    delete item.durationMonths;
  }

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
