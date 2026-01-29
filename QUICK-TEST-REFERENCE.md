# 🧪 TEST CREDENTIALS - Quick Reference

## USER LOGIN ✅
```
Phone: 9876543210
Password: password123
```
→ http://localhost:5174/login

---

## ADMIN LOGIN ✅
```
Email: admin@infinity.com
Password: admin123
```
→ http://localhost:5174/admin

---

## TEST PRODUCTS ✅

| Category | Product IDs |
|----------|------------|
| Frames | f1, f1b, f2, f3, f4, f5, f6, f7, f8, f9 |
| Memories | pol1, pol2 |
| Flowers | bou1, bou2 |
| Apparel | t1, t2 |
| Essentials | case1, cup1 |
| Addons | cal1, mag1 |
| Vintage | vf1, vl1 |
| Smart Digital | nfc1, id1 |

---

## TEST ORDER DETAILS ✅

```
Name: Test User
Email: test@example.com
Phone: 9876543210
Address: 123 Main Street
City: Mumbai
State: Maharashtra
Pincode: 400001
Payment: UPI
```

---

## QUICK TEST FLOW ✅

1. **Login User** → 9876543210 / password123
2. **Add Product** → f1 (₹199)
3. **Checkout** → Fill details above
4. **Payment** → Select UPI
5. **Order Created** → See Order ID
6. **Confirm** → Admin login & confirm payment
7. **Done** → Order status: CONFIRMED ✅

---

## API QUICK TESTS ✅

### Get Categories
```
GET http://localhost:5000/api/categories
```

### Create Order
```
POST http://localhost:5000/api/orders/create
Header: Authorization: Bearer {token}
```

### Get Orders
```
GET http://localhost:5000/api/orders/my-orders
Header: Authorization: Bearer {token}
```

### Confirm Payment (Admin)
```
PUT http://localhost:5000/api/orders/{id}/confirm-payment
Header: Authorization: Bearer {adminToken}
```

---

## EXPECTED AMOUNTS ✅

| Product | Price | + Shipping | + Tax (18%) | = Total |
|---------|-------|-----------|-----------|---------|
| f1 | ₹199 | ₹100 | ₹54 | **₹353** |
| f6 | ₹1,299 | FREE | ₹234 | **₹1,533** |
| pol1 | ₹899 | ₹100 | ₹180 | **₹1,179** |

---

## ORDER ID FORMAT ✅

```
INF-{6-digit-timestamp}-{3-digit-random}
Example: INF-123456-789
```

---

## UPI DEEP LINK FORMAT ✅

```
upi://pay?pa=test@upi&pn=Infinitly%20Customizations&am={amount}&tr={orderId}&tn=Order%20{orderId}
```

---

## STATUS CODES ✅

| Status | Meaning |
|--------|---------|
| pending | Waiting for payment |
| pending_confirmation | Waiting for admin verification |
| completed | Payment verified & confirmed |
| confirmed | Order ready for shipping |

---

## SERVERS ✅

- **Frontend:** http://localhost:5174
- **Backend:** http://localhost:5000
- **Database:** MongoDB (Connected)

---

## FILES MODIFIED ✅

```
✓ frontend/src/pages/Checkout.jsx
✓ backend/models/order.js
✓ backend/routes/orders.js
✓ backend/services/upiService.js (NEW)
```

---

## DOCUMENTATION ✅

- UPI-PAYMENT-SYSTEM.md
- UPI-PAYMENT-TEST-GUIDE.md
- TEST-CREDENTIALS.md (this file)
- UPI-QUICK-START.md

---

**Ready to Test? Go to: http://localhost:5174** 🚀
