/**
 * Rutas de SEO
 * Sirve sitemap.xml, robots.txt y metadata
 */

const express = require('express');
const router = express.Router();
const seoService = require('../services/seoService');

// ==========================================
// SITEMAP.XML
// ==========================================
router.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await seoService.generateSitemap();
    
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=86400'); // Cache 24 horas
    res.send(sitemap);
  } catch (error) {
    console.error('❌ Error sirviendo sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// ==========================================
// ROBOTS.TXT
// ==========================================
router.get('/robots.txt', (req, res) => {
  try {
    const robotsTxt = seoService.generateRobotsTxt();
    
    res.header('Content-Type', 'text/plain');
    res.header('Cache-Control', 'public, max-age=86400'); // Cache 24 horas
    res.send(robotsTxt);
  } catch (error) {
    console.error('❌ Error sirviendo robots.txt:', error);
    res.status(500).send('Error generating robots.txt');
  }
});

// ==========================================
// META TAGS PARA PRODUCTO
// ==========================================
router.get('/meta/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const meta = await seoService.getProductMeta(productId);
    
    if (!meta) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      meta
    });
  } catch (error) {
    console.error('❌ Error obteniendo meta de producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener metadata',
      error: error.message
    });
  }
});

// ==========================================
// META TAGS PARA CATEGORÍA
// ==========================================
router.get('/meta/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const meta = seoService.getCategoryMeta(decodeURIComponent(category));
    
    res.status(200).json({
      success: true,
      meta
    });
  } catch (error) {
    console.error('❌ Error obteniendo meta de categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener metadata',
      error: error.message
    });
  }
});

// ==========================================
// META TAGS POR DEFECTO
// ==========================================
router.get('/meta/:page?', (req, res) => {
  try {
    const page = req.params.page || 'home';
    const meta = seoService.getDefaultMeta(page);
    
    res.status(200).json({
      success: true,
      meta
    });
  } catch (error) {
    console.error('❌ Error obteniendo meta por defecto:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener metadata',
      error: error.message
    });
  }
});

// ==========================================
// SCHEMAS
// ==========================================
router.post('/schema/breadcrumb', (req, res) => {
  try {
    const { breadcrumbs } = req.body;
    const schema = seoService.generateBreadcrumbSchema(breadcrumbs);
    
    res.status(200).json({
      success: true,
      schema
    });
  } catch (error) {
    console.error('❌ Error generando breadcrumb schema:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar schema',
      error: error.message
    });
  }
});

router.get('/schema/organization', (req, res) => {
  try {
    const schema = seoService.generateOrganizationSchema();
    
    res.status(200).json({
      success: true,
      schema
    });
  } catch (error) {
    console.error('❌ Error generando organization schema:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar schema',
      error: error.message
    });
  }
});

router.get('/schema/website', (req, res) => {
  try {
    const schema = seoService.generateWebsiteSchema();
    
    res.status(200).json({
      success: true,
      schema
    });
  } catch (error) {
    console.error('❌ Error generando website schema:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar schema',
      error: error.message
    });
  }
});

module.exports = router;
