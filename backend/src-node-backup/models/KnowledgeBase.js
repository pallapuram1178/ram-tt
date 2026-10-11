const mongoose = require('mongoose');

const knowledgeBaseSchema = new mongoose.Schema(
  {
    articleId: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an article title'],
      trim: true,
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
        'General IT',
      ],
      default: 'General IT',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    problemSummary: {
      type: String,
      required: [true, 'Please provide a short problem summary'],
    },
    symptoms: [
      {
        type: String,
      },
    ],
    stepByStepSolution: [
      {
        type: String,
      },
    ],
    content: {
      type: String,
      required: [true, 'Please provide article content'],
    },
    status: {
      type: String,
      enum: ['Draft', 'Approved', 'Archived'],
      default: 'Approved',
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    unhelpfulVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeBaseSchema.pre('validate', async function (next) {
  if (!this.articleId) {
    const count = await mongoose.model('KnowledgeBase').countDocuments();
    const sequence = (count + 201).toString();
    this.articleId = `KB-${sequence}`;
  }
  next();
});

// Text index for fast RAG search and portal full-text search
knowledgeBaseSchema.index({
  title: 'text',
  problemSummary: 'text',
  content: 'text',
  tags: 'text',
});

module.exports = mongoose.model('KnowledgeBase', knowledgeBaseSchema);
