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
    case 'asset-withdrawal':
      return 'Asset Withdrawal';
    default:
      return 'Unknown';
  }
}

function isValidIncomeType(type) {
  return ['biweekly-salary', 'monthly-deposit', 'asset-withdrawal'].includes(type);
}

function calculateTotalMonthlyIncome(items) {
  return items.reduce((sum, item) => sum + item.monthlyEquivalent, 0);
}

function calculateMonthlyFromFrequency(frequency, amount) {
  const value = Number(amount) || 0;
  switch (frequency) {
    case 'biweekly': return (value * 26) / 12;
    case 'monthly': return value;
    default: return 0;
  }
}

function calculateWithdrawalRate(assetValue, monthlyWithdrawal) {
  if (!assetValue || assetValue <= 0) return 0;
  return (monthlyWithdrawal * 12) / assetValue;
}

function isValidWithdrawalFrequency(freq) {
  return ['biweekly', 'monthly'].includes(freq);
}

module.exports = {
  calculateMonthlyAmount,
  getIncomeTypeLabel,
  isValidIncomeType,
  calculateTotalMonthlyIncome,
  calculateMonthlyFromFrequency,
  calculateWithdrawalRate,
  isValidWithdrawalFrequency,
};
