const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET is not set in environment');
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_MISCONFIGURATION', message: 'Server is not properly configured' }
    });
  }

  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'No token provided, authorization denied' }
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'NO_TOKEN', message: 'Malformed Authorization header' }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token is not valid or has expired' }
    });
  }
};

module.exports = authMiddleware;
