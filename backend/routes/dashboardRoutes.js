const express = require('express');
const { getAdminStats, getOrganizerStats, getStudentDashboard } = require('../controllers/dashboardController');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/admin', protect, allowRoles('admin'), getAdminStats);
router.get('/organizer', protect, allowRoles('club', 'department'), getOrganizerStats);
router.get('/student', getStudentDashboard);

module.exports = router;
