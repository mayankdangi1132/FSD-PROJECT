const User = require('../models/User');
const Event = require('../models/Event');
const { checkCollegeEmail, handleError } = require('../utils/helpers');

const ROLES = ['club', 'department', 'student'];

// counts events per organizer, returns { organizerId: count }
const getEventCounts = async (match = {}) => {
  const counts = await Event.aggregate([{ $match: match }, { $group: { _id: '$organizer', total: { $sum: 1 } } }]);
  const map = {};
  counts.forEach((c) => (map[c._id.toString()] = c.total));
  return map;
};

const str = (value) => String(value ?? '').trim();

// GET /api/users?role=club|department|student  (admin)
const getAccounts = async (req, res) => {
  try {
    const role = ROLES.includes(req.query.role) ? req.query.role : { $in: ['club', 'department'] };
    const users = await User.find({ role }).sort({ name: 1 });

    if (req.query.role === 'student') return res.json(users);

    const counts = await getEventCounts();
    res.json(users.map((u) => ({ ...u.toJSON(), eventCount: counts[u._id.toString()] || 0 })));
  } catch (err) {
    handleError(res, err);
  }
};

// POST /api/users  (admin) - creates a club, department or student account.
// The password given here is temporary, the user is asked to change it after the first login.
const createAccount = async (req, res) => {
  try {
    const role = str(req.body.role);
    const name = str(req.body.name);
    const email = str(req.body.email).toLowerCase();
    const password = String(req.body.password || '');

    if (!ROLES.includes(role)) return res.status(400).json({ message: 'Account type must be club, department or student' });
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const emailError = checkCollegeEmail(email);
    if (emailError) return res.status(400).json({ message: emailError });
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const data = { name, email, password, role, mustChangePassword: true };

    if (role === 'student') {
      data.usn = str(req.body.usn).toUpperCase();
      data.department = str(req.body.department);
      data.semester = str(req.body.semester);
      if (!data.usn) return res.status(400).json({ message: 'USN is required for students' });
      if (await User.findOne({ usn: data.usn, role: 'student' })) {
        return res.status(400).json({ message: 'This USN is already registered' });
      }
    } else {
      data.description = str(req.body.description);
      data.logo = str(req.body.logo);
      data.autoApprove = Boolean(req.body.autoApprove);
    }

    const user = await User.create(data);
    res.status(201).json(user);
  } catch (err) {
    handleError(res, err);
  }
};

// PUT /api/users/:id  (admin) - edit details, activate / deactivate, reset password
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ message: 'Account not found' });

    const body = req.body;

    if (body.name !== undefined) {
      if (!str(body.name)) return res.status(400).json({ message: 'Name cannot be empty' });
      user.name = str(body.name);
    }
    if (body.email !== undefined) {
      const email = str(body.email).toLowerCase();
      const emailError = checkCollegeEmail(email);
      if (emailError) return res.status(400).json({ message: emailError });
      user.email = email;
    }
    if (body.isActive !== undefined) user.isActive = Boolean(body.isActive);

    if (user.role === 'student') {
      if (body.usn !== undefined) {
        if (!str(body.usn)) return res.status(400).json({ message: 'USN cannot be empty' });
        user.usn = str(body.usn).toUpperCase();
      }
      if (body.department !== undefined) user.department = str(body.department);
      if (body.semester !== undefined) user.semester = str(body.semester);
    } else {
      // a club can become a department and the other way round, nothing else
      if (body.role !== undefined) {
        if (!['club', 'department'].includes(body.role)) {
          return res.status(400).json({ message: 'Role must be club or department' });
        }
        user.role = body.role;
      }
      if (body.description !== undefined) user.description = str(body.description);
      if (body.logo !== undefined) user.logo = str(body.logo);
      if (body.autoApprove !== undefined) user.autoApprove = Boolean(body.autoApprove);
    }

    // password reset by the admin - it becomes a temporary password again
    if (body.password) {
      if (String(body.password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = String(body.password);
      user.mustChangePassword = true;
    }

    await user.save();

    // keep the name / type shown on their events in sync
    if (user.role !== 'student') {
      await Event.updateMany({ organizer: user._id }, { organizerName: user.name, organizerType: user.role });
    }

    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE /api/users/:id  (admin) - also removes that organizer's events
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ message: 'Account not found' });

    await Event.deleteMany({ organizer: user._id });
    await user.deleteOne();
    res.json({ message: 'Account deleted' });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/organizers?role=club  (public) - active clubs / departments for the Clubs and Departments pages.
// only basic info, no events.
const getPublicOrganizers = async (req, res) => {
  try {
    const filter = { role: { $in: ['club', 'department'] }, isActive: true };
    if (['club', 'department'].includes(req.query.role)) filter.role = req.query.role;

    const users = await User.find(filter).select('name email role description logo').sort({ name: 1 });
    const counts = await getEventCounts({ status: 'approved' });
    res.json(users.map((u) => ({ ...u.toJSON(), eventCount: counts[u._id.toString()] || 0 })));
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = { getAccounts, createAccount, updateUser, deleteUser, getPublicOrganizers };
