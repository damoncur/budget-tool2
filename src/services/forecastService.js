// src/services/forecastService.js

function generateForecast(startingBalance, totalMonthlyIncome, totalMonthlyExpenses, years) {
  const monthlyNet = totalMonthlyIncome - totalMonthlyExpenses;
  const totalMonths = years * 12;
  const dataPoints = [];
  let exhaustionMonth = null;

  for (let month = 0; month <= totalMonths; month++) {
    const balance = startingBalance + monthlyNet * month;
    const yearLabel = `Year ${(month / 12).toFixed(1)}`;
    dataPoints.push({ month, yearLabel, balance });

    if (exhaustionMonth === null && monthlyNet < 0 && balance <= 0) {
      exhaustionMonth = month;
    }
  }

  return { dataPoints, exhaustionMonth, monthlyNet };
}

module.exports = {
  generateForecast,
};
