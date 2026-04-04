/**
 * Rutas de Búsqueda Avanzada
 */

const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');

// Búsqueda avanzada con filtros
router.get('/', async (req, res) => {
  try {
    const filters = {
      search: req.query.q || req.query.search || '',
      category: req.query.category || '',
      minPrice: parseFloat(req.query.minPrice) || 0,
      maxPrice: parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER,
      brand: req.query.brand || '',
      minRating: parseFloat(req.query.minRating) || 0,
      inStock: req.query.inStock,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const results = await searchService.advancedSearch(filters);
    res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error en búsqueda:', error);
    res.status(500).json({
      success: false,
      message: 'Error al realizar la búsqueda',
      error: error.message
    });
  }
});

// Autocompletado
router.get('/autocomplete', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    const suggestions = await searchService.searchAutocomplete(q, parseInt(limit));
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('❌ Error en autocompletado:', error);
    res.status(500).json({
      success: false,
      message: 'Error en autocompletado',
      error: error.message
    });
  }
});

// Obtener opciones de filtros disponibles
router.get('/filters', async (req, res) => {
  try {
    const filterOptions = await searchService.getFilterOptions();
    res.status(200).json(filterOptions);
  } catch (error) {
    console.error('❌ Error obteniendo filtros:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener opciones de filtros',
      error: error.message
    });
  }
});

// Búsqueda por categoría
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const filters = {
      minPrice: parseFloat(req.query.minPrice) || 0,
      maxPrice: parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER,
      brand: req.query.brand || '',
      minRating: parseFloat(req.query.minRating) || 0,
      sortBy: req.query.sortBy || 'createdAt',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const results = await searchService.searchByCategory(category, filters);
    res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error en búsqueda por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar por categoría',
      error: error.message
    });
  }
});

// Búsqueda por marca
router.get('/brand/:brand', async (req, res) => {
  try {
    const { brand } = req.params;
    const filters = {
      minPrice: parseFloat(req.query.minPrice) || 0,
      maxPrice: parseFloat(req.query.maxPrice) || Number.MAX_SAFE_INTEGER,
      minRating: parseFloat(req.query.minRating) || 0,
      sortBy: req.query.sortBy || 'createdAt',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };

    const results = await searchService.searchByBrand(brand, filters);
    res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error en búsqueda por marca:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar por marca',
      error: error.message
    });
  }
});

// Productos similares
router.get('/similar/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    const results = await searchService.getSimilarProducts(productId, parseInt(limit));
    res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error obteniendo productos similares:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos similares',
      error: error.message
    });
  }
});

// Productos populares
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const results = await searchService.getPopularProducts(parseInt(limit));
    res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error obteniendo productos populares:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos populares',
      error: error.message
    });
  }
});

// Productos nuevos
router.get('/new', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const results = await searchService.getNewProducts(parseInt(limit));
    res.status(200).json(results);
  } catch (error) {
    console.error('❌ Error obteniendo productos nuevos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener productos nuevos',
      error: error.message
    });
  }
});

module.exports = router;
