const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'infinity_shop_user_secret_key_2026_with_random_entropy';
  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn: '7d' }
  );
};

// Generate Admin JWT Token
const generateAdminToken = (adminId, email) => {
  const secret = process.env.JWT_ADMIN_SECRET || 'infinity_shop_admin_secret_key_2026_super_secure_key';
  const token = jwt.sign(
    { adminId, email, isAdmin: true },
    secret,
    { expiresIn: '7d' }
  );
  console.log(`🔐 Generated admin token for: ${email} (ID: ${adminId})`);
  return token;
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    const secret = process.env.JWT_SECRET || 'infinity_shop_user_secret_key_2026_with_random_entropy';
    return jwt.verify(token, secret);
  } catch (err) {
    console.warn(`⚠️ User token verification failed: ${err.message}`);
    return null;
  }
};

// Verify Admin JWT Token
const verifyAdminToken = (token) => {
  try {
    const secret = process.env.JWT_ADMIN_SECRET || 'infinity_shop_admin_secret_key_2026_super_secure_key';
    const decoded = jwt.verify(token, secret);
    console.log(`✅ Admin token verified for: ${decoded.email}`);
    return decoded;
  } catch (err) {
    console.warn(`⚠️ Admin token verification failed: ${err.message}`);
    return null;
  }
};

module.exports = { generateToken, generateAdminToken, verifyToken, verifyAdminToken };
