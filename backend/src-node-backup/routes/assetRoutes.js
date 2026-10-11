const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  addRepairRecord,
} = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getAssets)
  .post(authorize('Admin', 'IT Manager', 'Asset Manager'), createAsset);

router.route('/:id')
  .get(getAssetById)
  .put(authorize('Admin', 'IT Manager', 'Asset Manager'), updateAsset)
  .delete(authorize('Admin', 'Asset Manager'), deleteAsset);

router.post(
  '/:id/repairs',
  authorize('Admin', 'IT Manager', 'Asset Manager', 'Technician'),
  addRepairRecord
);

module.exports = router;
