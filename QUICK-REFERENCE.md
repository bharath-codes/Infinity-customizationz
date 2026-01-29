# Quick Reference: E-Commerce Flow

## 🛍️ User Journey

```
Product Page (/product/:id)
├─ "Buy Now" → Checkout (immediate)
└─ "Add to Cart" → Cart (/cart) → Checkout (/checkout)

Checkout Flow
├─ Step 1: Delivery Details Form
├─ Step 2: Order Processing
│  ├─ Create order in MongoDB
│  └─ Integrate with Shiprocket
└─ Step 3: Success with Tracking Info
   └─ Can share on WhatsApp
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| [App.jsx](frontend/src/App.jsx) | Routes + ProductPage + Cart components |
| [Checkout.jsx](frontend/src/pages/Checkout.jsx) | Multi-step checkout form |
| [CartContext.jsx](frontend/src/contexts/CartContext.jsx) | Cart state + localStorage |
| [shiprocketService.js](backend/services/shiprocketService.js) | Shiprocket API wrapper |
| [orders.js](backend/routes/orders.js) | Order routes (/create, /integrate-shiprocket) |
| [order.js](backend/models/order.js) | MongoDB order schema |

## 🔌 API Endpoints

```
POST /api/orders/create              (Create order)
POST /api/orders/integrate-shiprocket (Integrate Shiprocket)
GET  /api/orders/admin/orders         (Admin: list)
```

## 🎯 Component Interactions

```
ProductPage (addToCart, navigate)
    ↓
CartContext (addToCart, cart state, localStorage)
    ↓
Checkout (useCart, useAuth, api.orders)
    ↓
Backend Orders Route (/create)
    ↓
Shiprocket Service (createShiprocketOrder)
    ↓
Shiprocket API (create shipment, get tracking)
    ↓
Success Page (display tracking)
```

## 💾 Data Flow

```
User Input (Cart) → localStorage
    ↓
Cart Page → Checkout (retrieve from context)
    ↓
Order Form (add delivery details)
    ↓
Submit → POST /orders/create
    ↓
Backend: Create Order + Call Shiprocket
    ↓
Response: shiprocketTrackingId + trackingUrl
    ↓
Success Page: Display tracking info
    ↓
AdminDashboard: Show order with Shiprocket ID
```

## 🚀 Getting Started

1. **Start Servers**
   ```bash
   cd backend && npm start          # Terminal 1
   cd frontend && npm run dev       # Terminal 2
   ```

2. **Test Purchase Flow**
   - Go to `/product/1`
   - Click "Buy Now"
   - Fill checkout form
   - See success with tracking ID

3. **Verify Admin**
   - Go to `/admin/login`
   - Check AdminOrders for new order
   - See Shiprocket tracking ID

## ✅ Implementation Checklist

- [x] ProductPage with "Buy Now" + "Add to Cart"
- [x] CartContext with localStorage persistence
- [x] Checkout page (3-step flow)
- [x] Order creation endpoint
- [x] Shiprocket integration endpoint
- [x] Success page with tracking
- [x] AdminDashboard integration
- [x] AdminOrders with tracking ID display

## 🔧 Debugging Tips

**Check Cart Persistence**
```javascript
// In browser console
localStorage.getItem('cart')
```

**Check Order Creation**
- Monitor Network tab → POST /api/orders/create
- Check Response for errors

**Check Shiprocket Integration**
- Server logs: Look for shiprocket responses
- Order model: Verify shiprocketTrackingId is saved

**Check Checkout State**
- React DevTools: Inspect CartContext state
- Look for step value: 'details' → 'processing' → 'success'

## 📞 Support

For issues:
1. Check terminal logs (backend errors)
2. Check browser console (frontend errors)
3. Check Network tab (API failures)
4. Review E-COMMERCE-FLOW-GUIDE.md for detailed flow
