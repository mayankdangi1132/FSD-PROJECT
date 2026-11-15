const express = require('express');
const {
  getOrganizers,
  createOrganizer,
  updateOrganizer,
  deleteOrganizer,
} = require('../controllers/userController');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// everything here is admin only
router.use(protect, allowRoles('admin'));

router.route('/').get(getOrganizers).post(createOrganizer);
router.route('/:id').put(updateOrganizer).delete(deleteOrganizer);

module.exports = router;
