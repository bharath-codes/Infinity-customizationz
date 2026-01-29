# E-Commerce Flow Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         INFINITY SHOP                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  FRONTEND (React 19)                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  ┌────────────────┐        ┌─────────────────┐          │  │
│  │  │  ProductPage   │───────│ CartContext      │          │  │
│  │  │                │       │ (localStorage)   │          │  │
│  │  └─────┬──────────┘       └─────────────────┘          │  │
│  │        │                                                │  │
│  │   ┌────▼─────────────────────────────────────────┐     │  │
│  │   │  Buy Now   │  Add to Cart                     │     │  │
│  │   └────┬───────────────┬──────────────────────────┘     │  │
│  │        │               │                               │  │
│  │   navigate to       Continue shopping               │  │
│  │   /checkout         │                               │  │
│  │   │                 ▼                               │  │
│  │   │            ┌──────────┐                        │  │
│  │   │            │ /cart    │                        │  │
│  │   │            │ page     │                        │  │
│  │   │            └─────┬────┘                        │  │
│  │   │                  │                              │  │
│  │   └──────────────────┼──────────────────────────┐   │  │
│  │                      │                          │   │  │
│  │                      ▼                          ▼   │  │
│  │           ┌──────────────────────────────────────┐  │  │
│  │           │      Checkout Page                   │  │  │
│  │           │   (3-Step Multi-Form)               │  │  │
│  │           │                                      │  │  │
│  │           │  Step 1: Delivery Details           │  │  │
│  │           │  ├─ Name, Email, Phone              │  │  │
│  │           │  ├─ Address, City, State, Pincode   │  │  │
│  │           │  └─ Payment Method                  │  │  │
│  │           │                                      │  │  │
│  │           │  Step 2: Order Processing           │  │  │
│  │           │  ├─ Loading spinner                 │  │  │
│  │           │  └─ Backend integration             │  │  │
│  │           │                                      │  │  │
│  │           │  Step 3: Success Page               │  │  │
│  │           │  ├─ Order Confirmed ✓               │  │  │
│  │           │  ├─ Tracking ID                     │  │  │
│  │           │  ├─ Est. Delivery Date              │  │  │
│  │           │  └─ WhatsApp Photos Button          │  │  │
│  │           └───────────┬──────────────────────────┘  │  │
│  │                       │                              │  │
│  └───────────────────────┼──────────────────────────────┘  │
│                          │                                 │
│                          │ API Calls                       │
│                          ▼                                 │
│                          
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API SERVICE (api.js)                         │  │
│  │  ├─ POST /api/orders/create                              │  │
│  │  └─ POST /api/orders/integrate-shiprocket                │  │
│  └──────────┬───────────────────────────────────────────────┘  │
│             │                                                   │
└─────────────┼───────────────────────────────────────────────────┘
              │
              ▼
              
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────┐                        │
│  │    Order Routes (orders.js)         │                        │
│  │                                     │                        │
│  │  POST /orders/create                │                        │
│  │  ├─ Validate user & items           │                        │
│  │  ├─ Create Order in MongoDB         │                        │
│  │  └─ Return order ID                 │                        │
│  │                                     │                        │
│  │  POST /orders/integrate-shiprocket  │                        │
│  │  ├─ Verify order ownership          │                        │
│  │  ├─ Call shiprocketService          │                        │
│  │  ├─ Update order with tracking ID   │                        │
│  │  └─ Return tracking info            │                        │
│  └────────────────────────────────────┘                        │
│                    │                                            │
│                    ▼                                            │
│  ┌────────────────────────────────────┐                        │
│  │  Shiprocket Service (shiprocketS...) │                       │
│  │                                     │                        │
│  │  authenticateShiprocket()           │                        │
│  │  ├─ Email credentials               │                        │
│  │  ├─ Cache token (12 hours)          │                        │
│  │  └─ Return access token             │                        │
│  │                                     │                        │
│  │  createShiprocketOrder()            │                        │
│  │  ├─ Map order data                  │                        │
│  │  ├─ POST to Shiprocket API          │                        │
│  │  ├─ Extract tracking ID             │                        │
│  │  └─ Return shipment details         │                        │
│  └────────────────────────────────────┘                        │
│                    │                                            │
└────────────────────┼────────────────────────────────────────────┘
                     │
                     ▼
                     
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB (Database)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Order Collection                                               │
│  ├─ _id (ObjectId)                                              │
│  ├─ userId                                                      │
│  ├─ customerName, email, phoneNumber                            │
│  ├─ address, city, state, pincode                               │
│  ├─ items (array)                                               │
│  ├─ pricing (subtotal, shipping, tax, total)                    │
│  ├─ status (pending → confirmed → shipped → delivered)          │
│  ├─ shiprocketOrderId ⭐                                        │
│  ├─ shiprocketTrackingId ⭐                                     │
│  ├─ paymentMethod, paymentStatus                                │
│  └─ createdAt, updatedAt                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                     │
                     ▼
                     
┌─────────────────────────────────────────────────────────────────┐
│            SHIPROCKET (3rd Party API)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Endpoint: https://apiv2.shiprocket.in/v1/external/...          │
│                                                                 │
│  Receives:                                                      │
│  ├─ Authentication token                                        │
│  ├─ Order details (customer, address, items)                    │
│  ├─ Pickup location ID                                          │
│  └─ Packaging info (dimensions, weight)                         │
│                                                                 │
│  Returns:                                                       │
│  ├─ Order ID                                                    │
│  ├─ Shipment ID                                                 │
│  ├─ AWB (Tracking Number) ⭐                                    │
│  ├─ Carrier info                                                │
│  └─ Estimated delivery date                                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                     │
                     ▼
                     
        ┌────────────────────────────┐
        │  Tracking Info Sent Back   │
        │  ├─ Tracking ID            │
        │  ├─ Carrier                │
        │  ├─ Est. Delivery Date     │
        │  └─ Tracking URL           │
        └────────────────────────────┘
                     │
                     ▼
                     
        ┌────────────────────────────┐
        │  Display on Success Page   │
        │  + Admin Dashboard         │
        │  + Admin Order Details     │
        └────────────────────────────┘
```

## Data Flow Sequence Diagram

```
┌─────────┐          ┌──────────┐          ┌───────┐          ┌──────────┐
│  User   │          │ Frontend │          │Backend│          │Shiprocket│
└────┬────┘          └────┬─────┘          └───┬───┘          └────┬─────┘
     │                    │                     │                   │
     │ Click Buy Now      │                     │                   │
     ├───────────────────>│                     │                   │
     │                    │                     │                   │
     │  Navigate to /checkout                  │                   │
     │                    │                     │                   │
     │ Fill form & submit │                     │                   │
     ├───────────────────>│                     │                   │
     │                    │                     │                   │
     │               POST /orders/create        │                   │
     │                    ├────────────────────>│                   │
     │                    │                     │                   │
     │                    │               Create Order in MongoDB   │
     │                    │                     │                   │
     │                    │                     │                   │
     │               POST /integrate-shiprocket│                   │
     │                    ├────────────────────>│                   │
     │                    │                     │                   │
     │                    │              Call shiprocketService     │
     │                    │                     ├─────────────────>│
     │                    │                     │                   │
     │                    │              Authenticate & Create      │
     │                    │              Shipment                   │
     │                    │                     │<─────────────────┤
     │                    │                     │   Return AWB    │
     │                    │                     │   & Tracking ID  │
     │                    │                     │                   │
     │                    │           Update Order with Tracking    │
     │                    │                     │                   │
     │<──────────────────return response────────┤                   │
     │ Success Page with                        │                   │
     │ Tracking ID ✓                            │                   │
     │                                          │                   │
     │ Copy Tracking ID & Share                 │                   │
     │ Send Photos via WhatsApp                 │                   │
     │                                          │                   │
```

## Component Hierarchy

```
App
├── CartProvider
│   ├── AuthProvider
│   │   ├── Router
│   │   │   ├── Navbar
│   │   │   ├── Routes
│   │   │   │   ├── / (Home)
│   │   │   │   ├── /login (Login)
│   │   │   │   ├── /shop/:id (CategoryPage)
│   │   │   │   ├── /product/:id (ProductPage) ──> CartContext
│   │   │   │   │   ├─ "Buy Now" button
│   │   │   │   │   └─ "Add to Cart" button
│   │   │   │   │
│   │   │   │   ├── /cart (Cart) ──> CartContext
│   │   │   │   │   └─ "Proceed to Checkout"
│   │   │   │   │
│   │   │   │   ├── /checkout (Checkout) ──> CartContext, AuthContext, API
│   │   │   │   │   ├─ Step 1: Details Form
│   │   │   │   │   ├─ Step 2: Processing
│   │   │   │   │   └─ Step 3: Success + Tracking
│   │   │   │   │
│   │   │   │   ├── /admin/dashboard (AdminDashboard) ──> API
│   │   │   │   │   └─ Display statistics + orders with tracking
│   │   │   │   │
│   │   │   │   └── /admin/orders (AdminOrders) ──> API
│   │   │   │       └─ List orders with Shiprocket tracking IDs
│   │   │   │
│   │   │   └── Footer
│   │   │       └── Contact, Social, Information
│   │   │
│   │   └── ScrollToTop
│   │
│   └── Contexts
│       ├── AuthContext (User/Admin authentication)
│       └── CartContext (Cart state + localStorage)
```

## State Management Flow

```
CartContext
├── cart: [
│   {
│       id, name, price, quantity,
│       image, finalPrice
│   }
│]
│
├─ Methods:
│  ├─ addToCart(product)
│  ├─ updateQuantity(id, qty)
│  ├─ removeFromCart(id)
│  ├─ clearCart()
│  ├─ getTotalPrice()
│  └─ getTotalItems()
│
└─ localStorage:
   └─ Key: 'cart'
      └─ Syncs on every state change

AuthContext
├── user: { name, email, phoneNumber, ... }
├── token: "jwt_token_here"
├── isAuthenticated: boolean
├── isAdmin: boolean
└── adminToken: "admin_jwt_token"

API Service
├── userAuth
│   ├─ verifyCredentials()
│   └─ verifyOTP()
│
├── orders
│   ├─ create(orderData, token)
│   ├─ getMyOrders(token)
│   ├─ getById(id, token)
│   ├─ uploadImages(orderId, images, token)
│   │
│   ├─ getAll(filters, token) [Admin]
│   ├─ updateStatus(id, data, token) [Admin]
│   └─ triggerShipment(id, token) [Admin]
│
└── AdminAuth
    ├─ login()
    └─ logout()
```

## Order Status Flow

```
Pending
   ↓
   (Order created in MongoDB)
   ↓
Confirmed
   ↓
   (Shiprocket integration triggered)
   (Shipment created on Shiprocket)
   (Tracking ID generated)
   ↓
Processing
   ↓
   (Admin prepares order)
   ↓
Shipped
   ↓
   (Package with carrier)
   (Tracking URL active)
   ↓
Delivered
   ↓
   (Order complete)

Alternative: Cancelled
   ↓
   (At any stage if needed)
```

## Key Integration Points

```
ProductPage ────┐
                │
                ├─> CartContext ──> localStorage
                │       │
                │       └─> useCart() ──────┐
                │                           │
Cart Page ──────┴─────────────────────────>─┤
                                            │
Checkout Page ──────────────────────────────┴──> API.orders.create()
                ├──> useAuth() ──────────────────────> /api/orders/create
                │                               │
                │                               ├─> MongoDB (Order Collection)
                │                               │
                └──> Form Data ─────────────────┤
                                               │
                                               └─> /api/orders/integrate-shiprocket
                                                   │
                                                   ├─> shiprocketService
                                                   │   │
                                                   │   ├─> POST /v1/external/orders/create/adhoc
                                                   │   │
                                                   │   └─> Shiprocket API Response
                                                   │
                                                   ├─> Update Order (shiprocketTrackingId)
                                                   │
                                                   └─> Return Success + Tracking

Success Page ────> Display Tracking Info
AdminDashboard ──> Show Shiprocket Tracking ID in orders
AdminOrders ────> Display Shiprocket data per order
```

This architecture provides:
✅ Seamless user experience (Buy Now / Add to Cart)
✅ Persistent cart data
✅ Secure order processing
✅ Automatic shipment creation
✅ Real-time tracking integration
✅ Admin oversight and management
