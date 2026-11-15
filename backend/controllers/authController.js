const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { handleError } = require('../utils/helpers');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/login
// There is no register route on purpose - organizer accounts are created by the admin only.
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

    res.json({
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/auth/me
const getMe = (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({ _id, name, email, role });
};

module.exports = { login, getMe };
