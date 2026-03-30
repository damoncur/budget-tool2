// src/services/expenseService.js

const EXPENSE_TYPES = {
  weekly: { label: 'Weekly', factor: 52 / 12 },
  biweekly: { label: 'Biweekly', factor: 26 / 12 },
  monthly: { label: 'Monthly', factor: 1 },
  quarterly: { label: 'Quarterly', factor: 1 / 3 },
  yearly: { label: 'Yearly (Annual)', factor: 1 / 12 },
};

function calculateMonthlyAmount(type, amount) {
  const value = Number(amount) || 0;
  const config = EXPENSE_TYPES[type];
  if (!config) return 0;
  return value * config.factor;
}

function getExpenseTypeLabel(type) {
  const config = EXPENSE_TYPES[type];
  return config ? config.label : 'Unknown';
}

function isValidExpenseType(type) {
  return Object.hasOwn(EXPENSE_TYPES, type);
}

function calculateTotalMonthlyExpenses(items) {
  return items.reduce((sum, item) => sum + item.monthlyEquivalent, 0);
}

function getExpenseTypes() {
  return Object.entries(EXPENSE_TYPES).map(([value, { label }]) => ({
    value,
    label,
  }));
}

// Fixed-term expense helpers

/**
 * Calculate how many payments have been made based on start date and current date.
 * @param {string} startDate - YYYY-MM format
 * @returns {number} months elapsed (minimum 0)
 */
function calculatePaymentsMade(startDate) {
  const [year, month] = startDate.split('-').map(Number);
  const now = new Date();
  const elapsed = (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month);
  return Math.max(0, elapsed);
}

/**
 * Calculate remaining payments.
 */
function calculatePaymentsRemaining(totalPayments, startDate) {
  const made = calculatePaymentsMade(startDate);
  return Math.max(0, totalPayments - made);
}

/**
 * Calculate the maturity date (YYYY-MM) from start date + total payments.
 */
function calculateMaturityDate(startDate, totalPayments) {
  const [year, month] = startDate.split('-').map(Number);
  const totalMonths = (year * 12 + month - 1) + totalPayments;
  const matYear = Math.floor(totalMonths / 12);
  const matMonth = (totalMonths % 12) + 1;
  return `${matYear}-${String(matMonth).padStart(2, '0')}`;
}

/**
 * Enrich a stored expense item with derived fields based on current date.
 * Call this at render time, not at creation time.
 */
function enrichExpense(item) {
  const paymentsRemaining = calculatePaymentsRemaining(item.totalPayments, item.startDate);
  const paymentsMade = item.totalPayments - paymentsRemaining;
  const matured = paymentsRemaining === 0;
  return {
    ...item,
    paymentsMade,
    paymentsRemaining,
    remainingCost: item.monthlyPayment * paymentsRemaining,
    matured,
    maturityDate: calculateMaturityDate(item.startDate, item.totalPayments),
    activeMonthlyPayment: matured ? 0 : item.monthlyPayment,
  };
}

/**
 * Calculate total monthly expenses from enriched items (only active/non-matured).
 */
function calculateTotalMonthlyFixedTermExpenses(enrichedItems) {
  return enrichedItems.reduce((sum, item) => sum + item.activeMonthlyPayment, 0);
}

/**
 * Validate start date format (YYYY-MM).
 */
function isValidStartDate(startDate) {
  if (!/^\d{4}-\d{2}$/.test(startDate)) return false;
  const [year, month] = startDate.split('-').map(Number);
  return month >= 1 && month <= 12 && year >= 1900 && year <= 2100;
}

module.exports = {
  calculateMonthlyAmount,
  getExpenseTypeLabel,
  isValidExpenseType,
  calculateTotalMonthlyExpenses,
  getExpenseTypes,
  calculatePaymentsMade,
  calculatePaymentsRemaining,
  calculateMaturityDate,
  enrichExpense,
  calculateTotalMonthlyFixedTermExpenses,
  isValidStartDate,
};
