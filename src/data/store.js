const incomeCategories = [];
let nextId = 1;

function getNextId() {
  return nextId++;
}

module.exports = {
  incomeCategories,
  getNextId,
};