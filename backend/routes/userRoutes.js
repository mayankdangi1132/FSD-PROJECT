const express = require('express');
const {
  getOrganizers,
  createOrganizer,
  getStudents,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// everything here is admin only
router.use(protect, allowRoles('admin'));

router.route('/').get(getOrganizers).post(createOrganizer);
router.get('/students', getStudents);
router.route('/:id').put(updateUser).delete(deleteUser);

module.exports = router;
