# Frontend Integration Guide - Complete Authentication & API Setup

## 🎯 What's Been Built

### ✅ **Authentication System**
- **Login Page** (`/login`) - Phone number + OTP authentication
- **User Profile** (`/profile`) - View and edit user details
- **Auth Context** - Global state management for authentication
- **API Service** - Centralized API client for all backend calls

### ✅ **Features Integrated**
1. **Navbar Updates**
   - Login/Logout buttons
   - User profile dropdown when authenticated
   - Mobile menu with auth options

2. **Protected Routes**
   - Profile page requires authentication
   - Redirects to login if not authenticated

3. **Local Storage**
   - Stores JWT token
   - Stores user data
   - Persists login across page refreshes

---

## 🚀 Running the App

### Start Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Start Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5174 (or similar)
```

---

## 📱 Testing Login Flow

### Step 1: Navigate to Login
Click "Login" button in navbar or go to `/login`

### Step 2: Request OTP
1. Enter phone number: `9876543210` (any 10-digit number starting with 6-9)
2. Click "Send OTP"
3. Check browser console or terminal output for OTP (e.g., `123456`)

### Step 3: Verify OTP
1. Enter the 6-digit OTP
2. Click "Verify OTP & Login"
3. Success! You're logged in

### Step 4: Verify in Profile
1. Click on your user dropdown in navbar
2. Click "My Profile"
3. See your login information
4. Edit profile details

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          (Login/Signup page)
│   │   └── UserProfile.jsx    (User profile page)
│   ├── contexts/
│   │   └── AuthContext.jsx    (Authentication state management)
│   ├── services/
│   │   └── api.js             (API client)
│   ├── App.jsx                (Updated with routes & auth)
│   └── data.js                (Product data)
```

---

## 🔑 Key Files Explained

### 1. **services/api.js** - API Client
Central hub for all API calls to backend. Contains:
- `userAuth.requestOTP()` - Request OTP
- `userAuth.verifyOTP()` - Verify OTP & login
- `userAuth.getProfile()` - Fetch user profile
- `userAuth.updateProfile()` - Update profile
- `products.getAll()` - Fetch products
- `products.getByCategory()` - Filter by category
- `orders.create()` - Create new order
- And more...

### 2. **contexts/AuthContext.jsx** - State Management
Provides authentication state and functions:
- `user` - Current user data
- `token` - JWT token
- `isAuthenticated` - Login status
- `login()` - Login function
- `logout()` - Logout function
- `requestOTP()` - Request OTP
- `updateProfile()` - Update profile

Use with `const { user, token, login, logout } = useAuth();`

### 3. **pages/Login.jsx** - Login Page
Professional login page with:
- Phone number validation
- OTP request & verification
- Error/success messages
- Resend OTP timer
- Security messaging

### 4. **pages/UserProfile.jsx** - Profile Page
User profile management with:
- View user info
- Edit profile
- Change name, email, address
- Logout button
- Quick action links

---

## 🔌 API Integration Examples

### Request OTP
```javascript
import { useAuth } from '../contexts/AuthContext';

const { requestOTP } = useAuth();

const response = await requestOTP('9876543210');
// Returns: { success: true, message: "OTP sent successfully" }
```

### Login with OTP
```javascript
const { login } = useAuth();

const response = await login('9876543210', '123456');
// Returns: { success: true, user: { id, phoneNumber, name, ... } }
```

### Update Profile
```javascript
const { updateProfile } = useAuth();

const response = await updateProfile({
  name: 'John Doe',
  email: 'john@example.com',
  address: '123 Main St',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001'
});
```

### Fetch Products
```javascript
import { products as productsAPI } from '../services/api';

const allProducts = await productsAPI.getAll();
const frameProducts = await productsAPI.getByCategory('frames');
const singleProduct = await productsAPI.getById(productId);
```

### Create Order
```javascript
import { orders as ordersAPI } from '../services/api';

const order = await ordersAPI.create({
  items: [
    { productId: '...', quantity: 2 }
  ],
  phoneNumber: '9876543210',
  customerName: 'John Doe',
  email: 'john@example.com',
  address: '123 Main St',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001',
  paymentMethod: 'cod'
}, token);
```

---

## 🎨 UI Components

### Navbar Features
- **Desktop**: Login button, user dropdown when authenticated
- **Mobile**: Hamburger menu with login/profile options
- **WhatsApp**: Direct link to WhatsApp
- **Cart**: Shopping cart icon with item count

### Login Page Features
- Step 1: Phone number input
- Step 2: OTP verification
- Resend OTP timer
- Error/success messages
- Mobile responsive

### Profile Page Features
- User information display
- Edit profile form
- Logout button
- Quick action cards
- Account information

---

## 🔐 Authentication Flow

```
1. User enters phone number
   ↓
2. OTP sent to backend (logged in console)
   ↓
3. User enters OTP
   ↓
4. Verified with backend
   ↓
5. JWT token returned
   ↓
6. Token + User stored in localStorage
   ↓
7. AuthContext updated
   ↓
8. User logged in across app
```

---

## 📊 State Management

### AuthContext Provides
```javascript
{
  user: { id, phoneNumber, name, email, address, ... },
  token: 'jwt_token_here',
  loading: false,
  isAuthenticated: true,
  login: async (phoneNumber, otp) => { ... },
  logout: () => { ... },
  requestOTP: async (phoneNumber) => { ... },
  updateProfile: async (data) => { ... }
}
```

### Accessing Auth Context
```javascript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <p>Please login</p>;
  
  return <div>Welcome, {user.name}!</div>;
}
```

---

## 🛒 Shopping Cart Integration (Ready to Implement)

The cart functionality is already in place:
- Add to cart
- Update quantity
- Remove items
- Checkout (needs integration with order creation)

### Complete Checkout Flow
```javascript
// In Cart component
const handleCheckout = async () => {
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }

  const order = await orders.create({
    items: cartItems,
    customerName: user.name,
    phoneNumber: user.phoneNumber,
    email: user.email,
    address: user.address,
    city: user.city,
    state: user.state,
    pincode: user.pincode,
    paymentMethod: 'cod'
  }, token);

  // Order created successfully
};
```

---

## 🚨 Debugging

### Check Login Status
```javascript
const { isAuthenticated, user, token } = useAuth();
console.log(isAuthenticated, user, token);
```

### Check LocalStorage
```javascript
console.log(localStorage.getItem('userToken'));
console.log(localStorage.getItem('user'));
```

### API Errors
All API errors follow this format:
```javascript
{
  status: 400,
  message: "Error description",
  data: { /* full error object */ }
}
```

### Network Issues
Make sure backend is running on `http://localhost:5000`
- Check CORS settings in backend
- Check API_BASE_URL in `services/api.js`

---

## 📝 Test Users

After seeding database, any phone number starting with 6-9 can login:
- `9876543210` ✓
- `8765432109` ✓
- `7654321098` ✓

OTP is logged in console, use any 6 digits for testing (currently in-memory).

---

## ✅ Checklist for Full Integration

- [x] API service layer created
- [x] Auth context & state management
- [x] Login page with OTP
- [x] User profile page
- [x] Navbar auth integration
- [x] Protected routes
- [x] LocalStorage persistence
- [ ] Cart checkout with order creation
- [ ] Orders page to view user orders
- [ ] Admin dashboard
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Real SMS OTP (Twilio)

---

## 🎯 Next Steps

1. **Test the login flow** - Use the app and verify authentication works
2. **Integrate cart checkout** - Update Cart component to create orders
3. **Create orders page** - Show user's order history
4. **Admin dashboard** - Build admin panel for order management
5. **Payment integration** - Add Razorpay/PayU
6. **Real OTP** - Switch to Twilio for SMS
7. **Notifications** - Add email/WhatsApp notifications

---

## 🤝 Support

For issues:
1. Check browser console for errors
2. Check backend terminal output
3. Verify APIs are correctly formatted
4. Check localStorage for token persistence
5. Ensure backend is running on port 5000

Happy coding! 🚀
