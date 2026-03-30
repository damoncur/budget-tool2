const incomeCategories = [];
const expenseCategories = [];
let nextId = 1;

function getNextId() {
  return nextId++;
}

module.exports = {
  incomeCategories,
  expenseCategories,
  getNextId,
};
