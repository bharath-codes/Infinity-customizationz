// OTP Service - For now using simple in-memory (upgrade to Twilio/SMS later)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Send OTP (Currently logs to console - integrate Twilio/AWS SNS for real SMS)
const sendOTP = async (phoneNumber, otp) => {
  // TODO: Integrate with Twilio or AWS SNS for real SMS
  // For now, just log it
  console.log(`📱 OTP for ${phoneNumber}: ${otp}`);
  
  // Store OTP with 5 minute expiry
  otpStore.set(phoneNumber, {
    otp: otp,
    expiresAt: Date.now() + 5 * 60 * 1000
  });
  
  return true;
};

// Verify OTP
const verifyOTP = (phoneNumber, enteredOTP) => {
  const stored = otpStore.get(phoneNumber);
  
  if (!stored) {
    return { valid: false, message: "OTP expired or not found" };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phoneNumber);
    return { valid: false, message: "OTP expired" };
  }
  
  if (stored.otp !== enteredOTP) {
    return { valid: false, message: "Invalid OTP" };
  }
  
  otpStore.delete(phoneNumber);
  return { valid: true, message: "OTP verified" };
};

module.exports = { generateOTP, sendOTP, verifyOTP };
