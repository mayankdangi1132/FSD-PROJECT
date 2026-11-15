const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { checkCollegeEmail, handleError } = require('../utils/helpers');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// what we send back to the frontend about the logged in user
const userInfo = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  usn: user.usn,
  department: user.department,
});

// POST /api/auth/register
// Only students can sign up, and only with the college email domain.
// Club / department accounts are still created by the admin.
const register = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    const usn = String(req.body.usn || '').trim().toUpperCase();
    const department = String(req.body.department || '').trim();

    if (!name || !email || !password || !usn) {
      return res.status(400).json({ message: 'Name, college email, USN and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const emailError = checkCollegeEmail(email);
    if (emailError) return res.status(400).json({ message: emailError });

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    if (await User.findOne({ usn, role: 'student' })) {
      return res.status(400).json({ message: 'An account with this USN already exists' });
    }

    const user = await User.create({ name, email, password, usn, department, role: 'student' });

    res.status(201).json({ token: generateToken(user._id), user: userInfo(user) });
  } catch (err) {
    handleError(res, err);
  }
};

// POST /api/auth/login  (everyone - admin, clubs, departments and students)
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

    res.json({ token: generateToken(user._id), user: userInfo(user) });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/auth/me
const getMe = (req, res) => {
  res.json(userInfo(req.user));
};

module.exports = { register, login, getMe };
