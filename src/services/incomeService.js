function calculateMonthlyAmount(type, amount) {
  const value = Number(amount) || 0;

  switch (type) {
    case 'biweekly-salary':
      return (value * 26) / 12;
    case 'monthly-deposit':
      return value;
    default:
      return 0;
  }
}

function getIncomeTypeLabel(type) {
  switch (type) {
    case 'biweekly-salary':
      return 'Biweekly Salary';
    case 'monthly-deposit':
      return 'Monthly Deposit (Not Salary)';
    default:
      return 'Unknown';
  }
}

function isValidIncomeType(type) {
  return ['biweekly-salary', 'monthly-deposit'].includes(type);
}

function calculateTotalMonthlyIncome(items) {
  return items.reduce((sum, item) => sum + item.monthlyEquivalent, 0);
}

module.exports = {
  calculateMonthlyAmount,
  getIncomeTypeLabel,
  isValidIncomeType,
  calculateTotalMonthlyIncome,
};
