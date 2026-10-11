const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  voteArticle,
} = require('../controllers/kbController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getArticles)
  .post(authorize('Admin', 'IT Manager', 'Technician'), createArticle);

router.route('/:id')
  .get(getArticleById)
  .put(authorize('Admin', 'IT Manager', 'Technician'), updateArticle)
  .delete(authorize('Admin', 'IT Manager'), deleteArticle);

router.post('/:id/vote', voteArticle);

module.exports = router;
