// src/controllers/groupAssetController.js
const store = require('../data/store');
const groupAssetService = require('../services/groupAssetService');
const groupAssetView = require('../views/groupAssetView');

function showAssetsPage(req, res) {
  const totalValue = groupAssetService.calculateTotalValue(store.groupAssets);
  res.send(groupAssetView.renderAssetsPage(store.groupAssets, totalValue, null));
}

function showProjection(req, res) {
  const totalValue = groupAssetService.calculateTotalValue(store.groupAssets);
  const monthlyWithdrawal = Number(req.body.monthlyWithdrawal);

  if (!Number.isFinite(monthlyWithdrawal) || monthlyWithdrawal < 0) {
    return res.status(400).send('Monthly withdrawal must be a valid non-negative number.');
  }

  const projections = groupAssetService.calculateProjections(totalValue, monthlyWithdrawal);
  res.send(groupAssetView.renderAssetsPage(store.groupAssets, totalValue, { monthlyWithdrawal, projections }));
}

function createGroupAsset(req, res) {
  const name = (req.body.name || '').trim();
  const currentValue = Number(req.body.currentValue);

  if (!name) {
    return res.status(400).send('Asset name is required.');
  }

  if (!Number.isFinite(currentValue) || currentValue < 0) {
    return res.status(400).send('Current value must be a valid non-negative number.');
  }

  const item = {
    id: store.getNextGroupAssetId(),
    name,
    currentValue,
  };

  store.groupAssets.push(item);
  store.save();
  res.redirect('/assets');
}

function deleteGroupAsset(req, res) {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).send('Invalid ID.');
  }

  const removed = store.removeGroupAssetById(id);
  if (!removed) {
    return res.status(404).send('Group asset not found.');
  }

  store.save();
  res.redirect('/assets');
}

function showEditAssetPage(req, res) {
  const id = Number(req.params.id);
  const item = store.findGroupAssetById(id);
  if (!item) {
    return res.status(404).send('Group asset not found.');
  }

  res.send(groupAssetView.renderEditAssetPage(item));
}

function updateGroupAsset(req, res) {
  const id = Number(req.params.id);
  const item = store.findGroupAssetById(id);
  if (!item) {
    return res.status(404).send('Group asset not found.');
  }

  const name = (req.body.name || '').trim();
  const currentValue = Number(req.body.currentValue);

  if (!name) {
    return res.status(400).send('Asset name is required.');
  }

  if (!Number.isFinite(currentValue) || currentValue < 0) {
    return res.status(400).send('Current value must be a valid non-negative number.');
  }

  item.name = name;
  item.currentValue = currentValue;

  store.save();
  res.redirect('/assets');
}

function getGroupAssetsApi(req, res) {
  const totalValue = groupAssetService.calculateTotalValue(store.groupAssets);

  res.json({
    items: store.groupAssets,
    totalValue,
  });
}

module.exports = {
  showAssetsPage,
  showProjection,
  createGroupAsset,
  deleteGroupAsset,
  showEditAssetPage,
  updateGroupAsset,
  getGroupAssetsApi,
};
