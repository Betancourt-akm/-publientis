// routes/categoryRoutes.js

const router = require('express').Router();
const {
  getCategories,
  createCategory,
  deleteCategory
} = require('../controller/categoryController');
router.get('/', getCategories);
router.post('/', createCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
