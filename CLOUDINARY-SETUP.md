# Cloudinary Image Hosting Setup

Your app now supports **persistent image uploads** using Cloudinary. This solves the problem of images disappearing after server restarts (common on Render, Vercel, Heroku).

## Quick Setup (2 minutes)

### Step 1: Create a Free Cloudinary Account
1. Go to https://cloudinary.com
2. Click "Sign Up For Free"
3. Complete the registration

### Step 2: Get Your Credentials
1. Log in to Cloudinary Dashboard
2. Go to **Settings > API Keys** (or click the gear icon)
3. Copy these three values:
   - **Cloud Name** (format: something like `abc123`)
   - **API Key** (long number)
   - **API Secret** (long alphanumeric string)

### Step 3: Add to Your `.env`
Open `backend/.env` and update:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Replace `your-cloud-name`, `your-api-key`, and `your-api-secret` with the actual values from Step 2.

### Step 4: Restart Backend
```bash
npm --prefix backend run dev
# or
npm --prefix backend start
```

## How It Works

- When an admin uploads a product/hero image, the file is sent to Cloudinary
- Cloudinary returns a permanent HTTPS URL (e.g., `https://res.cloudinary.com/...`)
- Images are **stored securely and persist forever** (not on ephemeral server disk)
- Images are served via **global CDN** → faster load times
- You get **1GB free storage + 10M transformations /month** (plenty for most shops)

## What If I Don't Add Cloudinary?

- The app falls back to saving images to `backend/uploads/` locally
- **Works fine locally** for testing
- **DOES NOT WORK in production** on Render/Vercel (images disappear on restarts)
- Add Cloudinary when you deploy! Takes 2 minutes.

## Testing Locally

1. Add Cloudinary credentials to `backend/.env` (or skip this; local disk works)
2. Start backend: `npm --prefix backend run dev`
3. Go to Admin > Products
4. Upload an image → should see a preview
5. Refresh the page → image should still load (if Cloudinary), or stay visible in localStorage preview (if local disk)

## Troubleshooting

**"Upload failed" error?**
- Check `.env` has correct Cloudinary credentials
- Ensure `CLOUDINARY_CLOUD_NAME` is not wrapped in quotes
- Restart the backend after changing `.env`

**Images still disappearing on deployed site?**
- Verify Cloudinary creds are in your deployment environment (Render/Vercel settings)
- Check Cloudinary dashboard to see if uploads appear there

**Free tier limitations?**
- 1GB storage, 10M transformations/month is very generous
- Paid plans start at $80/month for serious use
- For this shop, free tier is more than enough

## More Info

- Cloudinary Docs: https://cloudinary.com/documentation
- API Reference: https://cloudinary.com/documentation/image_upload_api_reference
