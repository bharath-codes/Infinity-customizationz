const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb' }));

// SERVE UPLOADS STATICALLY
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// MODELS
const Product = require('./models/product');
const Category = require('./models/category');

// ROUTES
const userAuthRoutes = require('./routes/userAuth');
const adminAuthRoutes = require('./routes/adminAuth');
const orderRoutes = require('./routes/orders');

// --- API ENDPOINTS ---

// Authentication Routes
app.use('/api/auth/user', userAuthRoutes);
app.use('/api/auth/admin', adminAuthRoutes);

// Order Routes
app.use('/api/orders', orderRoutes);

// Product Routes (Public)
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/products/category/:categoryId', async (req, res) => {
  try {
    const products = await Product.find({ categoryId: req.params.categoryId });
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

// FILE UPLOAD CONFIGURATION
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/';
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// UPLOAD ENDPOINT
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // Return the full URL or relative path. For this setup, we'll return the relative path 
  // which the frontend can prefix with the backend URL, OR return a full URL if host is known.
  // Returning relative path is safer for portability.
  // Note: The frontend proxy points /api to localhost:5000, but /uploads is not under /api.
  // So frontend needs to know how to access /uploads.
  // We can return the full URL if we knew the host.
  // Let's return the relative path like '/uploads/filename.jpg'.
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ filePath });
});

// Admin Product Management
const { authAdmin, authorize } = require('./middleware/auth');

app.post('/api/products', authAdmin, authorize(['manage_products']), async (req, res) => {
  const product = new Product({
    name: req.body.name,
    categoryId: req.body.categoryId,
    price: req.body.price,
    image: req.body.image || '',
    images: req.body.images || [],
    description: req.body.description || '',
    inStock: req.body.inStock !== undefined ? req.body.inStock : true
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

    if (req.body.name) product.name = req.body.name;
    if (req.body.categoryId) product.categoryId = req.body.categoryId;
    if (req.body.price) product.price = req.body.price;
    if (req.body.image) product.image = req.body.image;
    if (req.body.images) product.images = req.body.images;
    if (req.body.description) product.description = req.body.description;
    if (req.body.inStock !== undefined) product.inStock = req.body.inStock;

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
    const categories = await Category.find().populate('showcaseProducts');
    res.json(categories);
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
    
    // Return category with its showcase products array
    res.json({
      _id: category._id,
      title: category.title,
      desc: category.desc,
      emoji: category.emoji,
      showcaseProducts: category.showcaseProducts || [],
      subCategories: category.subCategories || [],
      showcaseImages: category.showcaseImages || []
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
      category.showcaseProducts.push(req.params.productId);
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

// Save showcase images for category (Admin)
app.put('/api/categories/:categoryId/showcase-images', authAdmin, authorize(['manage_categories']), async (req, res) => {
  try {
    const { images } = req.body; // Array of 3 base64 images [img1, img2, img3]
    
    const category = await Category.findById(req.params.categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update showcase images (filter out null values)
    category.showcaseImages = images.map(img => img || null);
    await category.save();

    res.json({ 
      message: 'Showcase images updated successfully', 
      category,
      savedImages: category.showcaseImages.filter(img => img).length
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get showcase images for category (Public)
app.get('/api/categories/:categoryId/showcase-images', async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));