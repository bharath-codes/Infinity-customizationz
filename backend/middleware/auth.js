const { verifyToken, verifyAdminToken } = require('../services/tokenService');
const Admin = require('../models/admin');

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
      console.warn('⚠️ authAdmin: No token provided in Authorization header');
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = verifyAdminToken(token);
    if (!decoded) {
      console.warn('⚠️ authAdmin: Token verification failed - token may be invalid or expired');
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    if (!decoded.isAdmin) {
      console.warn('⚠️ authAdmin: Token is not an admin token');
      return res.status(401).json({ message: 'Unauthorized - Admin access required' });
    }
    
    req.adminId = decoded.adminId;
    req.adminEmail = decoded.email;
    console.log('✅ authAdmin: Authenticated admin:', req.adminEmail);
    next();
  } catch (err) {
    console.error('❌ authAdmin middleware error:', err.message);
    res.status(401).json({ message: 'Authentication failed: ' + err.message });
  }
};

// Role-based Authorization Middleware
const authorize = (requiredPermissions) => {
  return async (req, res, next) => {
    try {
      console.log(`🔍 authorize: Checking permissions for admin: ${req.adminEmail}, required: ${requiredPermissions}`);
      
      const admin = await Admin.findById(req.adminId);
      
      if (!admin) {
        console.warn(`⚠️ authorize: Admin not found in database - ID: ${req.adminId}`);
        return res.status(401).json({ 
          message: 'Admin not found in database',
          adminId: req.adminId 
        });
      }

      console.log(`👤 authorize: Admin found - ${admin.email}, permissions: ${admin.permissions}`);
      
      const hasPermission = requiredPermissions.some(perm => admin.permissions.includes(perm));
      
      if (!hasPermission) {
        console.warn(`❌ authorize: Admin lacks required permissions. Required: ${requiredPermissions}, Has: ${admin.permissions}`);
        return res.status(403).json({ 
          message: 'Permission denied',
          required: requiredPermissions,
          has: admin.permissions
        });
      }

      console.log(`✅ authorize: Admin has required permissions`);
      next();
    } catch (err) {
      console.error('❌ Authorization check failed:', err.message);
      res.status(500).json({ message: 'Authorization check failed: ' + err.message });
    }
  };
};

module.exports = { authUser, authAdmin, authorize };
