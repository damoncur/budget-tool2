// src/routes/groupAssetRoutes.js
const express = require('express');
const router = express.Router();
const groupAssetController = require('../controllers/groupAssetController');

router.get('/assets', groupAssetController.showAssetsPage);
router.post('/assets/projection', groupAssetController.showProjection);
router.post('/group-assets', groupAssetController.createGroupAsset);
router.post('/group-assets/:id/delete', groupAssetController.deleteGroupAsset);
router.get('/group-assets/:id/edit', groupAssetController.showEditAssetPage);
router.post('/group-assets/:id/edit', groupAssetController.updateGroupAsset);
router.get('/api/group-assets', groupAssetController.getGroupAssetsApi);

module.exports = router;
