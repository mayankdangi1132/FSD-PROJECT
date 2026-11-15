const jwt = require('jsonwebtoken');
const User = require('../models/User');

const getUserFromToken = async (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;

  const token = header.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(decoded.id);
};

// route needs a logged in (and active) user
const protect = async (req, res, next) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ message: 'Please log in first' });
    if (!user.isActive) return res.status(403).json({ message: 'Your account has been disabled by the admin' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }
};

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to do this' });
  }
  next();
};

module.exports = { protect, allowRoles };
