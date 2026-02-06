const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const { generateAdminToken } = require('../services/tokenService');
const { authAdmin, authorize } = require('../middleware/auth');

// 1. Admin Login (Email + Password)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔑 Admin login attempt:', email);
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }
    
    const admin = await Admin.findOne({ email });
    
    console.log('👤 Admin found:', !!admin);
    if (admin) {
      console.log('📊 Admin status - isActive:', admin.isActive, 'Has password:', !!admin.password);
    }
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isPasswordValid = await admin.comparePassword(password);
    console.log('🔐 Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    const token = generateAdminToken(admin._id, admin.email);
    
    console.log('✅ Token generated for admin:', admin.email);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. Create New Admin (Super Admin Only)
router.post('/create', authAdmin, authorize(['manage_admins']), async (req, res) => {
  try {
    const { email, password, name, permissions } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password, and name required' });
    }
    
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const admin = new Admin({
      email,
      password,
      name,
      permissions: permissions || ['view_orders', 'manage_products']
    });
    
    await admin.save();
    
    res.status(201).json({
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Get Admin Profile
router.get('/profile', authAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId);
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Update Admin Profile
router.put('/profile', authAdmin, async (req, res) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
      req.adminId,
      {
        name: req.body.name,
        email: req.body.email
      },
      { new: true }
    );
    
    res.json({ message: 'Profile updated', admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Change Password
router.post('/change-password', authAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const admin = await Admin.findById(req.adminId);
    
    const isPasswordValid = await admin.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    admin.password = newPassword;
    await admin.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
