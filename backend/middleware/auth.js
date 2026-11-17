const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getUserFromToken = async (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(decoded.id);
};

// Only the admin whose email is set in ADMIN_EMAIL (.env) is a real admin.
// So even if someone managed to put another "admin" document in the database,
// it would not get admin access.
const isAuthorisedAdmin = (user) => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  return user.role === 'admin' && (!adminEmail || user.email === adminEmail);
};

// route needs a logged in (and active) user
const protect = async (req, res, next) => {
  let user;
  try {
    user = await getUserFromToken(req);
  } catch (err) {
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }

  if (!user) return res.status(401).json({ message: 'Please log in first' });
  if (!user.isActive) return res.status(403).json({ message: 'Your account has been disabled by the admin' });
  if (user.role === 'admin' && !isAuthorisedAdmin(user)) {
    return res.status(403).json({ message: 'This admin account is not authorised' });
  }

  // with a temporary password you can only reach the auth routes (to change it)
  if (user.mustChangePassword && !req.originalUrl.startsWith('/api/auth/')) {
    return res.status(403).json({ message: 'Please change your temporary password first', mustChangePassword: true });
  }

  req.user = user;
  next();
};

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to do this' });
  }
  next();
};

module.exports = { protect, allowRoles, isAuthorisedAdmin };
