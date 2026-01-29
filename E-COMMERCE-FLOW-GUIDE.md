# Complete E-Commerce Flow with Shiprocket Integration Guide

## Overview
This document outlines the complete customer purchase journey in the Infinity Shop application, from product selection through delivery tracking via Shiprocket.

---

## Part 1: Product Page Flow

### Components Involved
- **[ProductPage](frontend/src/App.jsx#L327)** - Product details and purchase options
- **[CartContext](frontend/src/contexts/CartContext.jsx)** - Global cart state management
- **useCart Hook** - Cart operations across components

### User Actions & Flow

#### 1. View Product Details
```
User navigates to /product/:id
→ ProductPage component loads
→ Displays: Product name, price, images, quantity selector
```

#### 2. Select Quantity
```
User clicks +/- buttons
→ Quantity updates (minimum: 1)
→ Price updates dynamically: ₹price × qty
```

#### 3. Two Purchase Options

**Option A: "Add to Cart" (Gray Button)**
```
User clicks "Add to Cart"
→ Item added to cart via addToCartContext()
→ Item persisted to localStorage
→ User can continue shopping
→ View cart at /cart
```

**Option B: "Buy Now" (Blue Button)**
```
User clicks "Buy Now"
→ Item added to cart via addToCartContext()
→ Cart cleared from localStorage for this session
→ Immediate redirect to /checkout
→ Start checkout process
```

### Code Example
```jsx
const handleBuyNow = () => {
  const item = {...p, quantity: qty, finalPrice: p.price*qty};
  addToCart(item);           // Legacy cart state
  addToCartContext(item);    // CartContext (new)
  navigate('/checkout');     // Navigate to checkout
};
```

---

## Part 2: Shopping Cart & Checkout

### Cart Page (`/cart`)
- **File**: [Cart component in App.jsx](frontend/src/App.jsx#L373)
- **Features**:
  - Display all cart items with images
  - Adjust quantities or remove items
  - Shows subtotal + shipping charges
  - "Proceed to Checkout" button navigates to `/checkout`

### Checkout Page (`/checkout`)
- **File**: [Checkout.jsx](frontend/src/pages/Checkout.jsx)
- **Flow**: 3-step process

#### Step 1: Delivery Details
```
User fills form:
├─ Name
├─ Email
├─ Phone Number
├─ Full Address
├─ City
├─ State
├─ Pincode
└─ Payment Method (Online/COD)

Form validation checks:
✓ All fields required
✓ Phone number format (10 digits)
✓ Pincode format (6 digits)
✓ Cart not empty

On submit → Step 2: Processing
```

#### Step 2: Order Processing
```
Step "processing" displays:
├─ Loading spinner
├─ Message: "Processing your order..."
└─ Creates order in backend

Backend Operations:
1. Create Order in MongoDB
   - Customer details
   - Items & pricing
   - Status: 'pending'
   - Payment method

2. Integrate with Shiprocket
   - Call POST /api/orders/integrate-shiprocket
   - Shiprocket creates shipment
   - Receives:
     - shiprocketOrderId
     - shiprocketTrackingId
     - Estimated delivery date

Order updated with tracking info
```

#### Step 3: Success & Tracking
```
Success page displays:
├─ ✅ Order Confirmed message
├─ Order Details
│  ├─ Order ID
│  ├─ Customer Name
│  ├─ Delivery Address
│  └─ Total Amount
├─ Tracking Information
│  ├─ Shiprocket Tracking ID
│  ├─ Estimated Delivery
│  ├─ Carrier: Shiprocket
│  └─ Current Status
└─ "WhatsApp Photos" Button
   └─ Opens WhatsApp with order message

User can:
✓ Share tracking link
✓ Send photos via WhatsApp
✓ Continue shopping (back to home)
```

---

## Part 3: Backend Order Processing

### Order Creation Endpoint
- **Route**: `POST /api/orders/create`
- **Endpoint**: [orders.js](backend/routes/orders.js#L18-L80)
- **Input**:
```javascript
{
  customerName: "John Doe",
  email: "john@example.com",
  phoneNumber: "9876543210",
  address: "123 Main St",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  paymentMethod: "online",
  items: [
    {
      productId: "prod_1",
      name: "Custom T-Shirt",
      price: 499,
      quantity: 2,
      image: "url..."
    }
  ],
  subtotal: 998,
  shipping: 0,
  total: 998
}
```

- **Output**: Order object with `_id`, `shiprocketOrderId` (if shipment created)

### Shiprocket Integration Endpoint
- **Route**: `POST /api/orders/integrate-shiprocket`
- **Endpoint**: [orders.js](backend/routes/orders.js#L277-L330)
- **Process**:

1. **Validate Order**
   ```javascript
   - Check order exists
   - Verify order ownership (user authorization)
   - Verify cart items still available
   ```

2. **Call Shiprocket Service**
   ```javascript
   shiprocketService.createShiprocketOrder(order)
   ```

3. **Shiprocket Service Flow** ([shiprocketService.js](backend/services/shiprocketService.js))
   ```
   1. Authenticate with Shiprocket API
      - Email: process.env.SHIPROCKET_EMAIL
      - Password: process.env.SHIPROCKET_PASSWORD
      - Returns: Access token (cached for 12 hours)

   2. Create Order on Shiprocket
      - Endpoint: POST https://apiv2.shiprocket.in/v1/external/orders/create/adhoc
      - Payload:
        {
          order_id: "INFINITY_123",
          order_date: "2024-01-15",
          pickup_location_id: 123456,
          billing_customer_name: "John Doe",
          billing_last_name: "",
          billing_address: "123 Main St",
          billing_city: "Mumbai",
          billing_state: "Maharashtra",
          billing_country: "India",
          billing_email: "john@example.com",
          billing_phone: "9876543210",
          shipping_customer_name: "John Doe",
          shipping_last_name: "",
          shipping_address: "123 Main St",
          shipping_city: "Mumbai",
          shipping_state: "Maharashtra",
          shipping_country: "India",
          shipping_email: "john@example.com",
          shipping_phone: "9876543210",
          order_items: [...],
          payment_method: "online",
          cod: false,
          length: 10,
          breadth: 10,
          height: 10,
          weight: 0.5
        }

      - Response: {
          order_id: "INFINITY_123",
          shipment_id: "SHIP_12345",
          channel_order_id: "CHAN_12345",
          awb: "1234567890",
          status: "success"
        }

   3. Get Shipment Details
      - Retrieve tracking URL
      - Extract estimated delivery date
      - Get carrier details

   4. Return to Backend
      {
        success: true,
        shiprocketOrderId: "SHIP_12345",
        trackingId: "1234567890",
        trackingUrl: "https://shiprocket.in/track/...",
        estimatedDelivery: "2024-01-18",
        carrier: "Shiprocket"
      }
   ```

4. **Update Order in MongoDB**
   ```javascript
   Order.shiprocketOrderId = "SHIP_12345"
   Order.shiprocketTrackingId = "1234567890"
   Order.status = "confirmed"
   ```

5. **Return Response to Frontend**
   ```javascript
   {
     success: true,
     order: { _id, shiprocketOrderId, shiprocketTrackingId, ... },
     tracking: {
       id: "1234567890",
       url: "https://shiprocket.in/track/...",
       estimatedDelivery: "2024-01-18",
       carrier: "Shiprocket"
     }
   }
   ```

---

## Part 4: Frontend Cart State Management

### CartContext ([CartContext.jsx](frontend/src/contexts/CartContext.jsx))

**State Structure**:
```javascript
{
  cart: [
    {
      id: "prod_1",
      name: "Custom T-Shirt",
      price: 499,
      quantity: 2,
      image: "url...",
      finalPrice: 998
    }
  ]
}
```

**Key Methods**:
```javascript
// Add item to cart (merge if exists)
addToCart(product)

// Update item quantity (remove if qty becomes 0)
updateQuantity(productId, quantity)

// Remove single item
removeFromCart(productId)

// Get total items count
getTotalItems() → 5

// Get total price
getTotalPrice() → 1498

// Clear entire cart
clearCart()
```

**localStorage Persistence**:
- **Key**: `'cart'`
- **Sync**: Auto-save on any cart change
- **Load**: On app mount (useEffect)
- **Example**:
```javascript
const [cart, setCart] = useState([]);

// Load from storage on mount
useEffect(() => {
  const saved = localStorage.getItem('cart');
  if (saved) setCart(JSON.parse(saved));
}, []);

// Save to storage on change
useEffect(() => {
  localStorage.setItem('cart', JSON.stringify(cart));
}, [cart]);
```

---

## Part 5: Order Model Schema

### MongoDB Order Schema ([order.js](backend/models/order.js))

```javascript
{
  _id: ObjectId,
  
  // User Reference
  userId: ObjectId (ref: User),
  
  // Customer Information
  customerName: String (required),
  email: String (required),
  phoneNumber: String (required),
  
  // Shipping Address
  address: String (required),
  city: String (required),
  state: String (required),
  pincode: String (required),
  
  // Order Items
  items: [
    {
      productId: ObjectId,
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],
  
  // Pricing
  subtotal: Number,
  shippingCost: Number,
  taxAmount: Number,
  totalAmount: Number,
  
  // Status Tracking
  status: String (enum: [
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  ]),
  
  // Shiprocket Integration ⭐
  shiprocketOrderId: String,
  shiprocketTrackingId: String,
  
  // Payment
  paymentMethod: String (online/cod),
  paymentStatus: String,
  
  // Files
  uploadedImages: [String],
  
  // Admin Notes
  adminNotes: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## Part 6: Complete User Journey Diagram

```
START
  ↓
[Browse Products] /shop/:id
  ↓
[View Product Details] /product/:id
  ↓
┌─────────────────────────────────────┐
│ SELECT ACTION                       │
├─────────────────────────────────────┤
│                                     │
│  "Buy Now" ──────┐                 │
│                  │                 │
│  "Add to Cart" ──┤                 │
│                  │                 │
└────────┬─────────┤─────────────────┘
         │         │
         │     [Add to Cart]
         │         ↓
         │     [View Cart] /cart
         │         ↓
         │     [Proceed to Checkout]
         │         ↓
         └─→ [Checkout Page] /checkout
              ↓
              ┌────────────────────────┐
              │ STEP 1: DETAILS        │
              ├────────────────────────┤
              │ • Name                 │
              │ • Email                │
              │ • Phone                │
              │ • Address              │
              │ • City, State, Pincode │
              │ • Payment Method       │
              └────────────────────────┘
              ↓
              ┌────────────────────────┐
              │ STEP 2: PROCESSING     │
              ├────────────────────────┤
              │ • Create Order         │
              │ • Integrate Shiprocket │
              │ • Generate Tracking ID │
              └────────────────────────┘
              ↓
              ┌────────────────────────┐
              │ STEP 3: SUCCESS        │
              ├────────────────────────┤
              │ ✅ Order Confirmed     │
              │ 📦 Tracking ID         │
              │ 📅 Est. Delivery Date  │
              │ 💬 WhatsApp Photos     │
              └────────────────────────┘
              ↓
              [Continue Shopping] /
              or
              [View Orders] /profile
              
END
```

---

## Part 7: API Endpoints Summary

### User Authentication
```
POST   /api/auth/user/verify-credentials
POST   /api/auth/user/verify-otp
GET    /api/auth/user/check-login
POST   /api/auth/user/logout
```

### Product Management
```
GET    /api/products              (Get all)
GET    /api/products/:id          (Get single)
GET    /api/products/category/:id (Get by category)
```

### Orders
```
POST   /api/orders/create                      (Create order)
GET    /api/orders/my-orders                   (User's orders)
GET    /api/orders/:id                         (Get order details)
POST   /api/orders/:id/upload-images           (Upload images)

POST   /api/orders/integrate-shiprocket        (Shiprocket integration)
GET    /api/orders/admin/orders                (Admin: list all)
GET    /api/orders/admin/orders/:id            (Admin: get details)
PUT    /api/orders/admin/orders/:id/status     (Admin: update status)
POST   /api/orders/admin/orders/:id/ship       (Admin: trigger shipment)
```

---

## Part 8: Environment Configuration

### Backend (.env)
```
# Shiprocket Credentials
SHIPROCKET_EMAIL=your_email@shiprocket.com
SHIPROCKET_PASSWORD=your_password

# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/infinityshop

# JWT
JWT_SECRET=your_jwt_secret

# Email (for order confirmation)
MAIL_SERVICE=gmail
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SHIPROCKET_TRACKING_BASE=https://shiprocket.in/tracking/
```

---

## Part 9: Testing the Complete Flow

### Step 1: Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Step 2: Test Cart Persistence
```
1. Go to /product/:id
2. Click "Add to Cart"
3. Refresh page → Cart item still there ✓
4. Clear cart → localStorage cleared ✓
```

### Step 3: Test Product Purchase Flow
```
1. Go to /product/:id
2. Select quantity
3. Click "Buy Now"
4. Should redirect to /checkout ✓
5. Cart pre-filled with product ✓
```

### Step 4: Test Checkout Process
```
1. Fill all details
2. Click "Confirm Order"
3. Wait for backend processing
4. See success page with tracking ID ✓
5. Verify Shiprocket order created ✓
```

### Step 5: Verify Admin Dashboard
```
1. Go to /admin/login
2. Login with admin credentials
3. Check AdminDashboard statistics
4. Verify order appears in AdminOrders
5. See Shiprocket tracking ID in order details
```

---

## Part 10: Troubleshooting

### Issue: Cart not persisting
**Solution**: Check localStorage in browser DevTools (F12 → Application → Local Storage)

### Issue: Order creation fails
**Solution**: 
- Check backend server is running on port 5000
- Verify MongoDB is connected
- Check API response in Network tab

### Issue: Shiprocket integration not working
**Solution**:
- Verify `SHIPROCKET_EMAIL` and `SHIPROCKET_PASSWORD` in .env
- Check Shiprocket API response in server logs
- Ensure pickup location ID is correct

### Issue: Tracking ID not displaying
**Solution**:
- Check if shiprocketTrackingId is saved in MongoDB
- Verify Shiprocket service returned tracking info
- Check Checkout.jsx tracking display logic

---

## Part 11: Next Steps & Enhancements

### Immediate
- [ ] Test complete flow with real Shiprocket credentials
- [ ] Configure SMS notifications for order confirmation
- [ ] Add order tracking page for users

### Short Term
- [ ] Integrate payment gateway (Razorpay/PayPal)
- [ ] Add product image file upload
- [ ] Implement discount codes

### Medium Term
- [ ] Email notifications for order status updates
- [ ] Advanced analytics for sales dashboard
- [ ] Inventory management system

### Long Term
- [ ] Mobile app version
- [ ] Customer reviews and ratings
- [ ] Subscription products
- [ ] Affiliate program

---

## Summary

The complete e-commerce flow now integrates:
✅ Product browsing and selection  
✅ Dual purchase options (Add to Cart / Buy Now)  
✅ Cart persistence with localStorage  
✅ Multi-step checkout process  
✅ Order creation in MongoDB  
✅ Automatic Shiprocket integration  
✅ Tracking ID generation  
✅ Success page with delivery info  
✅ Admin dashboard for order management  

**Next Action**: Start the servers and test the complete flow!
