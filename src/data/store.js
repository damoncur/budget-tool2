const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'budget-data.json');

const incomeCategories = [];
let nextIncomeId = 1;

const expenseCategories = [];
let nextExpenseId = 1;

const groupAssets = [];
let nextGroupAssetId = 1;

const bigTicketExpenses = [];
let nextBigTicketId = 1;

const fixedTermExpenses = [];
let nextFixedTermId = 1;

let startingBalance = 0;

function getNextId() {
  return nextIncomeId++;
}

function getNextExpenseId() {
  return nextExpenseId++;
}

function getNextGroupAssetId() {
  return nextGroupAssetId++;
}

function getNextBigTicketId() {
  return nextBigTicketId++;
}

function getNextFixedTermId() {
  return nextFixedTermId++;
}

function findBigTicketById(id) {
  return bigTicketExpenses.find((item) => item.id === id);
}

function removeBigTicketById(id) {
  const index = bigTicketExpenses.findIndex((item) => item.id === id);
  if (index === -1) return false;
  bigTicketExpenses.splice(index, 1);
  return true;
}

function findIncomeById(id) {
  return incomeCategories.find((item) => item.id === id);
}

function removeIncomeById(id) {
  const index = incomeCategories.findIndex((item) => item.id === id);
  if (index === -1) return false;
  incomeCategories.splice(index, 1);
  return true;
}

function findExpenseById(id) {
  return expenseCategories.find((item) => item.id === id);
}

function removeExpenseById(id) {
  const index = expenseCategories.findIndex((item) => item.id === id);
  if (index === -1) return false;
  expenseCategories.splice(index, 1);
  return true;
}

function findGroupAssetById(id) {
  return groupAssets.find((item) => item.id === id);
}

function removeGroupAssetById(id) {
  const index = groupAssets.findIndex((item) => item.id === id);
  if (index === -1) return false;
  groupAssets.splice(index, 1);
  return true;
}

function findFixedTermById(id) {
  return fixedTermExpenses.find((item) => item.id === id);
}

function removeFixedTermById(id) {
  const index = fixedTermExpenses.findIndex((item) => item.id === id);
  if (index === -1) return false;
  fixedTermExpenses.splice(index, 1);
  return true;
}

function load() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      console.log('No data file found, starting with empty data.');
      return;
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);

    incomeCategories.length = 0;
    if (Array.isArray(data.incomeCategories)) {
      data.incomeCategories.forEach((item) => incomeCategories.push(item));
    }

    expenseCategories.length = 0;
    if (Array.isArray(data.expenseCategories)) {
      data.expenseCategories.forEach((item) => expenseCategories.push(item));
    }

    groupAssets.length = 0;
    if (Array.isArray(data.groupAssets)) {
      data.groupAssets.forEach((item) => groupAssets.push(item));
    }

    bigTicketExpenses.length = 0;
    if (Array.isArray(data.bigTicketExpenses)) {
      data.bigTicketExpenses.forEach((item) => bigTicketExpenses.push(item));
    }

    fixedTermExpenses.length = 0;
    let needsMigration = false;
    if (Array.isArray(data.fixedTermExpenses)) {
      data.fixedTermExpenses.forEach((item) => {
        // Migrate old-format items (paymentsRemaining) to new format (totalPayments + startDate)
        if (item.paymentsRemaining !== undefined && !item.startDate) {
          const now = new Date();
          item.totalPayments = item.paymentsRemaining;
          item.startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          delete item.paymentsRemaining;
          delete item.remainingCost;
          needsMigration = true;
        }
        fixedTermExpenses.push(item);
      });
    }

    nextIncomeId = data.nextIncomeId || 1;
    nextExpenseId = data.nextExpenseId || 1;
    nextGroupAssetId = data.nextGroupAssetId || 1;
    nextBigTicketId = data.nextBigTicketId || 1;
    nextFixedTermId = data.nextFixedTermId || 1;
    startingBalance = data.startingBalance || 0;

    console.log(
      `Loaded ${incomeCategories.length} income, ${expenseCategories.length} expense, ${bigTicketExpenses.length} big-ticket, ${fixedTermExpenses.length} fixed-term, and ${groupAssets.length} group assets from ${DATA_FILE}`
    );

    if (needsMigration) {
      console.log('Migrated old-format fixed-term expenses to new schema. Persisting...');
      save();
    }
  } catch (err) {
    console.error('Failed to load data file:', err.message);
  }
}

function save() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data = {
      incomeCategories,
      expenseCategories,
      groupAssets,
      bigTicketExpenses,
      fixedTermExpenses,
      nextIncomeId,
      nextExpenseId,
      nextGroupAssetId,
      nextBigTicketId,
      nextFixedTermId,
      startingBalance,
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Data saved to ${DATA_FILE}`);
  } catch (err) {
    console.error('Failed to save data file:', err.message);
  }
}

module.exports = {
  incomeCategories,
  getNextId,
  expenseCategories,
  getNextExpenseId,
  groupAssets,
  getNextGroupAssetId,
  bigTicketExpenses,
  getNextBigTicketId,
  findIncomeById,
  removeIncomeById,
  findExpenseById,
  removeExpenseById,
  findGroupAssetById,
  removeGroupAssetById,
  findBigTicketById,
  removeBigTicketById,
  fixedTermExpenses,
  getNextFixedTermId,
  findFixedTermById,
  removeFixedTermById,
  get startingBalance() { return startingBalance; },
  set startingBalance(val) { startingBalance = val; },
  load,
  save,
};
