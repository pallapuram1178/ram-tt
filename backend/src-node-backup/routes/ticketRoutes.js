const express = require('express');
const router = express.Router();
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  assignTicket,
  updateTicketStatus,
  addComment,
} = require('../controllers/ticketController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.route('/')
  .get(getTickets)
  .post(createTicket);

router.route('/:id')
  .get(getTicketById)
  .put(updateTicket);

router.put('/:id/assign', authorize('Admin', 'IT Manager', 'Technician'), assignTicket);
router.put('/:id/status', updateTicketStatus);
router.post('/:id/comments', addComment);

module.exports = router;
