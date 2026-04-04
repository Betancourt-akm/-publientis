const Category    = require('../models/Category');
const productModel = require('../models/productModel');


exports.getCategories = async (req, res) => {
  try {
    const cats = await Category.find().sort('label');
    return res.status(200).json({
      message: 'Categorías obtenidas exitosamente',
      data:    cats,
      success: true,
      error:   false
    });
  } catch (err) {
    console.error('Error en getCategories:', err);
    return res.status(500).json({
      message: err.message || 'Error interno al obtener categorías',
      success: false,
      error:   true
    });
  }
};
exports.createCategory = async (req, res) => {
  try {
    const { label, value } = req.body;
    if (!label || !value) {
      return res.status(400).json({
        message: 'Faltan datos: label y value son requeridos',
        success: false,
        error:   true
      });
    }

    const existing = await Category.findOne({ value });
    if (existing) {
      return res.status(409).json({
        message: 'Categoría ya existe',
        success: false,
        error:   true
      });
    }

    const newCat = await Category.create({ label, value });
    return res.status(201).json({
      message: 'Categoría creada exitosamente',
      data:    newCat,
      success: true,
      error:   false
    });
  } catch (err) {
    console.error('Error en createCategory:', err);
    return res.status(500).json({
      message: err.message || 'Error interno al crear categoría',
      success: false,
      error:   true
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cat = await Category.findById(id);
    if (!cat) {
      return res.status(404).json({
        message: 'Categoría no encontrada',
        success: false,
        error:   true
      });
    }

    const count = await productModel.countDocuments({ category: id });
    if (count > 0) {
      return res.status(400).json({
        message: `Hay ${count} producto(s) usando esta categoría. Primero reasignalos o elimínalos.`,
        success: false,
        error:   true
      });
    }

    await Category.findByIdAndDelete(id);
    return res.status(200).json({
      message: 'Categoría eliminada con éxito',
      success: true,
      error:   false
    });
  } catch (err) {
    console.error('Error en deleteCategory:', err);
    return res.status(500).json({
      message: err.message || 'Error interno al eliminar categoría',
      success: false,
      error:   true
    });
  }
};
