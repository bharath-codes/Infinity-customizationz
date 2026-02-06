const express = require('express');
const router = express.Router();
const PhoneModel = require('../models/phoneModel');
const { authAdmin, authorize } = require('../middleware/auth');

// Get all phone companies and models (public)
router.get('/', async (req, res) => {
  try {
    const phoneModels = await PhoneModel.find().sort({ company: 1 });
    // Convert to object format { "Company": ["model1", "model2"], ... }
    const formatted = {};
    phoneModels.forEach(pm => {
      formatted[pm.company] = pm.models;
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all phone companies with models (admin)
router.get('/admin/all', authAdmin, authorize(['manage_products']), async (req, res) => {
  try {
    const phoneModels = await PhoneModel.find().sort({ company: 1 });
    res.json(phoneModels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new phone company (Admin only)
router.post('/', authAdmin, authorize(['manage_products']), async (req, res) => {
  try {
    const { company, models } = req.body;
    
    if (!company) {
      return res.status(400).json({ message: 'Company name is required' });
    }
    
    // Check if company already exists
    const existing = await PhoneModel.findOne({ company });
    if (existing) {
      return res.status(400).json({ message: 'Company already exists' });
    }

    const phoneModel = new PhoneModel({
      company,
      models: Array.isArray(models) ? models.filter(m => m) : []
    });

    const saved = await phoneModel.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('Phone model POST error:', err);
    return res.status(500).json({ message: err.message || 'Failed to create company' });
  }
});

// Update phone company and models (Admin only)
router.put('/:id', authAdmin, authorize(['manage_products']), async (req, res) => {
  try {
    const { company, models } = req.body;
    
    const phoneModel = await PhoneModel.findById(req.params.id);
    if (!phoneModel) {
      return res.status(404).json({ message: 'Phone company not found' });
    }

    if (company) phoneModel.company = company;
    if (Array.isArray(models)) phoneModel.models = models.filter(m => m);

    const updated = await phoneModel.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete phone company (Admin only)
router.delete('/:id', authAdmin, authorize(['manage_products']), async (req, res) => {
  try {
    const phoneModel = await PhoneModel.findByIdAndDelete(req.params.id);
    if (!phoneModel) {
      return res.status(404).json({ message: 'Phone company not found' });
    }
    res.json({ message: 'Phone company deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a model to existing company (Admin only)
router.post('/:id/models', authAdmin, authorize(['manage_products']), async (req, res) => {
  try {
    const { model } = req.body;
    
    if (!model) {
      return res.status(400).json({ message: 'Model name is required' });
    }

    const phoneModel = await PhoneModel.findById(req.params.id);
    if (!phoneModel) {
      return res.status(404).json({ message: 'Phone company not found' });
    }

    if (!phoneModel.models.includes(model)) {
      phoneModel.models.push(model);
      await phoneModel.save();
    }

    res.json(phoneModel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Remove a model from company (Admin only)
router.delete('/:id/models/:model', authAdmin, authorize(['manage_products']), async (req, res) => {
  try {
    const phoneModel = await PhoneModel.findById(req.params.id);
    if (!phoneModel) {
      return res.status(404).json({ message: 'Phone company not found' });
    }

    phoneModel.models = phoneModel.models.filter(m => m !== req.params.model);
    await phoneModel.save();

    res.json(phoneModel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
