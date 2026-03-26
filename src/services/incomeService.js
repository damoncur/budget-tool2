function calculateMonthlyAmount(type, amount) {
  const value = Number(amount) || 0;

  switch (type) {
    case 'biweekly-salary':
      return (value * 26) / 12;
    case 'monthly-deposit':
      return value;
    case 'quarterly-deposit':
      return value / 3;
    case 'yearly-deposit':
      return value / 12;
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
    case 'quarterly-deposit':
      return 'Quarterly Deposit';
    case 'yearly-deposit':
      return 'Yearly Deposit';
    case 'asset-withdrawal':
      return 'Asset Withdrawal';
    default:
      return 'Unknown';
  }
}

function isValidIncomeType(type) {
  return ['biweekly-salary', 'monthly-deposit', 'quarterly-deposit', 'yearly-deposit', 'asset-withdrawal'].includes(type);
}

function calculateTotalMonthlyIncome(items) {
  return items.reduce((sum, item) => sum + item.monthlyEquivalent, 0);
}

function calculateMonthlyFromFrequency(frequency, amount) {
  const value = Number(amount) || 0;
  switch (frequency) {
    case 'biweekly': return (value * 26) / 12;
    case 'monthly': return value;
    case 'quarterly': return value / 3;
    case 'yearly': return value / 12;
    default: return 0;
  }
}

function calculateWithdrawalRate(assetValue, monthlyWithdrawal) {
  if (!assetValue || assetValue <= 0) return 0;
  return (monthlyWithdrawal * 12) / assetValue;
}

function isValidWithdrawalFrequency(freq) {
  return ['biweekly', 'monthly', 'quarterly', 'yearly'].includes(freq);
}

function calculateAssetDurationMonths(assetValue, annualGrowthRate, monthlyWithdrawal) {
  if (monthlyWithdrawal <= 0) return Infinity;
  const r = Math.pow(1 + annualGrowthRate, 1 / 12) - 1;
  if (r <= 0) {
    return Math.ceil(assetValue / monthlyWithdrawal);
  }
  if (monthlyWithdrawal <= assetValue * r) {
    return Infinity;
  }
  return Math.ceil(-Math.log(1 - (assetValue * r) / monthlyWithdrawal) / Math.log(1 + r));
}

module.exports = {
  calculateMonthlyAmount,
  getIncomeTypeLabel,
  isValidIncomeType,
  calculateTotalMonthlyIncome,
  calculateMonthlyFromFrequency,
  calculateWithdrawalRate,
  isValidWithdrawalFrequency,
  calculateAssetDurationMonths,
};
