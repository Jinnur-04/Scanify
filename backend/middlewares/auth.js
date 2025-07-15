import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'Authorization token missing or malformed.' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains: id, role, name
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// middleware/role.js
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role; // assuming decoded JWT sets req.user
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access Denied: Insufficient permissions' });
    }
    next();
  };
}


