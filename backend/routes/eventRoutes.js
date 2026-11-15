const express = require('express');
const {
  getEvents,
  getEventById,
  getMyEvents,
  getAllEventsForAdmin,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  updateWinners,
} = require('../controllers/eventController');
const { protect, allowRoles } = require('../middleware/auth');

const router = express.Router();
const organizers = allowRoles('admin', 'club', 'department');

// any logged in user (students, organizers, admin)
router.get('/', protect, getEvents);

// these two must come before /:id
router.get('/mine', protect, organizers, getMyEvents);
router.get('/admin/all', protect, allowRoles('admin'), getAllEventsForAdmin);

router.get('/:id', protect, getEventById);

// organizers + admin (ownership is checked inside the controller)
router.post('/', protect, organizers, createEvent);
router.put('/:id', protect, organizers, updateEvent);
router.delete('/:id', protect, organizers, deleteEvent);
router.put('/:id/winners', protect, organizers, updateWinners);

// admin approval
router.patch('/:id/status', protect, allowRoles('admin'), updateEventStatus);

module.exports = router;
