// src/controllers/forecastController.js
const store = require('../data/store');
const incomeService = require('../services/incomeService');
const expenseService = require('../services/expenseService');
const forecastService = require('../services/forecastService');
const forecastView = require('../views/forecastView');

function showForecastPage(req, res) {
  const totalMonthlyIncome = incomeService.calculateTotalMonthlyIncome(store.incomeCategories);
  const totalMonthlyExpenses = expenseService.calculateTotalMonthlyExpenses(store.expenseCategories);
  res.send(forecastView.renderForecastPage(store.startingBalance, totalMonthlyIncome, totalMonthlyExpenses));
}

function getForecastApi(req, res) {
  let years = Number(req.query.years);
  if (!Number.isFinite(years) || years < 1) years = 10;
  if (years > 10) years = 10;
  years = Math.round(years);

  let startingBalance = Number(req.query.startingBalance);
  if (!Number.isFinite(startingBalance)) startingBalance = store.startingBalance;

  const totalMonthlyIncome = incomeService.calculateTotalMonthlyIncome(store.incomeCategories);
  const totalMonthlyExpenses = expenseService.calculateTotalMonthlyExpenses(store.expenseCategories);

  const result = forecastService.generateForecast(startingBalance, totalMonthlyIncome, totalMonthlyExpenses, years);
  res.json(result);
}

function setStartingBalance(req, res) {
  const value = Number(req.body.startingBalance);
  if (Number.isFinite(value) && value >= 0) {
    store.startingBalance = value;
    store.save();
  }
  res.redirect('/forecast');
}

module.exports = {
  showForecastPage,
  getForecastApi,
  setStartingBalance,
};
