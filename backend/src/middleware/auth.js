import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getBearerToken = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
};

export const authenticate = async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ message: 'No token provided.' });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: 'Authentication is not configured.' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!req.user) return res.status(401).json({ message: 'Invalid token.' });

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed.' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    next();
  };
};

export default authenticate;
