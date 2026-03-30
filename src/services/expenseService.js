function isValidExpenseType(type) {
  return ['monthly', 'fixed-term'].includes(type);
}

function getExpenseTypeLabel(type) {
  switch (type) {
    case 'monthly':
      return 'Monthly';
    case 'fixed-term':
      return 'Fixed Term';
    default:
      return 'Unknown';
  }
}

function calculateMonthlyAmount(type, amount) {
  return Number(amount) || 0;
}

function calculateRemainingPayments(startDate, termMonths) {
  const now = new Date();
  const start = new Date(startDate);
  const elapsedMonths = Math.max(
    0,
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  );
  return Math.max(0, termMonths - elapsedMonths);
}

function enrichExpenseItem(item) {
  const enriched = { ...item };

  if (item.type === 'fixed-term') {
    enriched.remainingPayments = calculateRemainingPayments(item.startDate, item.termMonths);
    enriched.totalRemaining = enriched.monthlyAmount * enriched.remainingPayments;
    enriched.isComplete = enriched.remainingPayments === 0;
  } else {
    enriched.remainingPayments = null;
    enriched.totalRemaining = null;
    enriched.isComplete = false;
  }

  return enriched;
}

function calculateTotalMonthlyExpenses(items) {
  return items
    .filter((item) => !item.isComplete)
    .reduce((sum, item) => sum + item.monthlyAmount, 0);
}

module.exports = {
  isValidExpenseType,
  getExpenseTypeLabel,
  calculateMonthlyAmount,
  calculateRemainingPayments,
  enrichExpenseItem,
  calculateTotalMonthlyExpenses,
};
