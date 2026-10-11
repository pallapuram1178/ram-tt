const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Comment cannot be empty'],
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false, // Internal IT note vs visible to requester
    },
    attachments: [String],
  },
  {
    timestamps: true,
  }
);

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  details: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a ticket title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an issue description'],
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      enum: [
        'Hardware',
        'Software',
        'Network',
        'Access & Security',
        'Email & Communication',
        'Cloud Services',
        'Other',
      ],
      default: 'Software',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed', 'Reopened'],
      default: 'Open',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      default: null,
    },
    source: {
      type: String,
      enum: ['Portal', 'AI Chatbot', 'Email', 'Manual'],
      default: 'Portal',
    },
    slaDeadline: {
      type: Date,
      required: true,
    },
    slaStatus: {
      type: String,
      enum: ['Within SLA', 'At Risk', 'Breached'],
      default: 'Within SLA',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    tags: [String],
    comments: [commentSchema],
    activityLog: [activityLogSchema],
    aiTroubleshootingAttempted: {
      type: Boolean,
      default: false,
    },
    aiSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate ticketId before saving if not present
ticketSchema.pre('validate', async function (next) {
  if (!this.ticketId) {
    try {
      const lastTicket = await mongoose
        .model('Ticket')
        .findOne({ ticketId: { $regex: /^TICK-\d+$/ } })
        .sort({ createdAt: -1 });

      let nextNum = 1001;
      if (lastTicket && lastTicket.ticketId) {
        const match = lastTicket.ticketId.match(/\d+/);
        if (match) {
          nextNum = parseInt(match[0], 10) + 1;
        }
      }

      // Check and prevent any duplicate collisions
      while (await mongoose.model('Ticket').exists({ ticketId: `TICK-${nextNum}` })) {
        nextNum++;
      }
      this.ticketId = `TICK-${nextNum}`;
    } catch (err) {
      const rand = Math.floor(1000 + Math.random() * 9000);
      this.ticketId = `TICK-${Date.now().toString().slice(-4)}${rand}`;
    }
  }

  // Calculate default SLA deadline if not explicitly set
  if (!this.slaDeadline) {
    const hoursMap = {
      Urgent: 4,     // 4 hours
      High: 12,      // 12 hours
      Medium: 24,    // 24 hours
      Low: 48,       // 48 hours
    };
    const hours = hoursMap[this.priority] || 24;
    this.slaDeadline = new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  next();
});

// Helper virtual to check SLA breach in real time
ticketSchema.methods.checkAndUpdateSLA = function () {
  if (this.status === 'Resolved' || this.status === 'Closed') {
    if (this.resolvedAt && this.resolvedAt > this.slaDeadline) {
      this.slaStatus = 'Breached';
    } else {
      this.slaStatus = 'Within SLA';
    }
    return;
  }

  const now = new Date();
  const deadline = new Date(this.slaDeadline);
  const timeRemainingMs = deadline - now;

  if (timeRemainingMs < 0) {
    this.slaStatus = 'Breached';
  } else if (timeRemainingMs < 4 * 60 * 60 * 1000) {
    // Less than 4 hours remaining
    this.slaStatus = 'At Risk';
  } else {
    this.slaStatus = 'Within SLA';
  }
};

module.exports = mongoose.model('Ticket', ticketSchema);
