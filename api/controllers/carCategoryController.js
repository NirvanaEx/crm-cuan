// controllers/carCategoryController.js
const service = require('../services/carCategoryService');

exports.list = async (req, res, next) => {
  try {
    const categories = await service.listCategories();
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const category = await service.getCategoryById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Field name is required' });
    }
    const created = await service.createCategory({ name });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { name, data_status } = req.body;
    await service.updateCategory(req.params.id, { name, data_status });
    res.json({ message: 'Category updated' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await service.deleteCategory(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    next(err);
  }
};
