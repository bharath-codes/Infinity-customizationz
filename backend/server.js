const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();

// MIDDLEWARE
// Allowed origins can be configured via environment variable `ALLOWED_ORIGINS`
// as a comma-separated list (e.g. "https://site.com,https://app.vercel.app").
const envAllowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Log origin for debugging CORS issues in production
    console.log('CORS check - origin:', origin);

    // allow requests with no origin (e.g. curl, server-to-server)
    if (!origin) return callback(null, true);

    // Exact matches from environment variable
    try {
      if (envAllowed.includes(origin) || envAllowed.includes(new URL(origin).hostname)) return callback(null, true);

      const hostname = new URL(origin).hostname;
      // Allow any Vercel preview/production domain under vercel.app
      if (hostname.endsWith('.vercel.app') || hostname === 'vercel.app') return callback(null, true);
      // Allow Render services and *.onrender.com
      if (hostname.endsWith('.onrender.com') || hostname === 'onrender.com') return callback(null, true);
      // Permit localhost development origins
      if (hostname === 'localhost' || hostname === '127.0.0.1') return callback(null, true);
      // Allow configured production domains commonly used for this project
      if (hostname === 'infinitycustomizations.com' || hostname === 'www.infinitycustomizations.com') return callback(null, true);
    } catch (e) {
      // If origin is malformed, reject
      console.warn('CORS origin parse error:', e && e.message);
      return callback(new Error('Not allowed by CORS'));
    }

    // Not allowed
    console.warn('Blocked by CORS:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// parse JSON and capture raw body for debugging when JSON parse fails
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  },
  limit: '50mb'
}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// SERVE UPLOADS STATICALLY
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// MODELS
const Product = require('./models/product');
const Category = require('./models/category');
const PhoneModel = require('./models/phoneModel');

// ROUTES
const userAuthRoutes = require('./routes/userAuth');
const adminAuthRoutes = require('./routes/adminAuth');
const orderRoutes = require('./routes/orders');
const phoneModelsRoutes = require('./routes/phoneModels');

// MIDDLEWARE
const { authAdmin, authorize } = require('./middleware/auth');

// --- API ENDPOINTS ---

// Authentication Routes
app.use('/api/auth/user', userAuthRoutes);
app.use('/api/auth/admin', adminAuthRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);

// Phone Models Routes
app.use('/api/phone-models', phoneModelsRoutes);

// Product Routes (Public)
app.get('/api/products', async (req, res) => {
  try {
    const filter = {};
    if (req.query.isBestSeller === 'true') filter.isBestSeller = true;
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/products/category/:categoryId', async (req, res) => {
  try {
    const rawId = (req.params.categoryId || '').trim();
    let products = await Product.find({ categoryId: rawId });
    // If no products, try case-insensitive match (e.g. DB has "Frames" vs "frames")
    if (products.length === 0 && rawId) {
      products = await Product.find({
        categoryId: new RegExp('^' + rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')
      });
    }
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Product reviews - public endpoints
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product.reviews || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const { name, rating, comment } = req.body;
    // Make comment optional; rating is required
    if (rating === undefined || rating === null) return res.status(400).json({ message: 'Rating is required' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const review = { name: name || 'Anonymous', rating: Number(rating), comment: comment || '' };

    product.reviews = product.reviews || [];
    product.reviews.unshift(review); // newest first
    await product.save();
    res.status(201).json({ message: 'Review added', review, reviews: product.reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete review (Admin only)
app.delete('/api/products/:id/reviews/:reviewIndex', authAdmin, authorize(['manage_products']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    const reviewIndex = parseInt(req.params.reviewIndex);
    if (isNaN(reviewIndex) || reviewIndex < 0 || reviewIndex >= (product.reviews || []).length) {
      return res.status(400).json({ message: 'Invalid review index' });
    }

    product.reviews.splice(reviewIndex, 1);
    await product.save();
    res.json({ message: 'Review deleted', reviews: product.reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FILE UPLOAD CONFIGURATION
const storage = multer.memoryStorage(); // Use memory storage for streaming to Cloudinary
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Helper: Detect protocol correctly behind proxies (Render, Railway, etc.)
const getProtocol = (req) => {
  const forwarded = req.get('x-forwarded-proto');
  if (forwarded) return forwarded;
  return req.protocol || (req.secure ? 'https' : 'http');
};

// UPLOAD ENDPOINT (Admin only - for product images, hero images, etc.)
app.post('/api/upload', authAdmin, authorize(['manage_products', 'manage_categories']), upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Check if Cloudinary is configured
    const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                                    process.env.CLOUDINARY_API_KEY && 
                                    process.env.CLOUDINARY_API_SECRET;

    if (isCloudinaryConfigured) {
      // Upload to Cloudinary
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { 
            resource_type: 'auto',
            folder: 'infinity-customizations',
            quality: 'auto',
            fetch_format: 'auto'
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      console.log('☁️ Image uploaded to Cloudinary:', result.secure_url);
      res.json({ 
        filePath: result.secure_url, 
        url: result.secure_url,
        cloudinaryId: result.public_id
      });
    } else {
      // Fallback: Local disk storage (for local development)
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = uniqueSuffix + path.extname(req.file.originalname);
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, req.file.buffer);
      
      const relativePath = `/uploads/${filename}`;
      const host = req.get('host');
      const protocol = getProtocol(req);
      const absoluteUrl = `${protocol}://${host}${relativePath}`;
      
      console.log('📁 Image saved to disk:', absoluteUrl);
      res.json({ filePath: relativePath, url: absoluteUrl });
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Admin Product Management
app.post('/api/products', authAdmin, authorize(['manage_products']), async (req, res) => {
  const productId = req.body._id || ('prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9));
  const product = new Product({
    _id: productId,
    name: req.body.name,
    categoryId: req.body.categoryId,
    price: req.body.price,
    image: req.body.image || '',
    images: req.body.images || [],
    description: req.body.description || '',
    inStock: req.body.inStock !== undefined ? req.body.inStock : true,
    isBestSeller: req.body.isBestSeller || false,
    weight: req.body.weight || '',
    dimensions: req.body.dimensions || '',
    pricing: req.body.pricing,
    colorPriceDiff: req.body.colorPriceDiff,
    pricingType: req.body.pricingType,
    quantityBasedPricing: req.body.quantityBasedPricing,
    instagramLinks: req.body.instagramLinks || []
  });

  try {
    const newProduct = await product.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/products/:id', authAdmin, authorize(['manage_products']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update all fields if they exist in request body (even if falsy)
    if ('name' in req.body) product.name = req.body.name;
    if ('categoryId' in req.body) product.categoryId = req.body.categoryId;
    if ('price' in req.body) product.price = req.body.price;
    if ('image' in req.body) product.image = req.body.image;
    if ('images' in req.body) product.images = req.body.images;
    if ('description' in req.body) product.description = req.body.description;
    if ('inStock' in req.body) product.inStock = req.body.inStock;
    if ('isBestSeller' in req.body) product.isBestSeller = req.body.isBestSeller;
    if ('weight' in req.body) product.weight = req.body.weight;
    if ('dimensions' in req.body) product.dimensions = req.body.dimensions;
    if ('pricing' in req.body) product.pricing = req.body.pricing;
    if ('colorPriceDiff' in req.body) product.colorPriceDiff = req.body.colorPriceDiff;
    if ('pricingType' in req.body) product.pricingType = req.body.pricingType;
    if ('quantityBasedPricing' in req.body) product.quantityBasedPricing = req.body.quantityBasedPricing;
    if ('instagramLinks' in req.body) product.instagramLinks = req.body.instagramLinks || [];

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/products/:id', authAdmin, authorize(['manage_products']), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== CATEGORY MANAGEMENT ==========

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();

    // For each category, load product docs for showcaseProducts (if any)
    const enhanced = await Promise.all(categories.map(async (cat) => {
      const showcaseIds = (cat.showcaseProducts || []).filter(Boolean);
      let showcaseProducts = [];
      if (showcaseIds.length) {
        showcaseProducts = await Product.find({ _id: { $in: showcaseIds } }).select('_id name image price');
      }
      return {
        _id: cat._id,
        title: cat.title,
        desc: cat.desc,
        emoji: cat.emoji,
        showcaseProducts,
        subCategories: cat.subCategories || [],
      };
    }));

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single category with products
app.get('/api/categories/:categoryId', async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Load product documents for both showcaseProducts and products arrays
    const showcaseIds = (category.showcaseProducts || []).filter(Boolean);
    const productIds = (category.products || []).filter(Boolean);

    const [showcaseProducts, productsList] = await Promise.all([
      showcaseIds.length ? Product.find({ _id: { $in: showcaseIds } }).select('_id name image price') : [],
      productIds.length ? Product.find({ _id: { $in: productIds } }).select('_id name image price') : []
    ]);

    res.json({
      _id: category._id,
      title: category.title,
      desc: category.desc,
      emoji: category.emoji,
      showcaseProducts: showcaseProducts || [],
      subCategories: category.subCategories || [],
      showcaseImages: category.showcaseImages || [],
      products: productsList || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create category (Admin)
app.post('/api/categories', authAdmin, authorize(['manage_categories']), async (req, res) => {
  const category = new Category({
    _id: req.body._id || req.body.id,
    title: req.body.title,
    desc: req.body.desc || '',
    emoji: req.body.emoji || '',
    showcaseProducts: req.body.showcaseProducts || [],
    subCategories: req.body.subCategories || []
  });

  try {
    const newCategory = await category.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update category (Admin)
app.put('/api/categories/:categoryId', authAdmin, authorize(['manage_categories']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (req.body.title) category.title = req.body.title;
    if (req.body.desc) category.desc = req.body.desc;
    if (req.body.emoji) category.emoji = req.body.emoji;
    if (req.body.showcaseProducts) category.showcaseProducts = req.body.showcaseProducts;
    if (req.body.subCategories) category.subCategories = req.body.subCategories;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete category (Admin)
app.delete('/api/categories/:categoryId', authAdmin, authorize(['manage_categories']), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add product to category showcase (Admin)
app.post('/api/categories/:categoryId/showcase/:productId', authAdmin, authorize(['manage_categories']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (!category.showcaseProducts.includes(req.params.productId)) {
      const arr = category.showcaseProducts || [];
      if (arr.length >= 2) {
        return res.status(400).json({ message: 'Maximum 2 products can be showcased per category.' });
      }
      arr.push(req.params.productId);
      category.showcaseProducts = arr;
      await category.save();
    }

    res.json({ message: 'Product added to showcase', category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove product from showcase (Admin)
app.delete('/api/categories/:categoryId/showcase/:productId', authAdmin, authorize(['manage_categories']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.showcaseProducts = category.showcaseProducts.filter(id => id !== req.params.productId);
    await category.save();

    res.json({ message: 'Product removed from showcase', category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Add product to category (Admin)
app.post('/api/categories/:categoryId/products/:productId', authAdmin, authorize(['manage_categories']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (!category.products.includes(req.params.productId)) {
      category.products.push(req.params.productId);
      await category.save();
    }

    res.json({ message: 'Product added to category', category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove product from category (Admin)
app.delete('/api/categories/:categoryId/products/:productId', authAdmin, authorize(['manage_categories']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.products = category.products.filter(id => id !== req.params.productId);
    await category.save();

    res.json({ message: 'Product removed from category', category });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Save showcase images for category (Admin) - auto-creates "hero" category if missing
app.put('/api/categories/:categoryId/showcase-images', authAdmin, authorize(['manage_categories']), async (req, res) => {
  try {
    const { images } = req.body; // Array of base64 images [img1, img2, img3]
    
    if (!Array.isArray(images)) {
      return res.status(400).json({ message: 'Images must be an array' });
    }
    
    // Validate image sizes
    const validImages = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (img === null || img === undefined || img === '') {
        validImages.push(null);
        continue;
      }
      
      // Check size (base64 string size limit: 2MB per image to match frontend compression)
      if (typeof img !== 'string' || img.length > 2 * 1024 * 1024) {
        return res.status(400).json({ 
          message: `Image ${i + 1} is too large. Maximum size is 2MB. Please use a smaller image.` 
        });
      }
      
      // Basic validation that it's a data URI
      if (!img.startsWith('data:image/')) {
        return res.status(400).json({ 
          message: `Image ${i + 1} is not a valid image format` 
        });
      }
      
      validImages.push(img);
    }

    // Find or create category (auto-create hero for homepage banners) - use upsert to avoid duplicate key
    const categoryId = req.params.categoryId;
    let category = await Category.findById(categoryId);
    if (!category && categoryId === 'hero') {
      category = await Category.findOneAndUpdate(
        { _id: 'hero' },
        { $setOnInsert: { _id: 'hero', title: 'Hero Banner', desc: 'Homepage hero carousel images', showcaseImages: [null, null, null] } },
        { upsert: true, new: true }
      );
      if (!category.showcaseImages) category.showcaseImages = [null, null, null];
    }
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update showcase images
    category.showcaseImages = validImages.slice(0, 3);
    await category.save();

    res.json({
      message: 'Showcase images updated successfully',
      category: {
        _id: category._id,
        title: category.title,
        desc: category.desc,
        emoji: category.emoji,
        showcaseProducts: category.showcaseProducts || [],
        subCategories: category.subCategories || [],
        showcaseImages: category.showcaseImages || []
      },
      savedCount: validImages.filter(img => img).length,
      totalImages: validImages.length
    });
  } catch (err) {
    console.error('Error updating showcase images:', err);
    if (err.name === 'MongoServerError' && err.code === 13049) {
      // Document too large error
      return res.status(413).json({ 
        message: 'Images are too large in total. Please use smaller/compressed images.' 
      });
    }
    res.status(400).json({ message: err.message });
  }
});

// Get showcase images for category (Public) - auto-creates "hero" category if missing
app.get('/api/categories/:categoryId/showcase-images', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    let category = await Category.findById(categoryId);
    // Auto-create hero category for homepage banner images (upsert to avoid duplicate key)
    if (!category && categoryId === 'hero') {
      category = await Category.findOneAndUpdate(
        { _id: 'hero' },
        { $setOnInsert: { _id: 'hero', title: 'Hero Banner', desc: 'Homepage hero carousel images', showcaseImages: [null, null, null] } },
        { upsert: true, new: true }
      );
      if (category && !category.showcaseImages) category.showcaseImages = [null, null, null];
    }
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      categoryId: category._id,
      categoryTitle: category.title,
      images: category.showcaseImages || []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Serve frontend build if present (allows single-repo deployment)
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  // Return index.html for non-API routes (SPA support)
  app.get(/^(?!\/api)/, (req, res, next) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (req && req.rawBody) {
    console.error('Raw request body:', req.rawBody);
  }
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
