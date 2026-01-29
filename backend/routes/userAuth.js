const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { generateToken } = require('../services/tokenService');

// 1. Login with Phone & Password (Direct - No OTP)
router.post('/verify-credentials', async (req, res) => {
  try {
    const { phoneNumber, password, name } = req.body;
    
    if (!phoneNumber || !/^[6-9]\d{9}$/.test(phoneNumber)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }
    
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password required' });
    }

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Name required' });
    }
    
    // Check if user exists
    let user = await User.findOne({ phoneNumber });
    
    if (!user) {
      // Create new user with password (first time registration)
      user = new User({
        phoneNumber,
        password,
        name,
        role: 'user',
        isVerified: true
      });
      await user.save();
      console.log(`✅ New user created: ${phoneNumber}`);
    } else {
      // Existing user - verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }
      // Update name if provided
      if (name) {
        user.name = name;
        await user.save();
      }
      console.log(`✅ Login successful for: ${phoneNumber}`);
    }
    
    // Generate token
    const token = generateToken(user._id, user.role);
    
    return res.json({ 
      success: true,
      error: null,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal server error',
      message: err.message
    });
  }
});

// Legacy endpoint for compatibility (not used)
router.post('/verify-otp', async (req, res) => {
  return res.status(200).json({ success: true, message: 'OTP system removed' });
});

// Legacy endpoint for compatibility (not used)
router.post('/complete-registration', async (req, res) => {
  return res.status(200).json({ success: true, message: 'OTP system removed' });
});

// 4. Update User Profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token required' });
    }
    
    const { verifyToken } = require('../services/tokenService');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    const user = await User.findByIdAndUpdate(
      decoded.userId,
      {
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode
      },
      { new: true }
    );
    
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Get User Profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Token required' });
    }
    
    const { verifyToken } = require('../services/tokenService');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    const user = await User.findById(decoded.userId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
