# 🚀 UPI Payment System - Quick Start Guide

## Status: ✅ IMPLEMENTATION COMPLETE & RUNNING

---

## 🎯 What's Working Right Now

✅ **Backend Server** - Running on http://localhost:5000
✅ **Frontend Server** - Running on http://localhost:5174
✅ **MongoDB** - Connected and ready
✅ **All APIs** - Functional and tested
✅ **UPI System** - Complete and ready

---

## 📱 How to Test

### Option 1: User Checkout Flow

1. **Open Browser:**
   ```
   http://localhost:5174
   ```

2. **Navigate:**
   - Go to homepage
   - Click on any product

3. **Add to Cart:**
   - Select quantity
   - Click "Add to Cart"

4. **Go to Checkout:**
   - Click "Cart" button
   - Click "Proceed to Checkout"

5. **Fill Details:**
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Address: 123 Main Street
   - City: Mumbai
   - State: Maharashtra
   - Pincode: 400001

6. **Select Payment:**
   - Choose "UPI Payment"
   - Click "Place Order"

7. **See Payment Page:**
   - **Desktop:** QR Code (300x300px) appears
   - **Mobile:** "Open UPI App" button appears
   - Order ID: INF-XXXXXX-XXX
   - Amount: ₹XXXX

8. **Test Payment:**
   - Desktop: Scan QR with phone
   - Mobile: Click "Open UPI App"
   - Should open PhonePe/Google Pay/Paytm
   - Amount should be pre-filled

9. **Complete:**
   - Click "I have paid"
   - See success page with pending status

---

## 🔧 API Testing

### Test Order Creation

**Using PowerShell:**

```powershell
# Get a user token first (login)
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

# Now create an order
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$orderBody = @{
    items = @(@{
        productId = "pol1"
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

### Expected Response:
```json
{
  "orderId": "INF-123456-789",
  "upiDeepLink": "upi://pay?pa=test@upi&pn=Infinitly%20Customizations&am=5000&tr=INF-123456-789&tn=Order%20INF-123456-789"
}
```

---

## 👨‍💼 Admin Testing

### Test Payment Confirmation

```powershell
# Login as admin first
$adminLoginBody = @{
    email = "admin@example.com"
    password = "password123"
} | ConvertTo-Json

$adminResponse = Invoke-WebRequest `
    -Uri "http://localhost:5000/api/auth/admin/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $adminLoginBody

$adminToken = ($adminResponse.Content | ConvertFrom-Json).token

# Confirm payment
$headers = @{
    "Authorization" = "Bearer $adminToken"
}

Invoke-WebRequest `
    -Uri "http://localhost:5000/api/orders/admin/orders/ORDER_ID/confirm-payment" `
    -Method PUT `
    -Headers $headers
```

---

## 📊 Key Features to Test

### ✅ Desktop Experience
- [ ] QR code appears (300x300px)
- [ ] QR code is scannable
- [ ] "Open with UPI App" button visible
- [ ] Order ID displayed
- [ ] Amount calculated correctly

### ✅ Mobile Experience  
- [ ] QR code doesn't appear (mobile width)
- [ ] "Open UPI App" button appears
- [ ] Button opens UPI app
- [ ] Amount pre-filled
- [ ] Responsive layout works

### ✅ Payment Flow
- [ ] Order ID format correct: INF-XXXXXX-XXX
- [ ] UPI deep link has all parameters
- [ ] Amount includes shipping + tax
- [ ] Payment status shows pending_confirmation
- [ ] Success page shows correct message

### ✅ Admin Features
- [ ] Admin can see pending orders
- [ ] Can find by order ID
- [ ] "Confirm Payment" button appears
- [ ] Clicking confirms order
- [ ] Status updates to "confirmed"

---

## 🔍 File Locations

```
Frontend Code:
├── src/pages/Checkout.jsx          ← Main component (rebuilt)
├── src/services/api.js             ← API integration
├── src/contexts/CartContext.jsx    ← Cart management
└── src/contexts/AuthContext.jsx    ← User auth

Backend Code:
├── models/order.js                 ← Order schema (updated)
├── routes/orders.js                ← Order endpoints (updated)
├── services/upiService.js          ← UPI utilities (NEW)
├── server.js                       ← Main server
└── .env                            ← Configuration

Documentation:
├── UPI-PAYMENT-SYSTEM.md           ← Technical docs
├── UPI-PAYMENT-TEST-GUIDE.md       ← Testing guide
├── UPI-PAYMENT-CHECKLIST.md        ← Verification
└── UPI-PAYMENT-COMPLETE.md         ← Complete summary
```

---

## 🔧 Configuration

**Test UPI ID:**
```
test@upi
```

**Business Name:**
```
Infinitly Customizations
```

**Amount Calculation:**
```
Total = Subtotal + Shipping (₹100 if < ₹999) + 18% GST
```

**Order ID Format:**
```
INF-{6-digit timestamp}-{3-digit random}
```

---

## 🐛 Troubleshooting

### Issue: QR Code Not Showing

**Solution:**
1. Check browser width (> 768px for desktop)
2. Check browser console for errors
3. Verify qrcode library is installed: `npm list qrcode`
4. Check network tab for API response

### Issue: UPI Link Not Working

**Solution:**
1. Verify UPI ID is correct: `test@upi`
2. Check amount is numeric (no symbols)
3. Verify order ID is in transaction reference
4. Test with: `upi://pay?pa=test@upi&pn=Test&am=100&tr=INF-123456-789`

### Issue: API Error 401 (Unauthorized)

**Solution:**
1. Verify you have a valid token
2. Check Authorization header format: `Bearer {token}`
3. Re-login to get new token
4. Check token hasn't expired

### Issue: Order Not Created

**Solution:**
1. Check all required fields are provided
2. Verify product ID exists in database
3. Check MongoDB connection
4. Look at server logs for error message

---

## 📱 Testing on Actual Device

### Desktop Testing
1. Open http://localhost:5174 in browser
2. Complete checkout
3. Should see QR code
4. Scan with phone
5. Should open UPI app

### Mobile Testing
1. Get frontend IP: `ipconfig` → Look for IPv4
2. Open `http://YOUR_IP:5174` on phone
3. Complete checkout
4. Should see "Open UPI App" button
5. Click button to open UPI app

---

## 🚀 Next Steps

1. **Review Code**
   - Check frontend/src/pages/Checkout.jsx
   - Check backend/services/upiService.js
   - Review backend/routes/orders.js

2. **Test Features**
   - Complete full checkout flow
   - Test QR code generation
   - Test payment confirmation
   - Verify admin features

3. **Documentation**
   - Read UPI-PAYMENT-SYSTEM.md for details
   - Check UPI-PAYMENT-TEST-GUIDE.md for procedures
   - Review UPI-PAYMENT-CHECKLIST.md

4. **Deployment**
   - Plan go-live date
   - Configure production UPI ID
   - Set up monitoring
   - Train admin team

---

## 📞 Support

**For Technical Issues:**
- Check server logs: Look for error messages
- Check browser console: F12 → Console tab
- Check Network tab: F12 → Network tab
- Review documentation files

**For Testing Help:**
- Follow UPI-PAYMENT-TEST-GUIDE.md
- Use provided PowerShell examples
- Check API endpoint responses
- Verify database records

---

## ✅ Quick Checklist

- [x] Backend running ✅
- [x] Frontend running ✅
- [x] Database connected ✅
- [x] No build errors ✅
- [x] No runtime errors ✅
- [x] API endpoints functional ✅
- [x] QR code library installed ✅
- [x] Documentation complete ✅

---

## 🎉 You're All Set!

The UPI Payment System is fully implemented and running. You can:

✅ Create test orders
✅ Generate QR codes  
✅ Test payment flow
✅ Confirm payments as admin
✅ Track order status

**Happy Testing! 🚀**

---

**URLs:**
- Frontend: http://localhost:5174
- Backend: http://localhost:5000/api
- API Docs: See UPI-PAYMENT-SYSTEM.md

**Test Credentials:**
- User: Any registered user
- Admin: Check admin database

**Contact:** For issues, check documentation files or server logs
