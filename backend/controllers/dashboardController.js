const User = require('../models/User');
const Event = require('../models/Event');
const { todayStr, addDays, isCompleted, handleError } = require('../utils/helpers');

// GET /api/dashboard/admin
const getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const [clubs, departments, students, totalEvents, upcoming, pending, inactive] = await Promise.all([
      User.countDocuments({ role: 'club' }),
      User.countDocuments({ role: 'department' }),
      User.countDocuments({ role: 'student' }),
      Event.countDocuments(),
      Event.countDocuments({ endAt: { $gte: now } }),
      Event.countDocuments({ status: 'pending' }),
      User.countDocuments({ role: { $ne: 'admin' }, isActive: false }),
    ]);

    res.json({
      totalClubs: clubs,
      totalDepartments: departments,
      totalStudents: students,
      totalEvents,
      upcoming,
      completed: totalEvents - upcoming,
      pending,
      inactiveAccounts: inactive,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/dashboard/organizer  (club / department)
const getOrganizerStats = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id });
    const completed = events.filter(isCompleted);

    // competitive events that are over but still have no winners added
    const needWinners = completed.filter((e) => e.eventType === 'competitive' && e.winners.length === 0);

    res.json({
      totalEvents: events.length,
      upcoming: events.length - completed.length,
      completed: completed.length,
      pending: events.filter((e) => e.status === 'pending').length,
      needWinners: needWinners.map((e) => ({ _id: e._id, title: e.title, endDate: e.endDate })),
    });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/dashboard/student  (any logged in user)
const getStudentDashboard = async (req, res) => {
  try {
    const now = new Date();
    const today = todayStr();
    const weekEnd = addDays(today, 6);
    const published = { status: 'approved' };

    const [upcoming, recent, todayEvents, thisWeek, completed, recentWinners] = await Promise.all([
      Event.find({ ...published, endAt: { $gte: now } }).sort({ startAt: 1 }).limit(6),
      Event.find(published).sort({ createdAt: -1 }).limit(6),
      // happening today (multi-day events count on every day they run)
      Event.find({ ...published, startDate: { $lte: today }, endDate: { $gte: today } }).sort({ startAt: 1 }),
      // anything running in the next 7 days
      Event.find({ ...published, startDate: { $lte: weekEnd }, endAt: { $gte: now } }).sort({ startAt: 1 }),
      Event.find({ ...published, endAt: { $lt: now } }).sort({ endAt: -1 }).limit(6),
      Event.find({ ...published, 'winners.0': { $exists: true } })
        .sort({ winnersPublishedAt: -1 })
        .limit(5)
        .select('title organizerName endDate winners winnersPublishedAt'),
    ]);

    res.json({ upcoming, recent, today: todayEvents, thisWeek, completed, recentWinners });
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = { getAdminStats, getOrganizerStats, getStudentDashboard };
