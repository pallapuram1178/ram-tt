const express = require('express');
const router = express.Router();
const { chatWithAI, createTicketFromChat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/chat', chatWithAI);
router.post('/create-ticket', createTicketFromChat);

module.exports = router;
