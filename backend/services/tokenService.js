const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key-change-in-env',
    { expiresIn: '7d' }
  );
};

// Generate Admin JWT Token
const generateAdminToken = (adminId, email) => {
  return jwt.sign(
    { adminId, email, isAdmin: true },
    process.env.JWT_ADMIN_SECRET || 'admin-secret-key-change-in-env',
    { expiresIn: '7d' }
  );
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-env');
  } catch (err) {
    return null;
  }
};

// Verify Admin JWT Token
const verifyAdminToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_ADMIN_SECRET || 'admin-secret-key-change-in-env');
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, generateAdminToken, verifyToken, verifyAdminToken };
