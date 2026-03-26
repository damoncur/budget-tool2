// src/services/groupAssetService.js

const GROWTH_RATES = {
  conservative: { label: 'Conservative', rate: 0.03 },
  average: { label: 'Average', rate: 0.06 },
  aggressive: { label: 'Aggressive', rate: 0.10 },
};

function calculateTotalValue(items) {
  return items.reduce((sum, item) => sum + item.currentValue, 0);
}

/**
 * Calculate how many months a balance lasts given a monthly withdrawal and annual growth rate.
 * Returns { months, years, neverDepletes } where neverDepletes is true if interest covers withdrawal.
 * Caps at 1200 months (100 years).
 */
function calculateDepletionMonths(totalValue, monthlyWithdrawal, annualRate) {
  if (monthlyWithdrawal <= 0) {
    return { months: 0, years: 0, neverDepletes: true };
  }

  if (totalValue <= 0) {
    return { months: 0, years: 0, neverDepletes: false };
  }

  const monthlyRate = annualRate / 12;
  let balance = totalValue;
  let months = 0;
  const maxMonths = 1200; // 100 years cap

  while (balance > 0 && months < maxMonths) {
    balance = balance * (1 + monthlyRate) - monthlyWithdrawal;
    months++;
  }

  if (months >= maxMonths && balance > 0) {
    return { months: maxMonths, years: 100, neverDepletes: true };
  }

  return {
    months,
    years: Math.floor(months / 12),
    remainingMonths: months % 12,
    neverDepletes: false,
  };
}

/**
 * Run projection for all three growth scenarios.
 */
function calculateProjections(totalValue, monthlyWithdrawal) {
  const results = {};
  for (const [key, { label, rate }] of Object.entries(GROWTH_RATES)) {
    const depletion = calculateDepletionMonths(totalValue, monthlyWithdrawal, rate);
    results[key] = { label, rate, ...depletion };
  }
  return results;
}

module.exports = {
  GROWTH_RATES,
  calculateTotalValue,
  calculateDepletionMonths,
  calculateProjections,
};
