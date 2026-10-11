const mongoose = require('mongoose');

const repairRecordSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  issue: {
    type: String,
    required: [true, 'Repair issue description is required'],
  },
  cost: {
    type: Number,
    default: 0,
  },
  performedBy: {
    type: String,
    default: 'Internal IT Support',
  },
  status: {
    type: String,
    enum: ['Scheduled', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Completed',
  },
  notes: {
    type: String,
    default: '',
  },
});

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide an asset name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify asset category'],
      enum: [
        'Laptop',
        'Desktop',
        'Server',
        'Mobile Device',
        'Software License',
        'Network Device',
        'Peripheral',
        'Other',
      ],
      default: 'Laptop',
    },
    model: {
      type: String,
      required: [true, 'Please provide model/make details'],
      trim: true,
    },
    serialNumber: {
      type: String,
      required: [true, 'Please provide a serial number or license key'],
      trim: true,
    },
    vendor: {
      type: String,
      default: 'Apple / Dell / Lenovo / Microsoft',
    },
    status: {
      type: String,
      enum: ['In Use', 'In Storage', 'Under Repair', 'Retired', 'Lost'],
      default: 'In Storage',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assignedDepartment: {
      type: String,
      default: 'IT Support',
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    purchaseCost: {
      type: Number,
      default: 0,
    },
    warrantyExpiry: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      default: 'Main Office - Building A',
    },
    specifications: {
      processor: { type: String, default: '' },
      ram: { type: String, default: '' },
      storage: { type: String, default: '' },
      os: { type: String, default: '' },
      ipAddress: { type: String, default: '' },
      macAddress: { type: String, default: '' },
      licenseExpiry: { type: Date, default: null },
    },
    repairHistory: [repairRecordSchema],
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate assetTag before saving
assetSchema.pre('validate', async function (next) {
  if (!this.assetTag) {
    const count = await mongoose.model('Asset').countDocuments();
    const sequence = (count + 101).toString();
    this.assetTag = `AST-${sequence}`;
  }
  next();
});

module.exports = mongoose.model('Asset', assetSchema);
