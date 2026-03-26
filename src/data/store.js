const incomeCategories = [];
let nextIncomeId = 1;

const expenseCategories = [];
let nextExpenseId = 1;

function getNextId() {
  return nextIncomeId++;
}

function getNextExpenseId() {
  return nextExpenseId++;
}

module.exports = {
  incomeCategories,
  getNextId,
  expenseCategories,
  getNextExpenseId,
};
