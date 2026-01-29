# Test Credentials - UPI Payment System Testing

## ✅ Ready to Use Test IDs

---

## 👤 User Test Credentials

### User 1 (Phone-based Login)
```
Phone Number: 9876543210
Password: password123
Name: Demo User
Email: user@infinity.com
```

**How to Login:**
1. Go to: http://localhost:5174/login
2. Enter Phone: `9876543210`
3. Enter Password: `password123`
4. Click Login

**What you get:**
- Access to user dashboard
- Can browse products
- Can add to cart
- Can checkout with UPI payment

---

## 👨‍💼 Admin Test Credentials

### Admin Account (Super Admin)
```
Email: infinitycustomizations@gmail.com
Password: infinity@2026
Role: Super Admin
Permissions: All
```

**How to Login:**
1. Go to: http://localhost:5174/admin (or admin dashboard link)
2. Enter Email: `infinitycustomizations@gmail.com`
3. Enter Password: `infinity@2026`
4. Click Login

**What you get:**
- Admin dashboard access
- View all orders
- Confirm UPI payments
- Manage products
- View analytics

---

## 🧪 Test Data - Products Available

### Product IDs for Testing Orders

**Photo Frames:**
- f1, f1b, f2, f3, f4, f5, f6, f7, f8, f9

**Memories:**
- pol1, pol2

**Flowers:**
- bou1, bou2

**Apparel:**
- t1, t2

**Essentials:**
- case1, cup1

**Addons:**
- cal1, mag1

**Vintage:**
- vf1, vl1

**Smart Digital:**
- nfc1, id1

---

## 💳 Order Testing Guide

### Step 1: Create Test Order

Use these details:

```
Customer Name: Test User
Email: test@example.com
Phone: 9876543210
Address: 123 Main Street
City: Mumbai
State: Maharashtra
Pincode: 400001
Payment Method: UPI
```

### Step 2: Expected Amount Calculations

**Example Order (Product f1):**
```
Product Price: ₹199
Quantity: 1
Subtotal: ₹199
Shipping: ₹100 (order < ₹999)
Tax (18%): ₹54
Total: ₹353
```

**Example Order (Product f6):**
```
Product Price: ₹1,299
Quantity: 1
Subtotal: ₹1,299
Shipping: ₹0 (FREE - order > ₹999)
Tax (18%): ₹234
Total: ₹1,533
```

---

## 🔐 API Testing Credentials

### User Authentication Token

**Get Token with Login:**

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

$token = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $token"
```

**Use Token in Requests:**
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}
```

### Admin Authentication Token

**Get Admin Token:**

```powershell
$adminLoginBody = @{
    email = "admin@infinity.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/auth/admin/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $adminLoginBody

$adminToken = ($response.Content | ConvertFrom-Json).token
Write-Host "Admin Token: $adminToken"
```

---

## 🧪 Test API Endpoints

### Test 1: Get All Categories

```powershell
Invoke-WebRequest `
    -Uri "http://localhost:5000/api/categories" `
    -Method GET | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**Expected:** 10 categories with products

---

### Test 2: Create Order with UPI

```powershell
# First get user token
$loginBody = @{
    phoneNumber = "9876543210"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/auth/user/verify-credentials" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $loginBody

$token = ($loginResponse.Content | ConvertFrom-Json).token

# Create order
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$orderBody = @{
    items = @(@{
        productId = "f1"
        quantity = 1
    })
    customerName = "Test User"
    email = "test@example.com"
    phoneNumber = "9876543210"
    address = "123 Main St"
    city = "Mumbai"
    state = "Maharashtra"
    pincode = "400001"
    paymentMethod = "upi"
} | ConvertTo-Json

$response = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/orders/create" `
    -Method POST `
    -Headers $headers `
    -Body $orderBody

$result = $response.Content | ConvertFrom-Json
Write-Host "Order ID: $($result.orderId)"
Write-Host "UPI Link: $($result.upiDeepLink)"
```

**Expected Response:**
```json
{
  "orderId": "INF-123456-789",
  "upiDeepLink": "upi://pay?pa=test@upi&pn=Infinitly%20Customizations&am=353&tr=INF-123456-789&tn=Order%20INF-123456-789"
}
```

---

### Test 3: Get User Orders

```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest `
    -Uri "http://localhost:5000/api/orders/my-orders" `
    -Method GET `
    -Headers $headers | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**Expected:** List of user's orders

---

### Test 4: Admin Confirm Payment

```powershell
# Get admin token
$adminLoginBody = @{
    email = "admin@infinity.com"
    password = "admin123"
} | ConvertTo-Json

$adminResponse = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/auth/admin/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $adminLoginBody

$adminToken = ($adminResponse.Content | ConvertFrom-Json).token

# Confirm payment
$adminHeaders = @{
    "Authorization" = "Bearer $adminToken"
}

# Replace ORDER_ID with actual order ID from previous test
Invoke-WebRequest `
    -Uri "http://localhost:5000/api/orders/admin/orders/ORDER_ID/confirm-payment" `
    -Method PUT `
    -Headers $adminHeaders | ConvertFrom-Json | ConvertTo-Json -Depth 5
```

**Expected:** Order status changed to "confirmed"

---

## 🎯 Complete Testing Workflow

### Scenario 1: Happy Path (Full Order to Confirmation)

```
1. Login as user (9876543210 / password123)
   ↓
2. Add product f1 to cart (₹199)
   ↓
3. Go to checkout
   ↓
4. Enter delivery details
   ↓
5. Select UPI payment
   ↓
6. Click "Place Order"
   ↓
7. See QR code (desktop) or button (mobile)
   ↓
8. See order ID: INF-XXXXXX-XXX
   ↓
9. See amount: ₹353
   ↓
10. Click "I have paid"
    ↓
11. See success page
    ↓
12. Login as admin (admin@infinity.com / admin123)
    ↓
13. Find pending UPI order
    ↓
14. Click "Confirm Payment"
    ↓
15. Order status → "confirmed" ✅
```

---

### Scenario 2: Test QR Code

```
1. Login as user
2. Create order with product f6 (₹1,299)
3. On desktop, QR code should appear
4. Scan QR with mobile phone
5. UPI app should open with ₹1,533 pre-filled
6. Verify order ID in transaction note
```

---

### Scenario 3: Test Deep Link

```
1. Login as user
2. Create order with product pol1 (₹899)
3. Click "Open with UPI App" button
4. UPI app opens with ₹1,016 pre-filled
5. Complete payment
6. Return to app, click "I have paid"
7. Success page shows pending status
```

---

## 🔍 Common Test Cases

### Test Case 1: Order Amount Calculation
- Create order with f1 (₹199)
- Expected total: ₹199 + ₹100 (shipping) + ₹54 (tax) = ₹353 ✓

### Test Case 2: Free Shipping
- Create order with f6 (₹1,299)
- Expected total: ₹1,299 + ₹0 (FREE) + ₹234 (tax) = ₹1,533 ✓

### Test Case 3: Order ID Format
- Order ID should be: INF-{6-digits}-{3-digits}
- Example: INF-456789-123 ✓

### Test Case 4: UPI Link Format
- Should include: test@upi, amount, order ID
- Should work with PhonePe, Google Pay, Paytm ✓

### Test Case 5: Admin Confirmation
- Can only confirm orders with paymentStatus = pending_confirmation
- Updates status to completed ✓

---

## 📊 Test Database State

### Products Available: 50+
### Categories Available: 10
### Demo Users: 1
### Demo Admin: 1
### Demo Orders: Created during testing

---

## ✅ Quick Checklist

- [ ] User can login: 9876543210 / password123
- [ ] Admin can login: admin@infinity.com / admin123
- [ ] Products visible in catalog
- [ ] Can add products to cart
- [ ] Can complete checkout
- [ ] Can create UPI order
- [ ] QR code generates
- [ ] Order ID created (INF-XXXXXX-XXX)
- [ ] Admin can confirm payment
- [ ] Order status updates

---

## 🚀 Ready to Test!

All credentials are live and ready to use. Start with the **User Test Account** for full checkout testing.

**Next Steps:**
1. Open: http://localhost:5174
2. Login with: 9876543210 / password123
3. Add product to cart
4. Complete checkout
5. Test UPI payment flow

**Admin Testing:**
1. Open Admin Dashboard
2. Login with: admin@infinity.com / admin123
3. Go to Orders
4. Find pending UPI order
5. Click "Confirm Payment"

---

**Need Help?**
Check the browser console (F12) or server logs for detailed error messages.

**Servers Running:**
- Frontend: http://localhost:5174 ✅
- Backend: http://localhost:5000 ✅
- Database: MongoDB ✅

Good luck with testing! 🎉
