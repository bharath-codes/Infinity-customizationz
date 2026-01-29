# 🔐 OTP Authentication Guide

## OTP Flow Overview

The system uses a **2-step authentication** with OTP:

```
Step 1: Verify Phone & Password
   ↓ (Password checked)
Step 2: Send OTP to Phone
   ↓ (OTP logged to console in dev mode)
Step 3: User Enters OTP
   ↓ (OTP verified)
Step 4: Enter Name & Complete Registration
   ↓ (User account finalized)
Step 5: Generate Login Token
   ↓
User Logged In ✅
```

---

## 🧪 Testing OTP Authentication

### For Test User (9876543210)

**Step 1: Request OTP**

```powershell
$loginBody = @{
    phoneNumber = "9876543210"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/auth/user/verify-credentials" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $loginBody

$response.Content | ConvertFrom-Json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully. Check your phone and terminal (dev mode)",
  "phoneNumber": "9876543210"
}
```

⚠️ **Important:** Check the **server logs** for the OTP code!
```
📱 OTP for 9876543210: 123456
```

---

**Step 2: Verify OTP (Use code from server logs)**

```powershell
$otpBody = @{
    phoneNumber = "9876543210"
    otp = "123456"  # Replace with actual OTP from server logs
} | ConvertTo-Json

$otpResponse = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/auth/user/verify-otp" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $otpBody

$otpResponse.Content | ConvertFrom-Json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified. Please enter your name.",
  "phoneNumber": "9876543210"
}
```

---

**Step 3: Complete Registration & Get Token**

```powershell
$nameBody = @{
    phoneNumber = "9876543210"
    name = "Test User"
} | ConvertTo-Json

$tokenResponse = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/auth/user/complete-registration" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $nameBody

$result = $tokenResponse.Content | ConvertFrom-Json
$token = $result.token
Write-Host "Token: $token"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "phoneNumber": "9876543210",
    "name": "Test User",
    "role": "user"
  }
}
```

---

## 📊 OTP Details

### OTP Characteristics
```
Length: 6 digits
Format: 100000-999999
Validity: 5 minutes
Retry: Unlimited (but re-request OTP as needed)
Delivery: Console log (dev mode) / SMS (production)
```

### OTP Generation
```javascript
// Random 6-digit number
const otp = Math.floor(100000 + Math.random() * 900000);
```

---

## 🔍 How to Find OTP During Testing

**Backend Server Console Output:**

```
🚀 Server running on port 5000
✅ MongoDB Connected

[User tries to login]

📱 OTP for 9876543210: 456789  ← COPY THIS OTP
```

**Steps:**
1. Open backend terminal/console
2. Request OTP via API
3. Look for line: `📱 OTP for {phoneNumber}: {otp}`
4. Copy the 6-digit OTP
5. Use in `/verify-otp` endpoint

---

## ✅ Quick Test Flow

### Via Frontend (http://localhost:5174)

1. **Click Login**
2. **Enter Phone:** `9876543210`
3. **Enter Password:** `password123`
4. **Click Send OTP**
5. **Check Server Logs** for OTP code (look for `📱 OTP for...`)
6. **Enter OTP** in the form
7. **Enter Name:** `Test User`
8. **Submit** → Token received ✅

### Via API

```powershell
# 1. Request OTP
POST /api/auth/user/verify-credentials
{
  "phoneNumber": "9876543210",
  "password": "password123"
}

# 2. Check server logs for: 📱 OTP for 9876543210: XXXXXX

# 3. Verify OTP
POST /api/auth/user/verify-otp
{
  "phoneNumber": "9876543210",
  "otp": "XXXXXX"
}

# 4. Complete Registration
POST /api/auth/user/complete-registration
{
  "phoneNumber": "9876543210",
  "name": "Test User"
}

# Response includes token for further requests
```

---

## 🔐 Production vs Development

### Development Mode (Current)
```
✅ OTP logs to console
✅ No real SMS sent
✅ Easy testing
✅ 5 minute expiry
```

**Location to check:** Backend server console/terminal

---

### Production Mode (Future)
```
✅ OTP via real SMS (Twilio/AWS SNS)
✅ No console logs
✅ Secure delivery
✅ 5 minute expiry
```

**Integration needed:** Update `backend/services/otpService.js`

---

## ⚠️ Common Issues

### Issue: "OTP expired or not found"
**Solution:** 
- Request a new OTP
- Use it within 5 minutes
- Make sure you're using the correct OTP from server logs

### Issue: "Invalid OTP"
**Solution:**
- Check you copied OTP correctly
- Match phone number exactly
- No spaces or formatting

### Issue: "OTP not found in server logs"
**Solution:**
1. Make sure backend is running
2. Watch terminal while making request
3. Look for line starting with `📱`
4. Check stdout not stderr

---

## 📝 OTP Testing Checklist

- [ ] Backend server running
- [ ] Can request OTP via API
- [ ] OTP appears in server logs
- [ ] OTP is 6 digits
- [ ] Can verify OTP
- [ ] Can complete registration
- [ ] Receive token
- [ ] Token works for API calls

---

## 🚀 Test Credentials Reminder

**Phone:** 9876543210
**Password:** password123

**OTP:** Check server logs after requesting!

---

## 📞 OTP Service Methods

### generateOTP()
```javascript
// Generates random 6-digit OTP
const otp = generateOTP();
// Returns: "456789"
```

### sendOTP(phoneNumber, otp)
```javascript
// Sends OTP to phone (logs to console in dev)
await sendOTP("9876543210", "456789");
// Console output: 📱 OTP for 9876543210: 456789
```

### verifyOTP(phoneNumber, enteredOTP)
```javascript
// Verifies entered OTP
const result = verifyOTP("9876543210", "456789");
// Returns: { valid: true, message: "OTP verified" }
```

---

## 🔄 Authentication Flow Diagram

```
User App
   ↓
[Phone: 9876543210, Password: password123]
   ↓
POST /auth/user/verify-credentials
   ↓
Backend: Check password
   ↓
Generate OTP: 456789
   ↓
Log to console: 📱 OTP for 9876543210: 456789
   ↓
Return: "OTP sent successfully"
   ↓
User receives message
   ↓
[Check server logs for OTP]
   ↓
[Enter OTP: 456789]
   ↓
POST /auth/user/verify-otp
   ↓
Backend: Validate OTP (5 min expiry)
   ↓
Return: "OTP verified. Enter name"
   ↓
[Enter Name: Test User]
   ↓
POST /auth/user/complete-registration
   ↓
Backend: Create/update user
   ↓
Generate JWT token
   ↓
Return: Token ✅
   ↓
User Logged In
   ↓
Can use token for API calls
```

---

## 💡 Key Points

✅ **OTP is 6 digits** - Check server logs carefully
✅ **Valid for 5 minutes** - Use immediately after requesting
✅ **One-time use** - Must request new OTP for retry
✅ **Console visible** - Development mode shows all OTPs
✅ **No SMS needed** - Testing without real phone number
✅ **Easy to test** - Just watch the backend console

---

**Status:** ✅ Ready for testing

**Next Steps:**
1. Start backend server
2. Request OTP via API
3. Check server logs
4. Enter OTP and complete login
5. Use token for authenticated requests
