# Admin Products Management - Quick Test Guide

## System Running Status ✅

- **Backend Server**: Running on `http://localhost:5000`
- **Frontend Server**: Running on `http://localhost:5173`
- **MongoDB**: Connected and seeded with demo data
- **API Configuration**: Updated to use localhost for development

## Admin Login Credentials

**Email**: `infinitycustomizations@gmail.com`  
**Password**: `infinity@2026`

## Admin Features Available

### 1. **View All Products** ✅
- Dashboard shows all products from the database
- Products include: Frames, T-shirts, Phone Covers, Mugs, etc.
- Displays product name, price, category, stock status

### 2. **Add New Products** ✅
- Click "Add Product" button in Products Management page
- Form includes:
  - Product Name (required)
  - Category (dropdown with all categories)
  - Price (required)
  - Description
  - Images (primary image + multiple additional images)
  - Stock Status (In Stock / Out of Stock)
  - Best Seller flag
  - Weight & Dimensions
  - Pricing Type (Standard or Quantity-based)
  - Quantity-based pricing rules

### 3. **Edit Products** ✅
- Click "Edit" button on any product
- Modify any field:
  - **Price**: Update product price
  - **Description**: Change product description
  - **Images**: Update product images
  - **Category**: Change product category
  - **Stock Status**: Mark in/out of stock
  - **Weight & Dimensions**: Update product specifications
  - **Pricing Rules**: Configure quantity-based pricing

### 4. **Delete Products** ✅
- Click "Delete" button to remove products
- Confirmation dialog prevents accidental deletion

### 5. **Image Uploads** ✅
- Upload product images directly (local disk storage)
- Images are stored in `backend/uploads/` directory
- Multiple images per product supported
- Image preview shown before saving

### 6. **Category Management** ✅
- Filter products by category
- Add products for specific categories
- Quick navigation from Categories page to Products page

### 7. **Product Reviews Management** ✅
- View customer reviews for each product
- Delete inappropriate reviews
- Star ratings displayed with comments

## Test Workflow

### Step 1: Login to Admin Dashboard
```
1. Open http://localhost:5173
2. Navigate to Admin Login
3. Enter:
   - Email: infinitycustomizations@gmail.com
   - Password: infinity@2026
4. Click Login
```

### Step 2: View All Products
```
1. Go to Product Management from Admin Dashboard
2. See all ~50+ products loaded in the list
3. Products should display:
   - Product image thumbnail
   - Name
   - Price
   - Category
   - Stock status
   - Action buttons (Edit, Delete, Reviews)
```

### Step 3: Add a New Product
```
1. Click "Add Product" button
2. Fill in form:
   - Name: "Test T-shirt"
   - Category: "T-shirts"
   - Price: 299
   - Description: "Test product for verification"
3. Upload an image or use existing
4. Click Save
5. Product should appear in the list
```

### Step 4: Edit a Product
```
1. Click Edit button on any product
2. Change price or description
3. Example: Change price from 199 to 249
4. Click Update
5. Product should update in real-time
```

### Step 5: Delete a Test Product
```
1. Click Delete button
2. Confirm deletion
3. Product should be removed from list
```

## Backend API Endpoints (Admin Only)

All endpoints require `Authorization: Bearer <admin-token>` header

### Products Management
- `POST /api/products` - Create new product
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Image Uploads
- `POST /api/upload` - Upload image file (multipart/form-data)
- Returns: `{ filePath: "/uploads/filename", url: "http://..." }`

### Reviews Management
- `GET /api/products/:id/reviews` - Get product reviews
- `POST /api/products/:id/reviews` - Add review (public)
- `DELETE /api/products/:id/reviews/:index` - Delete review (admin only)

## Image Storage

Images are stored locally in:
- **Local Development**: `backend/uploads/` directory
- **Local Access**: `http://localhost:5000/uploads/filename`
- **Production**: Use Cloudinary (already configured in .env)

## Common Operations

### Change Product Price
1. Click Edit on product
2. Update "Price" field
3. Click Update button
4. Price is immediately updated in database

### Update Product Description
1. Click Edit on product
2. Update "Description" field
3. Click Update button
4. Description is immediately updated

### Change Product Stock Status
1. Click Edit on product
2. Toggle "In Stock" checkbox
3. Click Update button
4. Stock status is updated

### Upload/Change Product Image
1. Click Edit on product
2. Click "Upload Image" in the form
3. Select image file from computer
4. Image preview shows immediately
5. Click Update to save
6. Image is uploaded and stored

## Troubleshooting

### Backend Not Running
```
cd backend
node server.js
# Should see: 🚀 Server running on port 5000
#            ✅ MongoDB Connected
```

### Frontend Not Running
```
cd frontend
npm run dev
# Should see: Local: http://localhost:5173/
```

### Database Issues
```
# Reseed database with fresh data
cd backend
node seed.js
# Should see: ✅ Products imported!
#            ✅ Admin created!
```

### Image Upload Fails
1. Check backend is running
2. Verify `backend/uploads/` directory exists
3. Check file size < 10MB
4. Try different image format (JPG, PNG)

## Next Steps

1. ✅ **Test Admin Login** - Access admin dashboard
2. ✅ **Test Add Product** - Create a new test product
3. ✅ **Test Edit Product** - Modify price/description
4. ✅ **Test Delete Product** - Remove test product
5. ✅ **Test Image Upload** - Upload product images
6. 📝 **Review Database** - Verify data in MongoDB
7. 🚀 **Prepare for Deployment** - Configure for production

## Notes

- Admin can manage all product fields including prices and descriptions
- Image uploads work locally and with Cloudinary
- MongoDB connection is secure with credentials in .env
- JWT authentication ensures only admins can modify products
- All changes are immediately reflected in the product list
