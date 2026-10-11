const KnowledgeBase = require('../models/KnowledgeBase');

// @desc    Get all knowledge base articles with search & category filters
// @route   GET /api/kb
// @access  Private
exports.getArticles = async (req, res, next) => {
  try {
    const { category, search, status = 'Approved', page = 1, limit = 20 } = req.query;

    const query = {};

    // Only Admin & IT Manager can see Drafts/Archived
    if (['Admin', 'IT Manager'].includes(req.user.role)) {
      if (status && status !== 'all') {
        query.status = status;
      }
    } else {
      query.status = 'Approved';
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { articleId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { problemSummary: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [articles, total] = await Promise.all([
      KnowledgeBase.find(query)
        .populate('author', 'name email role')
        .sort({ helpfulVotes: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      KnowledgeBase.countDocuments(query),
    ]);

    // Aggregate category counts for quick UI filter badges
    const categoryCounts = await KnowledgeBase.aggregate([
      { $match: { status: 'Approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      count: articles.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      categoryCounts,
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single article and increment views
// @route   GET /api/kb/:id
// @access  Private
exports.getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let article;
    if (id.startsWith('KB-')) {
      article = await KnowledgeBase.findOne({ articleId: id });
    } else {
      article = await KnowledgeBase.findById(id);
    }

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    await article.populate('author', 'name email role department');

    // Find related articles in the same category
    const related = await KnowledgeBase.find({
      _id: { $ne: article._id },
      category: article.category,
      status: 'Approved',
    })
      .limit(3)
      .select('articleId title category problemSummary helpfulVotes');

    res.json({
      success: true,
      data: article,
      related,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new knowledge base article
// @route   POST /api/kb
// @access  Private (Admin, IT Manager, Technician)
exports.createArticle = async (req, res, next) => {
  try {
    const {
      title,
      category,
      tags = [],
      problemSummary,
      symptoms = [],
      stepByStepSolution = [],
      content,
      status = 'Approved',
    } = req.body;

    const article = new KnowledgeBase({
      title,
      category,
      tags,
      problemSummary,
      symptoms,
      stepByStepSolution,
      content,
      status,
      author: req.user._id,
    });

    await article.save();
    await article.populate('author', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Knowledge base article created successfully.',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update knowledge base article
// @route   PUT /api/kb/:id
// @access  Private (Admin, IT Manager, Technician)
exports.updateArticle = async (req, res, next) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const {
      title,
      category,
      tags,
      problemSummary,
      symptoms,
      stepByStepSolution,
      content,
      status,
    } = req.body;

    if (title) article.title = title;
    if (category) article.category = category;
    if (tags) article.tags = tags;
    if (problemSummary) article.problemSummary = problemSummary;
    if (symptoms) article.symptoms = symptoms;
    if (stepByStepSolution) article.stepByStepSolution = stepByStepSolution;
    if (content) article.content = content;
    if (status) article.status = status;

    await article.save();
    await article.populate('author', 'name email role');

    res.json({
      success: true,
      message: 'Article updated successfully.',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Vote helpful / unhelpful on an article
// @route   POST /api/kb/:id/vote
// @access  Private
exports.voteArticle = async (req, res, next) => {
  try {
    const { helpful } = req.body; // boolean
    const article = await KnowledgeBase.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (helpful) {
      article.helpfulVotes += 1;
    } else {
      article.unhelpfulVotes += 1;
    }

    await article.save();

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      helpfulVotes: article.helpfulVotes,
      unhelpfulVotes: article.unhelpfulVotes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete knowledge base article
// @route   DELETE /api/kb/:id
// @access  Private (Admin, IT Manager)
exports.deleteArticle = async (req, res, next) => {
  try {
    const article = await KnowledgeBase.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    await article.deleteOne();

    res.json({
      success: true,
      message: 'Article deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
