const { verifyToken, verifyAdminToken } = require('../services/tokenService');

// User Authentication Middleware
const authUser = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Admin Authentication Middleware
const authAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = verifyAdminToken(token);
    if (!decoded || !decoded.isAdmin) {
      return res.status(401).json({ message: 'Unauthorized - Admin access required' });
    }
    
    req.adminId = decoded.adminId;
    req.adminEmail = decoded.email;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Role-based Authorization Middleware
const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      const Admin = require('../models/admin');
      const admin = await Admin.findById(req.adminId);
      
      if (!admin) {
        return res.status(401).json({ message: 'Admin not found' });
      }
      
      const hasPermission = requiredPermissions.some(perm => admin.permissions.includes(perm));
      
      if (!hasPermission) {
        return res.status(403).json({ message: 'Permission denied' });
      }
      
      next();
    } catch (err) {
      res.status(500).json({ message: 'Authorization check failed' });
    }
  };
};

module.exports = { authUser, authAdmin, authorize };
