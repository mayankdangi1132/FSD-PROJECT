const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { isAuthorisedAdmin } = require('../middleware/auth');
const { handleError } = require('../utils/helpers');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// what we send back to the frontend about the logged in user (never the password)
const userInfo = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  logo: user.logo,
  usn: user.usn,
  department: user.department,
  semester: user.semester,
  mustChangePassword: user.mustChangePassword,
});

// POST /api/auth/login  (admin, clubs, departments and students)
// There is no register route - every account is created by the admin.
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
    if (!user || !(await user.matchPassword(String(password)))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account has been disabled by the admin' });
    }
    if (user.role === 'admin' && !isAuthorisedAdmin(user)) {
      return res.status(403).json({ message: 'This admin account is not authorised' });
    }

    res.json({ token: generateToken(user._id), user: userInfo(user) });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/auth/me
const getMe = (req, res) => {
  res.json(userInfo(req.user));
};

// PUT /api/auth/change-password  body: { currentPassword, newPassword }
// used by everyone, and forced after logging in with a temporary password
const changePassword = async (req, res) => {
  try {
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ message: 'New password must be different from the current one' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is wrong' });
    }

    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ message: 'Password changed', user: userInfo(user) });
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = { login, getMe, changePassword };
