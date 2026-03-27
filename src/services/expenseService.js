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

function calculateRemainingCost(monthlyPayment, paymentsRemaining) {
  return monthlyPayment * paymentsRemaining;
}

function calculateTotalMonthlyFixedTermExpenses(items) {
  return items.reduce((sum, item) => sum + item.monthlyPayment, 0);
}

function isValidFixedTermExpenseInput(name, monthlyPayment, paymentsRemaining) {
  if (!name || !name.trim()) return { valid: false, message: 'Expense name is required.' };
  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) return { valid: false, message: 'Monthly payment must be a positive number.' };
  if (!Number.isInteger(paymentsRemaining) || paymentsRemaining <= 0) return { valid: false, message: 'Payments remaining must be a positive integer.' };
  return { valid: true };
}

module.exports = {
  calculateMonthlyAmount,
  getExpenseTypeLabel,
  isValidExpenseType,
  calculateTotalMonthlyExpenses,
  getExpenseTypes,
  calculateRemainingCost,
  calculateTotalMonthlyFixedTermExpenses,
  isValidFixedTermExpenseInput,
};
