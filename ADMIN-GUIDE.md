# 🎯 ADMIN QUICK GUIDE - Categories & Products

## 📍 Admin Panel Navigation

### Main Dashboard
**URL**: `/admin/dashboard`

Access from here:
- 📦 Orders → `/admin/orders`
- 📚 Categories → `/admin/categories` (NEW!)
- 🏷️ Products → `/admin/products`
- 👥 Users → `/admin/users`

---

## 📚 Managing Categories

### Access Categories Page
1. Go to `/admin/dashboard`
2. Click "Categories" button in menu
3. Or navigate directly to `/admin/categories`

### Add New Category
1. Click **+ Add Category** button
2. Fill in:
   - **Category ID** (e.g., `frames`, `magazines`)
   - **Emoji** (e.g., `📸`, `📖`)
   - **Title** (e.g., `Photo Frames`)
   - **Description** (for SEO & customers)
   - **Sub-categories** (one per line)
3. Click **Add Category**

### Edit Category
1. Click **Edit (✏️)** button on any category card
2. Modify any field
3. Click **Update Category**

### Delete Category
1. Click **Delete (🗑️)** button
2. Confirm deletion

---

## 🏷️ Managing Products

### Access Products Page
1. Go to `/admin/dashboard`
2. Click "Products" button
3. Or navigate to `/admin/products`

### Add Product
1. Click **+ Add Product**
2. Fill in fields:
   - **Product Name**
   - **Price**
   - **Select Category** (10 options with emojis):
     - 📸 Photo Frames
     - 📖 Magazines
     - 🎞️ Polaroids & Photo Books
     - 🌹 Flowers & Bouquets
     - 🎁 Hampers & Gift Combos
     - 👕 T-Shirts & Accessories
     - 📱 Phone Cases & Cups
     - ✨ Vintage Collection
     - 📅 Calendars & Magnets
     - 🤖 Smart & Digital Services
3. Upload product image
4. Click **Add Product**

### Edit Product
1. Find product in list
2. Click **Edit (✏️)**
3. Modify details
4. Click **Update Product**

### Delete Product
1. Click **Delete (🗑️)**
2. Confirm

---

## 🖼️ Image Slideshow Setup

### Each Product Can Have 3 Images
When displaying products on homepage:
- Image 1 shows for 0-2 seconds
- Image 2 shows for 2-4 seconds  
- Image 3 shows for 4-6 seconds
- Then loops back to Image 1

### Perfect for Showcasing:
✅ **Lifestyle shot** (room setup)
✅ **Close-up** (print quality/details)
✅ **Custom preview** (personalized example)

---

## 🎨 Category Organization

### How Categories Are Used:

**Frontend Display:**
- Home page shows 2 featured products per category
- Each product has 3 rotating images
- Images change every 2 seconds
- Smooth sliding animation

**Category Pages:**
- `/shop/frames` → All Photo Frames products
- `/shop/magazines` → All Magazines
- `/shop/flowers` → All Flowers & Bouquets
- etc.

---

## 💡 Tips & Best Practices

### ✅ DO:
- Use consistent naming conventions
- Add clear descriptions for SEO
- Include lifestyle + detail shots in images
- Update inventory regularly
- Use emojis for quick visual identification

### ❌ DON'T:
- Don't delete frequently purchased categories
- Don't leave descriptions blank
- Don't upload very large images (>5MB)
- Don't change category IDs after creation
- Don't add duplicate sub-categories

---

## 📊 Current Categories

| # | Icon | Category | Sub-Categories Count | URL |
|---|------|----------|----------------------|-----|
| 1 | 📸 | Photo Frames | 5 | `/shop/frames` |
| 2 | 📖 | Magazines | 4 | `/shop/magazines` |
| 3 | 🎞️ | Polaroids & Books | 4 | `/shop/memories` |
| 4 | 🌹 | Flowers & Bouquets | 4 | `/shop/flowers` |
| 5 | 🎁 | Hampers & Combos | 4 | `/shop/hampers` |
| 6 | 👕 | T-Shirts & Accessories | 4 | `/shop/apparel` |
| 7 | 📱 | Phone Cases & Cups | 4 | `/shop/essentials` |
| 8 | ✨ | Vintage Collection | 4 | `/shop/vintage` |
| 9 | 📅 | Calendars & Magnets | 4 | `/shop/addons` |
| 10 | 🤖 | Smart & Digital | 5 | `/shop/smart-digital` |

---

## 🔧 Troubleshooting

### Category not showing on homepage?
- Check that category ID matches exactly
- Verify at least 1 product assigned to category
- Hard refresh browser (Ctrl+F5)

### Images not rotating?
- Check all 3 images are uploaded
- Ensure image paths are correct
- Check browser console for errors

### Admin menu not showing Categories?
- Log out and log back in
- Clear browser cache
- Check you're logged in as admin

---

## 📞 Support Commands

### View All Products (Browser Console)
```javascript
const res = await fetch('/api/products');
const products = await res.json();
console.log(products);
```

### Check Category Structure
```javascript
import { categoryDetails } from './data.js';
console.log(categoryDetails);
```

---

**Last Updated**: January 24, 2026  
**Admin Access**: `/admin/login`  
**Default Credentials**: See README for setup  
**Support**: admin@infinitlyediting.com
