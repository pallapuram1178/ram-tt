const Asset = require('../models/Asset');
const User = require('../models/User');

// @desc    Get all assets with filtering and pagination
// @route   GET /api/assets
// @access  Private
exports.getAssets = async (req, res, next) => {
  try {
    const {
      category,
      status,
      assignedDepartment,
      assignedTo,
      search,
      warrantyStatus, // 'active', 'expired', 'expiring-soon'
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Role scoping: Employees only see assets assigned to them
    if (req.user.role === 'Employee') {
      query.assignedTo = req.user._id;
    } else if (assignedTo) {
      if (assignedTo === 'unassigned') {
        query.assignedTo = null;
      } else {
        query.assignedTo = assignedTo;
      }
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (assignedDepartment && assignedDepartment !== 'all') {
      query.assignedDepartment = assignedDepartment;
    }

    // Warranty filter
    const now = new Date();
    const thirtyDaysAhead = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (warrantyStatus === 'expired') {
      query.warrantyExpiry = { $lt: now };
    } else if (warrantyStatus === 'expiring-soon') {
      query.warrantyExpiry = { $gte: now, $lte: thirtyDaysAhead };
    } else if (warrantyStatus === 'active') {
      query.warrantyExpiry = { $gt: now };
    }

    if (search) {
      query.$or = [
        { assetTag: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { vendor: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOption = {};
    sortOption[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [assets, total] = await Promise.all([
      Asset.find(query)
        .populate('assignedTo', 'name email department phone avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Asset.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: assets.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      data: assets,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single asset by ID
// @route   GET /api/assets/:id
// @access  Private
exports.getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let asset;
    if (id.startsWith('AST-')) {
      asset = await Asset.findOne({ assetTag: id });
    } else {
      asset = await Asset.findById(id);
    }

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Role check for employees
    if (
      req.user.role === 'Employee' &&
      (!asset.assignedTo || asset.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are only authorized to view assets assigned to you.',
      });
    }

    await asset.populate('assignedTo', 'name email department phone');

    res.json({
      success: true,
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new asset
// @route   POST /api/assets
// @access  Private (Admin, IT Manager, Asset Manager)
exports.createAsset = async (req, res, next) => {
  try {
    const {
      name,
      category,
      model,
      serialNumber,
      vendor,
      status,
      assignedTo,
      assignedDepartment,
      purchaseDate,
      purchaseCost,
      warrantyExpiry,
      location,
      specifications,
      notes,
    } = req.body;

    const asset = new Asset({
      name,
      category,
      model,
      serialNumber,
      vendor,
      status: assignedTo ? 'In Use' : (status || 'In Storage'),
      assignedTo: assignedTo || null,
      assignedDepartment: assignedDepartment || 'IT Support',
      purchaseDate: purchaseDate || Date.now(),
      purchaseCost: purchaseCost || 0,
      warrantyExpiry: warrantyExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      location: location || 'Main Office',
      specifications: specifications || {},
      notes: notes || '',
    });

    await asset.save();
    await asset.populate('assignedTo', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Asset registered successfully.',
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update asset details
// @route   PUT /api/assets/:id
// @access  Private (Admin, IT Manager, Asset Manager)
exports.updateAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const {
      name,
      category,
      model,
      serialNumber,
      vendor,
      status,
      assignedTo,
      assignedDepartment,
      purchaseDate,
      purchaseCost,
      warrantyExpiry,
      location,
      specifications,
      notes,
    } = req.body;

    if (name) asset.name = name;
    if (category) asset.category = category;
    if (model) asset.model = model;
    if (serialNumber) asset.serialNumber = serialNumber;
    if (vendor) asset.vendor = vendor;
    if (status) asset.status = status;
    if (assignedTo !== undefined) {
      asset.assignedTo = assignedTo || null;
      if (assignedTo && asset.status === 'In Storage') {
        asset.status = 'In Use';
      }
    }
    if (assignedDepartment) asset.assignedDepartment = assignedDepartment;
    if (purchaseDate) asset.purchaseDate = purchaseDate;
    if (purchaseCost !== undefined) asset.purchaseCost = purchaseCost;
    if (warrantyExpiry) asset.warrantyExpiry = warrantyExpiry;
    if (location) asset.location = location;
    if (specifications) asset.specifications = { ...asset.specifications, ...specifications };
    if (notes !== undefined) asset.notes = notes;

    await asset.save();
    await asset.populate('assignedTo', 'name email department phone');

    res.json({
      success: true,
      message: 'Asset updated successfully.',
      data: asset,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add repair / maintenance record to asset
// @route   POST /api/assets/:id/repairs
// @access  Private (Admin, IT Manager, Asset Manager, Technician)
exports.addRepairRecord = async (req, res, next) => {
  try {
    const { issue, cost, performedBy, status = 'Completed', notes, date } = req.body;

    if (!issue) {
      return res.status(400).json({ success: false, message: 'Issue description is required' });
    }

    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    asset.repairHistory.push({
      issue,
      cost: cost || 0,
      performedBy: performedBy || req.user.name,
      status,
      notes: notes || '',
      date: date || new Date(),
    });

    if (status === 'In Progress' || status === 'Scheduled') {
      asset.status = 'Under Repair';
    }

    await asset.save();

    res.json({
      success: true,
      message: 'Repair record added successfully.',
      data: asset.repairHistory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin, Asset Manager)
exports.deleteAsset = async (req, res, next) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    await asset.deleteOne();

    res.json({
      success: true,
      message: 'Asset removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
