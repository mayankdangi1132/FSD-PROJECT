const User = require('../models/User');
const Event = require('../models/Event');
const { EMAIL_REGEX, handleError } = require('../utils/helpers');

// if COLLEGE_EMAIL_DOMAIN is set (e.g. college.edu) every organizer email must use it
const checkCollegeEmail = (email) => {
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email';
  const domain = process.env.COLLEGE_EMAIL_DOMAIN;
  if (domain && !email.endsWith('@' + domain)) return `Organizer email must be an official @${domain} address`;
  return null;
};

// counts events per organizer, returns { organizerId: count }
const getEventCounts = async (match = {}) => {
  const counts = await Event.aggregate([{ $match: match }, { $group: { _id: '$organizer', total: { $sum: 1 } } }]);
  const map = {};
  counts.forEach((c) => (map[c._id.toString()] = c.total));
  return map;
};

// GET /api/users  (admin)
const getOrganizers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['club', 'department'] } }).sort({ role: 1, name: 1 });
    const counts = await getEventCounts();
    res.json(users.map((u) => ({ ...u.toObject(), eventCount: counts[u._id.toString()] || 0 })));
  } catch (err) {
    handleError(res, err);
  }
};

// POST /api/users  (admin)
const createOrganizer = async (req, res) => {
  try {
    const { name, role, description } = req.body;
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Name, email, password and role are required' });
    }
    if (!['club', 'department'].includes(role)) {
      return res.status(400).json({ message: 'Role must be club or department' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const emailError = checkCollegeEmail(email);
    if (emailError) return res.status(400).json({ message: emailError });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'An account with this email already exists' });

    const user = await User.create({ name: String(name).trim(), email, password, role, description });
    const { password: _, ...safeUser } = user.toObject();
    res.status(201).json(safeUser);
  } catch (err) {
    handleError(res, err);
  }
};

// PUT /api/users/:id  (admin)
const updateOrganizer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ message: 'Organizer not found' });

    const { name, role, description, isActive } = req.body;
    const password = req.body.password ? String(req.body.password) : '';

    if (req.body.email !== undefined) {
      const email = String(req.body.email).toLowerCase().trim();
      const emailError = checkCollegeEmail(email);
      if (emailError) return res.status(400).json({ message: emailError });
      user.email = email;
    }
    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ message: 'Name cannot be empty' });
      user.name = String(name).trim();
    }
    if (role !== undefined) {
      if (!['club', 'department'].includes(role)) return res.status(400).json({ message: 'Role must be club or department' });
      user.role = role;
    }
    if (description !== undefined) user.description = description;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = password;
    }

    await user.save();

    // keep the name/type shown on their events in sync
    await Event.updateMany({ organizer: user._id }, { organizerName: user.name, organizerType: user.role });

    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE /api/users/:id  (admin) - also removes that organizer's events
const deleteOrganizer = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === 'admin') return res.status(404).json({ message: 'Organizer not found' });

    await Event.deleteMany({ organizer: user._id });
    await user.deleteOne();
    res.json({ message: 'Organizer and their events deleted' });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/organizers?role=club  (public) - used for Clubs / Departments pages and filters
const getPublicOrganizers = async (req, res) => {
  try {
    const filter = { role: { $in: ['club', 'department'] }, isActive: true };
    if (['club', 'department'].includes(req.query.role)) filter.role = req.query.role;

    const users = await User.find(filter).select('name email role description').sort({ name: 1 });
    const counts = await getEventCounts({ status: 'approved' });
    res.json(users.map((u) => ({ ...u.toObject(), eventCount: counts[u._id.toString()] || 0 })));
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = { getOrganizers, createOrganizer, updateOrganizer, deleteOrganizer, getPublicOrganizers };
