// src/services/groupAssetService.js

function calculateTotalValue(items) {
  return items.reduce((sum, item) => sum + item.currentValue, 0);
}

module.exports = {
  calculateTotalValue,
};
