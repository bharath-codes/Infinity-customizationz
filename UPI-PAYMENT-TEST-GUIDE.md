# UPI Payment System - Quick Test Guide

## 🚀 Getting Started

### Prerequisites
- ✅ Backend running on `http://localhost:5000`
- ✅ Frontend running on `http://localhost:5174`
- ✅ MongoDB connected
- ✅ Node modules installed (npm install done)

### Current Status
- **Order Creation:** ✅ Working
- **UPI Deep Links:** ✅ Generated dynamically
- **QR Codes:** ✅ Generated on frontend
- **Payment Confirmation:** ✅ Admin endpoint ready
- **Database:** ✅ All fields added

---

## 📱 Frontend Testing

### Step 1: Login to User Account
```
URL: http://localhost:5174/login
Username: user@example.com
Password: password123
```

### Step 2: Add Product to Cart
1. Go to home page
2. Click any product
3. Click "Add to Cart"
4. Proceed to checkout

### Step 3: Test Checkout Flow

#### Desktop Testing
1. Click "Proceed to Checkout"
2. Fill delivery details:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Address: 123 Main Street
   - City: Mumbai
   - State: Maharashtra
   - Pincode: 400001
3. Select "UPI Payment"
4. Click "Place Order"
5. **You should see:**
   - ✅ Order ID: `INF-XXXXXX-XXX`
   - ✅ QR Code (300x300px)
   - ✅ Amount display
   - ✅ "Open with UPI App" button
   - ✅ "I have paid" button

#### Mobile Testing
1. Open on mobile device (or use mobile emulation)
2. Same checkout flow
3. **You should see:**
   - ✅ "Open UPI App" button (not QR code)
   - ✅ Amount display
   - ✅ "I have paid" button

### Step 4: Test Payment Flow

**Option 1: Actually Pay via UPI**
1. Click "Open with UPI App" button
2. Select UPI app (PhonePe, Google Pay, etc.)
3. Verify amount is pre-filled
4. Complete payment
5. Return to app
6. Click "I have paid"

**Option 2: Simulate Payment**
1. Just click "I have paid" (no actual payment needed)
2. Success page should show:
   - ✅ Order ID (copyable)
   - ✅ Status: "Payment pending confirmation"
   - ✅ "Notify on WhatsApp" button
   - ✅ "Continue Shopping" button

---

## 🔧 Backend API Testing

### Test Order Creation via API

```bash
# PowerShell command
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_TOKEN_HERE"
}

$body = @{
    items = @(
        @{
            productId = "PRODUCT_ID"
            quantity = 1
        }
    )
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
    -Body $body

$response.Content | ConvertFrom-Json
```

**Expected Response:**
```json
{
  "message": "Order created successfully",
  "orderId": "INF-123456-789",
  "upiDeepLink": "upi://pay?pa=test@upi&pn=Infinitly%20Customizations&am=5000&tr=INF-123456-789&tn=Order%20INF-123456-789"
}
```

### Test Admin Payment Confirmation

```bash
$adminHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer ADMIN_TOKEN_HERE"
}

Invoke-WebRequest `
    -Uri "http://localhost:5000/api/orders/admin/orders/ORDER_ID/confirm-payment" `
    -Method PUT `
    -Headers $adminHeaders
```

**Expected Response:**
```json
{
  "message": "Payment confirmed successfully",
  "order": {
    "paymentStatus": "completed",
    "paymentConfirmedBy": "admin_username",
    "paymentConfirmedAt": "2024-01-15T10:30:00Z",
    "status": "confirmed"
  }
}
```

---

## ✅ Key Test Cases

### Test Case 1: Order ID Generation
- [ ] Order ID follows format: `INF-XXXXXX-XXX`
- [ ] Each order gets unique ID
- [ ] ID is same in response and database

### Test Case 2: UPI Deep Link Generation
- [ ] Link includes test@upi
- [ ] Amount is correctly calculated (subtotal + shipping + tax)
- [ ] Order ID is in transaction reference
- [ ] Link is URL encoded properly

### Test Case 3: QR Code Display
- [ ] Desktop (width > 768px): Show QR code
- [ ] Mobile (width < 768px): Hide QR code, show button
- [ ] QR code is 300x300px
- [ ] QR code is readable (dark blue on white)

### Test Case 4: Payment Status Flow
- [ ] After order: `paymentStatus = "pending_confirmation"`
- [ ] After "I have paid": Status remains `pending_confirmation`
- [ ] After admin confirms: Status = `completed`
- [ ] Order status changes to `confirmed`

### Test Case 5: Admin Confirmation
- [ ] Admin can see pending UPI orders
- [ ] "Confirm Payment" button only shows for UPI pending orders
- [ ] Button updates order status correctly
- [ ] Confirmation timestamp is recorded

---

## 🐛 Debugging

### Frontend Issues

**QR Code not showing:**
```javascript
// Check browser console
console.log(upiData);
console.log(qrCodeUrl);
// Should see QR code data URL
```

**Deep link not working:**
- Verify UPI app is installed
- Check URL in browser address bar
- Test link format: `upi://pay?...`

**API errors:**
- Check Network tab in DevTools
- Verify backend is running
- Check authorization token

### Backend Issues

**Order not created:**
```bash
# Check server logs
# Should see: "Order created successfully" or error message
```

**Payment confirmation failing:**
- Verify order exists
- Verify order has `paymentStatus = "pending_confirmation"`
- Verify order has `paymentMethod = "upi_qr"`
- Check admin authorization

---

## 📊 Expected Data Flow

### Successful Order → Confirmation Flow

1. **Frontend → Backend: Create Order**
   ```
   POST /api/orders/create
   Body: {items, customerName, email, phone, address, paymentMethod: "upi"}
   ```

2. **Backend Response: Order Created**
   ```
   Response: {orderId, upiDeepLink}
   Database: Order saved with paymentStatus: "pending_confirmation"
   ```

3. **Frontend: Payment Page**
   ```
   Show: Order ID, Amount, QR Code (desktop) / Button (mobile)
   Generate: QRCode from upiDeepLink
   ```

4. **User: Click "I have paid"**
   ```
   Frontend: Store order data
   Display: Success page with pending status
   Database: Order still pending_confirmation
   ```

5. **Admin: Confirm Payment**
   ```
   PUT /api/orders/{orderId}/confirm-payment
   Update: paymentStatus = "completed", status = "confirmed"
   Response: Confirmation details
   ```

6. **Order Ready for Processing**
   ```
   Display: "Confirmed" status in admin
   Send: Shipping instructions
   Customer: Can track shipment
   ```

---

## 📝 Test Data

### Sample Order Details
```
Customer Name: Rajesh Kumar
Email: rajesh@example.com
Phone: 9876543210
Address: 123, Raj Nivas, Colaba
City: Mumbai
State: Maharashtra
Pincode: 400005
```

### Sample Product IDs
- Memory Frame: `pol1`, `pol2`
- Bouquet: `bou1`, `bou2`
- T-Shirt: `t1`, `t2`
- Phone Case: `case1`
- Coffee Cup: `cup1`

### Sample Order Amounts
- Single product: ₹500-2000
- Multiple items: ₹3000-5000
- With shipping: Add ₹100 (if subtotal < ₹999)
- With tax: Add 18% GST

---

## 🔐 Authentication

### User Token
```bash
# Login endpoint
POST /api/auth/user/verify-credentials
Headers: Content-Type: application/json
Body: { phoneNumber, password }

# Response includes: token, userId
# Use token in Authorization header for subsequent requests
```

### Admin Token  
```bash
# Login endpoint
POST /api/auth/admin/login
Headers: Content-Type: application/json
Body: { email, password }

# Response includes: adminToken
# Use for admin endpoints with 'update_orders' permission
```

---

## 🎯 Success Criteria

✅ **Checkout Flow Works**
- User can complete all 3 steps
- Order is created in database
- Order ID and amount are correct

✅ **Payment Page Works**
- QR code displays on desktop
- Deep link button works on mobile
- "I have paid" button is functional

✅ **Success Page Works**
- Shows pending confirmation status
- Displays order ID
- WhatsApp notification link works

✅ **Admin Confirmation Works**
- Admin can see pending UPI orders
- Can confirm payment
- Order status updates correctly

✅ **Data Integrity**
- Order ID format is correct
- UPI deep link has all parameters
- Payment status transitions are correct
- Database records are complete

---

## 🚀 Next Steps

1. ✅ **Test User Checkout:** Go through entire flow
2. ✅ **Test Payment:** Pay via actual UPI or simulate
3. ✅ **Test Admin Dashboard:** Find and confirm orders
4. ✅ **Test QR Code:** Scan with mobile device
5. ✅ **Test WhatsApp:** Click notification link
6. ✅ **Check Database:** Verify records are saved
7. ✅ **Check Logs:** Verify no errors in console

---

**Happy Testing! 🎉**

For issues or questions, check the backend logs and browser console for detailed error messages.
