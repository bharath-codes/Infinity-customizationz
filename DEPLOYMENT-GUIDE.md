# 🚀 DEPLOYMENT GUIDE - Render & Vercel

## Deployment Overview

- **Backend**: Render (https://infinity-customizations.onrender.com)
- **Frontend**: Vercel (https://infinitycustomizationss.vercel.app)
- **Database**: MongoDB Atlas (Cloud)
- **Images**: Cloudinary (Cloud)

---

## ✅ Current Configuration

### Frontend (.env)
```
VITE_API_BASE_URL=https://infinity-customizations.onrender.com/api
VITE_API_URL=https://infinity-customizations.onrender.com
```

### Backend CORS
```javascript
allowedOrigins: [
  'https://infinitycustomizationss.vercel.app',  // Vercel frontend
  'http://localhost:5173',                       // Local development
  'https://infinitycustomizations.com',          // Custom domain
  'https://www.infinitycustomizations.com'       // Custom domain with www
]
```

---

## 📋 DEPLOYMENT STEPS

### Step 1: Backend Deployment (Render)

#### Create/Update Render Service

1. Go to https://render.com
2. Connect your GitHub repository
3. Create a **New Web Service**:
   - **Name**: `infinity-customizations`
   - **Repository**: `bharath-codes/Infinity-customizationz`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### Configure Environment Variables on Render

Go to **Settings** → **Environment** and add:

```
MONGO_URI=mongodb+srv://infinity:Infinity%402026@infinity-shop.zxofexu.mongodb.net/infinitly?retryWrites=true&w=majority

PORT=3000

JWT_SECRET=your-super-secret-user-jwt-key-change-this-in-production

JWT_ADMIN_SECRET=your-super-secret-admin-jwt-key-change-this-in-production

CLOUDINARY_CLOUD_NAME=dzdxjhjui

CLOUDINARY_API_KEY=679824368953146

CLOUDINARY_API_SECRET=GNXIQ7zyqqjFsIlMWqrEyO9iil8
```

#### Deploy

- Click **Deploy**
- Wait for deployment to complete (3-5 minutes)
- Your backend will be live at: `https://infinity-customizations.onrender.com`

---

### Step 2: Frontend Deployment (Vercel)

#### Create/Update Vercel Project

1. Go to https://vercel.com
2. Connect your GitHub repository
3. Create a **New Project**:
   - **Project Name**: `infinity-shop`
   - **Repository**: `bharath-codes/Infinity-customizationz`

#### Configure Build Settings

- **Framework**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Configure Environment Variables on Vercel

Add in **Settings** → **Environment Variables**:

```
VITE_API_BASE_URL=https://infinity-customizations.onrender.com/api
VITE_API_URL=https://infinity-customizations.onrender.com
```

**Important**: Make sure these are set for:
- ✅ Production
- ✅ Preview
- ✅ Development

#### Deploy

- Click **Deploy**
- Wait for build to complete (2-3 minutes)
- Your frontend will be live at: `https://infinitycustomizationss.vercel.app`

---

## ✅ Verify Deployment

### Test Backend
```bash
curl https://infinity-customizations.onrender.com/api/products
```
Should return your products list.

### Test Frontend
1. Visit: https://infinitycustomizationss.vercel.app
2. Verify categories load (no 404 errors)
3. Try admin login with:
   - Email: `infinitycustomizations@gmail.com`
   - Password: `infinity@2026`

### Test Image Upload
1. Log in as admin
2. Go to **Admin Products**
3. Add/Edit a product
4. Upload an image
5. Image should be stored in Cloudinary ☁️

---

## 🔑 Important Credentials

### MongoDB Atlas
- **URL**: mongodb+srv://infinity:...@infinity-shop.zxofexu.mongodb.net/infinitly
- **Database**: `infinitly`
- **User**: `infinity`

### Cloudinary
- **Cloud Name**: `dzdxjhjui`
- **API Key**: `679824368953146`
- **Images stored at**: `https://res.cloudinary.com/dzdxjhjui/...`

### Admin Account
- **Email**: infinitycustomizations@gmail.com
- **Password**: infinity@2026

---

## 🛠️ Troubleshooting

### Frontend Shows 404 Errors
**Problem**: Categories not loading  
**Solution**: 
1. Verify `VITE_API_BASE_URL` is set correctly on Vercel
2. Check Render backend is running: https://infinity-customizations.onrender.com/api/categories
3. Redeploy frontend after updating env vars

### Images Not Uploading
**Problem**: Upload fails or images don't persist  
**Solution**:
1. Verify Cloudinary credentials in Render env vars
2. Check Cloudinary account still has free tier access
3. In Cloudinary Dashboard, verify folder `infinity-customizations` exists

### Login Fails
**Problem**: Admin can't log in from deployed site  
**Solution**:
1. Verify jwt secret is same on backend
2. Check MongoDB connection is working
3. Run seed script on Render if needed

### "Failed to fetch" Error
**Problem**: Frontend can't reach backend  
**Solution**:
1. Check CORS origin in backend matches Vercel URL
2. Verify Render backend URL is correct
3. Check no firewall blocking requests

---

## 📝 Seed Database on Render

To seed the production database:

1. Open **Render Dashboard**
2. Click your service
3. Go to **Shell**
4. Run:
   ```bash
   npm run seed
   ```

---

## 🔄 How to Update Production

### Update Backend
```bash
git add backend/
git commit -m "Backend update: description"
git push origin main
# Render auto-deploys from main branch
```

### Update Frontend
```bash
git add frontend/
git commit -m "Frontend update: description"
git push origin main
# Vercel auto-deploys from main branch
```

---

## 📊 Deployment Checklist

- [x] Frontend configured for Vercel
- [x] Backend configured for Render
- [x] Env variables set on both platforms
- [x] Cloudinary credentials configured
- [x] MongoDB connection working
- [x] CORS settings updated
- [x] Image upload using Cloudinary
- [x] Admin account created
- [x] Code pushed to GitHub
- [ ] Domain connected (optional)

---

## 🌐 Optional: Custom Domain

### Add Custom Domain on Vercel
1. Go to **Settings** → **Domains**
2. Add `infinitycustomizations.com`
3. Add DNS records to your registrar

### Add Custom Domain on Render
1. Go to **Settings** → **Custom Domains**
2. Add your domain
3. Update DNS records

Update `allowedOrigins` in backend to include custom domain:
```javascript
allowedOrigins: [
  'https://infinitycustomizations.com',
  'https://www.infinitycustomizations.com',
  'https://infinitycustomizationss.vercel.app'
]
```

---

## 📞 Support URLs

- **Backend API**: https://infinity-customizations.onrender.com
- **Frontend**: https://infinitycustomizationss.vercel.app
- **Admin Login**: https://infinitycustomizationss.vercel.app/admin/login

---

**Last Updated**: February 8, 2026  
**Status**: ✅ Production Ready
