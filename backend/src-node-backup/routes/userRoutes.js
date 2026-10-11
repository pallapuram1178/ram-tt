const express = require('express');
const router = express.Router();
const {
  getUsers,
  getTechnicians,
  getUserById,
  updateUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);

router.get('/technicians', getTechnicians);
router.get('/', authorize('Admin', 'IT Manager', 'Technician', 'Asset Manager'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', authorize('Admin'), updateUser);

module.exports = router;
