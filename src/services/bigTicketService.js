// src/services/bigTicketService.js

/**
 * Calculate months from now until a target date string (YYYY-MM format).
 */
function calculateMonthsUntilDue(targetDate) {
  const [year, month] = targetDate.split('-').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  return (year - currentYear) * 12 + (month - currentMonth);
}

/**
 * Calculate monthly set-aside needed for an unfunded expense.
 */
function calculateMonthlySetAside(cost, monthsUntilDue) {
  if (monthsUntilDue <= 0) return cost; // past due, full amount needed now
  return cost / monthsUntilDue;
}

/**
 * Validate target date format (YYYY-MM) and that it's in the future.
 */
function isValidTargetDate(targetDate) {
  if (!/^\d{4}-\d{2}$/.test(targetDate)) return false;
  const months = calculateMonthsUntilDue(targetDate);
  return months > 0;
}

module.exports = {
  calculateMonthsUntilDue,
  calculateMonthlySetAside,
  isValidTargetDate,
};
