// src/services/projectionService.js

/**
 * Simulate an asset month-by-month, accounting for growth, monthly withdrawals,
 * and lump-sum big-ticket expenses.
 *
 * @param {number} assetValue - Initial asset balance
 * @param {number} annualGrowthRate - Annual growth rate as decimal (e.g., 0.07)
 * @param {number} monthlyWithdrawal - Monthly withdrawal amount
 * @param {Array} bigTicketExpenses - Array of { cost, monthsUntilDue } objects
 * @param {number} [maxMonths=1200] - Maximum months to simulate (default 100 years)
 * @returns {{ durationMonths: number, depleted: boolean, timeline: Array }}
 */
function simulateAsset(assetValue, annualGrowthRate, monthlyWithdrawal, bigTicketExpenses = [], maxMonths = 1200) {
  const monthlyRate = Math.pow(1 + annualGrowthRate, 1 / 12) - 1;
  let balance = assetValue;
  const timeline = [];

  for (let month = 1; month <= maxMonths; month++) {
    // Apply growth
    balance = balance * (1 + monthlyRate);

    // Subtract monthly withdrawal
    balance -= monthlyWithdrawal;

    // Subtract any big-ticket expenses due this month
    for (const expense of bigTicketExpenses) {
      if (expense.monthsUntilDue === month) {
        balance -= expense.cost;
      }
    }

    timeline.push({ month, balance: Math.round(balance * 100) / 100 });

    if (balance <= 0) {
      return { durationMonths: month, depleted: true, timeline };
    }
  }

  return { durationMonths: Infinity, depleted: false, timeline };
}

module.exports = { simulateAsset };
