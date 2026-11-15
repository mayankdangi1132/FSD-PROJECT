const User = require('../models/User');
const Event = require('../models/Event');
const { todayStr, isCompleted, handleError } = require('../utils/helpers');

// splits a list of events into upcoming / completed counts
const countByTime = (events) => {
  const completed = events.filter(isCompleted).length;
  return { upcoming: events.length - completed, completed };
};

// GET /api/dashboard/admin
const getAdminStats = async (req, res) => {
  try {
    const [clubs, departments, students, events, pending] = await Promise.all([
      User.countDocuments({ role: 'club' }),
      User.countDocuments({ role: 'department' }),
      User.countDocuments({ role: 'student' }),
      Event.find().select('endDate endTime'),
      Event.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      totalClubs: clubs,
      totalDepartments: departments,
      totalStudents: students,
      totalEvents: events.length,
      ...countByTime(events),
      pending,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/dashboard/organizer  (club / department)
const getOrganizerStats = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id });

    // competitive events that are over but still have no winners added
    const needWinners = events.filter((e) => e.eventType === 'competitive' && isCompleted(e) && e.winners.length === 0);

    res.json({
      totalEvents: events.length,
      ...countByTime(events),
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
    const upcomingList = await Event.find({ status: 'approved', endDate: { $gte: todayStr() } })
      .sort({ startDate: 1, startTime: 1 })
      .limit(10);
    const upcoming = upcomingList.filter((e) => !isCompleted(e)).slice(0, 6);

    const recent = await Event.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(6);

    const recentWinners = await Event.find({ status: 'approved', 'winners.0': { $exists: true } })
      .sort({ winnersPublishedAt: -1 })
      .limit(5)
      .select('title organizerName endDate winners winnersPublishedAt');

    res.json({ upcoming, recent, recentWinners });
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = { getAdminStats, getOrganizerStats, getStudentDashboard };
