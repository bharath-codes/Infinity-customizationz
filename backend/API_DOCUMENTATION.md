# Infinity Shop - Backend API Documentation

## Overview
Complete e-commerce backend with User & Admin authentication, order management, and Shiprocket integration.

---

## 🔐 AUTHENTICATION

### USER AUTHENTICATION (Phone Number + OTP)

#### 1. Request OTP
```
POST /api/auth/user/request-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210"
}
```

**Response:**
```json
{
  "message": "OTP sent successfully",
  "phoneNumber": "9876543210"
}
```

#### 2. Verify OTP & Login/Register
```
POST /api/auth/user/verify-otp
Content-Type: application/json

{
  "phoneNumber": "9876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "phoneNumber": "9876543210",
    "name": "",
    "email": "",
    "role": "user"
  }
}
```

#### 3. Get User Profile
```
GET /api/auth/user/profile
Authorization: Bearer <token>
```

#### 4. Update User Profile
```
PUT /api/auth/user/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001"
}
```

---

### ADMIN AUTHENTICATION (Email + Password)

#### 1. Admin Login
```
POST /api/auth/admin/login
Content-Type: application/json

{
  "email": "admin@infinitlyshop.com",
  "password": "secure_password_123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "email": "admin@infinitlyshop.com",
    "name": "Admin Name",
    "role": "admin",
    "permissions": [
      "view_orders",
      "update_orders",
      "manage_products",
      "view_images",
      "trigger_shipment"
    ]
  }
}
```

#### 2. Create New Admin (Super Admin Only)
```
POST /api/auth/admin/create
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "newadmin@infinitlyshop.com",
  "password": "new_password_123",
  "name": "New Admin",
  "permissions": ["view_orders", "manage_products"]
}
```

#### 3. Get Admin Profile
```
GET /api/auth/admin/profile
Authorization: Bearer <admin_token>
```

#### 4. Update Admin Profile
```
PUT /api/auth/admin/profile
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "newemail@infinitlyshop.com"
}
```

#### 5. Change Admin Password
```
POST /api/auth/admin/change-password
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "currentPassword": "old_password_123",
  "newPassword": "new_password_456"
}
```

---

## 📦 PRODUCT MANAGEMENT

### Get All Products (Public)
```
GET /api/products
```

### Get Products by Category (Public)
```
GET /api/products/category/frames
```

**Available categories:**
- `frames` - Photo Frames
- `magazines` - Magazines & Photobooks
- `apparel` - T-shirts & Hoodies
- `polaroids` - Polaroid Prints
- `flowers` - Flowers & Gifts
- `smart-digital` - Canvas, Metal Prints, etc.

### Get Single Product (Public)
```
GET /api/products/65a1b2c3d4e5f6g7h8i9j0k1
```

### Create Product (Admin Only)
```
POST /api/products
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "New Photo Frame",
  "categoryId": "frames",
  "price": 499,
  "image": "/images/frame.jpg",
  "images": ["/images/frame.jpg", "/images/frame-2.jpg"],
  "description": "Beautiful wooden frame",
  "inStock": true
}
```

### Update Product (Admin Only)
```
PUT /api/products/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Updated Frame Name",
  "price": 599,
  "description": "Updated description"
}
```

### Delete Product (Admin Only)
```
DELETE /api/products/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer <admin_token>
```

---

## 🛒 ORDER MANAGEMENT

### Create Order (User)
```
POST /api/orders/create
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "items": [
    {
      "productId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "quantity": 2,
      "customizationDetails": "Custom photo upload"
    }
  ],
  "phoneNumber": "9876543210",
  "customerName": "John Doe",
  "email": "john@example.com",
  "address": "123 Main St",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "paymentMethod": "cod",
  "customerNotes": "Please deliver carefully"
}
```

**Response:**
```json
{
  "message": "Order created successfully",
  "order": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "phoneNumber": "9876543210",
    "customerName": "John Doe",
    "items": [...],
    "subtotal": 998,
    "shippingCost": 100,
    "tax": 179.64,
    "totalAmount": 1277.64,
    "status": "pending",
    "paymentMethod": "cod",
    "createdAt": "2026-01-23T..."
  }
}
```

### Get My Orders (User)
```
GET /api/orders/my-orders
Authorization: Bearer <user_token>
```

### Get Single Order (User)
```
GET /api/orders/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer <user_token>
```

### Upload Custom Images to Order (User)
```
POST /api/orders/65a1b2c3d4e5f6g7h8i9j0k1/upload-images
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "images": [
    {
      "name": "photo1.jpg",
      "url": "https://example.com/photo1.jpg"
    },
    {
      "name": "photo2.jpg",
      "url": "https://example.com/photo2.jpg"
    }
  ]
}
```

---

## 👨‍💼 ADMIN ORDERS MANAGEMENT

### Get All Orders (Admin)
```
GET /api/orders/admin/orders?status=pending&phoneNumber=9876543210
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, processing, shipped, delivered, cancelled)
- `phoneNumber` - Filter by customer phone number

### Get Single Order Details (Admin)
```
GET /api/orders/admin/orders/65a1b2c3d4e5f6g7h8i9j0k1
Authorization: Bearer <admin_token>
```

### Update Order Status (Admin)
```
PUT /api/orders/admin/orders/65a1b2c3d4e5f6g7h8i9j0k1/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "confirmed",
  "adminNotes": "Order confirmed and processing started"
}
```

**Valid statuses:**
- `pending` - New order
- `confirmed` - Order confirmed
- `processing` - Being processed
- `shipped` - Shipped
- `delivered` - Delivered
- `cancelled` - Cancelled

### View Order Images (Admin)
```
GET /api/orders/admin/orders/65a1b2c3d4e5f6g7h8i9j0k1/images
Authorization: Bearer <admin_token>
```

### Add Admin Notes (Admin)
```
PUT /api/orders/admin/orders/65a1b2c3d4e5f6g7h8i9j0k1/notes
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "notes": "Images received and processing started"
}
```

### Trigger Shiprocket Shipment (Admin)
```
POST /api/orders/admin/orders/65a1b2c3d4e5f6g7h8i9j0k1/ship
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "message": "Shipment triggered",
  "shiprocketOrderId": "SRP-1674432893123",
  "order": { ... }
}
```

---

## 🚚 SHIPROCKET INTEGRATION

### Setup Instructions

1. **Get Shiprocket Credentials:**
   - Sign up at https://shiprocket.in
   - Get your email and password

2. **Add to .env file:**
```
SHIPROCKET_EMAIL=your_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_shiprocket_password
```

3. **Features Included:**
   - ✅ Automatic order creation in Shiprocket
   - ✅ Track shipments
   - ✅ Generate manifests
   - ✅ Cancel shipments if needed

---

## 📱 OTP SERVICE

Currently uses in-memory OTP (logs to console for development).

**To integrate with Twilio SMS:**

1. Install Twilio:
```bash
npm install twilio
```

2. Update `.env`:
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

3. Update `services/otpService.js` to use Twilio's client.

---

## 🗂️ Project Structure

```
backend/
├── models/
│   ├── product.js       (Product schema)
│   ├── user.js          (User schema with phone + OTP)
│   ├── admin.js         (Admin schema with password)
│   └── order.js         (Order schema with items & shipping)
├── routes/
│   ├── userAuth.js      (User login/profile routes)
│   ├── adminAuth.js     (Admin login/management routes)
│   └── orders.js        (Order management for user & admin)
├── services/
│   ├── otpService.js    (OTP generation & verification)
│   ├── tokenService.js  (JWT token generation & verification)
│   └── shiprocketService.js (Shiprocket API integration)
├── middleware/
│   └── auth.js          (Authentication & authorization middleware)
├── server.js            (Main server file)
├── seed.js              (Database seeding script)
├── .env                 (Environment variables)
└── package.json         (Dependencies)
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create `.env` file with:
```
MONGO_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your-user-jwt-secret
JWT_ADMIN_SECRET=your-admin-jwt-secret
SHIPROCKET_EMAIL=optional
SHIPROCKET_PASSWORD=optional
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev        # Development with nodemon
npm start          # Production
```

Server runs on `http://localhost:5000`

---

## 🔑 Admin Setup

### Create Your First Admin Account

Run this in Node.js REPL or create a script:

```javascript
const mongoose = require('mongoose');
const Admin = require('./models/admin');

mongoose.connect('your_mongo_uri');

const admin = new Admin({
  email: 'admin@infinitlyshop.com',
  password: 'your_secure_password',
  name: 'Admin Name',
  role: 'super_admin',
  permissions: [
    'view_orders',
    'update_orders',
    'manage_products',
    'view_images',
    'manage_admins',
    'trigger_shipment'
  ]
});

admin.save().then(() => {
  console.log('Admin created successfully!');
  mongoose.disconnect();
});
```

Or use the create admin endpoint after you have one admin account.

---

## 📊 Database Models

### User Model
```javascript
{
  phoneNumber: String (unique, required),
  otp: String,
  otpExpiry: Date,
  isVerified: Boolean,
  name: String,
  email: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  role: String (enum: ["user", "admin"]),
  createdAt: Date,
  updatedAt: Date
}
```

### Admin Model
```javascript
{
  email: String (unique, required),
  password: String (bcrypted, required),
  name: String (required),
  role: String (enum: ["admin", "super_admin"]),
  permissions: Array[String],
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  userId: ObjectId,
  phoneNumber: String,
  customerName: String,
  email: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  items: [{productId, productName, price, quantity, customizationDetails}],
  subtotal: Number,
  shippingCost: Number,
  tax: Number,
  totalAmount: Number,
  status: String (enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]),
  paymentMethod: String (enum: ["cod", "upi", "card"]),
  paymentStatus: String (enum: ["pending", "completed", "failed"]),
  shiprocketOrderId: String,
  trackingNumber: String,
  shippedDate: Date,
  uploadedImages: [{fileName, fileUrl, uploadedAt}],
  adminNotes: String,
  customerNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## ⚙️ Permissions System

**Admin Permissions:**
- `view_orders` - Can view all orders
- `update_orders` - Can update order status & notes
- `manage_products` - Can add/edit/delete products
- `view_images` - Can view customer uploaded images
- `manage_admins` - Can create other admins
- `trigger_shipment` - Can trigger Shiprocket shipments

---

## 📝 Error Handling

All errors return standardized JSON:
```json
{
  "message": "Error description",
  "error": "Detailed error message (optional)"
}
```

---

## 🔒 Security Features

✅ Password hashing with bcryptjs  
✅ JWT tokens for secure authentication  
✅ Role-based access control  
✅ OTP-based user authentication  
✅ Separate admin authentication system  
✅ CORS enabled for frontend communication  

---

## 🎯 Next Steps

1. Setup Shiprocket account & credentials
2. Configure OTP service (Twilio/AWS SNS)
3. Add file upload handling for order images
4. Setup payment gateway integration (Razorpay/PayU)
5. Add email notifications
6. Deploy to production

---

## 📞 Support

For issues or questions, refer to the code comments or contact your development team.

Happy coding! 🚀
