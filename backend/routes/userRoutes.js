const express = require('express');
const { getAccounts, createAccount, updateUser, deleteUser } = require('../controllers/userController');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

// everything here is admin only (clubs, departments and students are managed by the admin)
router.use(protect, allowRoles('admin'));

router.route('/').get(getAccounts).post(createAccount);
router.route('/:id').put(updateUser).delete(deleteUser);

module.exports = router;
