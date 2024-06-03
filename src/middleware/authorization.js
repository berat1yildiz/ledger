const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('winston');

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return async (req, res, next) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findByPk(decoded.id);

      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      next();
    } catch (error) {
      logger.error(error);
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
};

module.exports = authorize;
