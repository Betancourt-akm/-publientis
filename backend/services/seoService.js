/**
 * Servicio de SEO
 * Genera sitemap XML, robots.txt, y metadata para SEO
 */

const Product = require('../models/productModel');

/**
 * GENERAR SITEMAP XML
 */
const generateSitemap = async () => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://freshface.com';
    const currentDate = new Date().toISOString();

    // Obtener todos los productos activos
    const products = await Product.find({ stock: { $gt: 0 } })
      .select('_id name updatedAt')
      .lean();

    // Páginas estáticas
    const staticPages = [
      { url: '', changefreq: 'daily', priority: '1.0' },
      { url: '/productos', changefreq: 'daily', priority: '0.9' },
      { url: '/ofertas', changefreq: 'daily', priority: '0.8' },
      { url: '/nosotros', changefreq: 'monthly', priority: '0.5' },
      { url: '/contacto', changefreq: 'monthly', priority: '0.5' },
      { url: '/terminos', changefreq: 'yearly', priority: '0.3' },
      { url: '/privacidad', changefreq: 'yearly', priority: '0.3' }
    ];

    // Construir XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Agregar páginas estáticas
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Agregar productos
    products.forEach(product => {
      const productUrl = `${baseUrl}/producto/${product._id}`;
      const lastmod = product.updatedAt ? product.updatedAt.toISOString() : currentDate;
      
      xml += '  <url>\n';
      xml += `    <loc>${productUrl}</loc>\n`;
      xml += `    <lastmod>${lastmod}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Agregar categorías únicas
    const categories = await Product.distinct('category');
    categories.forEach(category => {
      const categoryUrl = `${baseUrl}/productos?category=${encodeURIComponent(category)}`;
      
      xml += '  <url>\n';
      xml += `    <loc>${categoryUrl}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += '    <changefreq>daily</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    return xml;
  } catch (error) {
    console.error('❌ Error generando sitemap:', error);
    throw error;
  }
};

/**
 * GENERAR ROBOTS.TXT
 */
const generateRobotsTxt = () => {
  const baseUrl = process.env.FRONTEND_URL || 'https://freshface.com';
  
  let robotsTxt = `# FreshFace E-commerce - Robots.txt
# Generated: ${new Date().toISOString()}

# Allow all crawlers
User-agent: *
Allow: /
Allow: /productos
Allow: /producto/*
Allow: /ofertas

# Disallow admin and private pages
Disallow: /admin
Disallow: /admin/*
Disallow: /dashboard
Disallow: /dashboard/*
Disallow: /cart
Disallow: /checkout
Disallow: /mi-cuenta
Disallow: /mi-cuenta/*
Disallow: /api/*

# Disallow search result pages (to avoid duplicate content)
Disallow: /*?*

# Crawl-delay
Crawl-delay: 1

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml
`;

  return robotsTxt;
};

/**
 * GENERAR META TAGS PARA PRODUCTO
 */
const getProductMeta = async (productId) => {
  try {
    const product = await Product.findById(productId)
      .populate('reviewCount')
      .lean();

    if (!product) {
      return null;
    }

    const baseUrl = process.env.FRONTEND_URL || 'https://freshface.com';
    const productUrl = `${baseUrl}/producto/${product._id}`;
    const imageUrl = product.images && product.images[0] 
      ? product.images[0] 
      : `${baseUrl}/default-product.jpg`;

    // Generar descripción SEO
    const description = product.description 
      ? product.description.substring(0, 160) + '...'
      : `Compra ${product.name} al mejor precio. ${product.category} de calidad en FreshFace.`;

    // Calcular precio con descuento si existe
    const price = product.price;
    const availability = product.stock > 0 ? 'InStock' : 'OutOfStock';

    return {
      // Basic Meta Tags
      title: `${product.name} | FreshFace`,
      description,
      keywords: `${product.name}, ${product.category}, ${product.brand || ''}, comprar online`,
      canonicalUrl: productUrl,

      // Open Graph Tags
      ogTitle: product.name,
      ogDescription: description,
      ogImage: imageUrl,
      ogUrl: productUrl,
      ogType: 'product',
      ogSiteName: 'FreshFace',

      // Twitter Card Tags
      twitterCard: 'summary_large_image',
      twitterTitle: product.name,
      twitterDescription: description,
      twitterImage: imageUrl,

      // Product Specific
      productPrice: price,
      productCurrency: 'COP',
      productAvailability: availability,
      productBrand: product.brand,
      productCategory: product.category,

      // Schema.org JSON-LD
      schemaProduct: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images || [],
        description: product.description || description,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'FreshFace'
        },
        offers: {
          '@type': 'Offer',
          url: productUrl,
          priceCurrency: 'COP',
          price: price,
          availability: `https://schema.org/${availability}`,
          seller: {
            '@type': 'Organization',
            name: 'FreshFace'
          }
        },
        aggregateRating: product.rating && product.reviewCount > 0 ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating,
          reviewCount: product.reviewCount,
          bestRating: 5,
          worstRating: 1
        } : undefined
      }
    };
  } catch (error) {
    console.error('❌ Error generando meta tags de producto:', error);
    throw error;
  }
};

/**
 * GENERAR META TAGS PARA CATEGORÍA
 */
const getCategoryMeta = (category) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://freshface.com';
  const categoryUrl = `${baseUrl}/productos?category=${encodeURIComponent(category)}`;

  return {
    title: `${category} | FreshFace`,
    description: `Encuentra los mejores productos de ${category} al mejor precio. Envío gratis y pago seguro.`,
    keywords: `${category}, comprar ${category}, ${category} online`,
    canonicalUrl: categoryUrl,
    ogTitle: `${category} - FreshFace`,
    ogDescription: `Descubre nuestra colección de ${category}`,
    ogUrl: categoryUrl,
    ogType: 'website',
    twitterCard: 'summary',
  };
};

/**
 * GENERAR META TAGS POR DEFECTO
 */
const getDefaultMeta = (page = 'home') => {
  const baseUrl = process.env.FRONTEND_URL || 'https://freshface.com';

  const metaData = {
    home: {
      title: 'FreshFace | Tu tienda de belleza y cuidado personal online',
      description: 'Descubre los mejores productos de belleza y cuidado personal. Envío gratis, pago seguro y las mejores marcas al mejor precio.',
      keywords: 'belleza, cuidado personal, skincare, maquillaje, cosméticos, comprar online'
    },
    productos: {
      title: 'Productos | FreshFace',
      description: 'Explora nuestro catálogo completo de productos de belleza y cuidado personal.',
      keywords: 'productos, catálogo, belleza, cuidado personal'
    },
    ofertas: {
      title: 'Ofertas y Descuentos | FreshFace',
      description: '¡Aprovecha nuestras mejores ofertas! Descuentos increíbles en productos de belleza.',
      keywords: 'ofertas, descuentos, promociones, rebajas'
    }
  };

  const meta = metaData[page] || metaData.home;

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    canonicalUrl: baseUrl,
    ogTitle: meta.title,
    ogDescription: meta.description,
    ogUrl: baseUrl,
    ogType: 'website',
    ogSiteName: 'FreshFace',
    twitterCard: 'summary_large_image',
  };
};

/**
 * GENERAR BREADCRUMB SCHEMA
 */
const generateBreadcrumbSchema = (breadcrumbs) => {
  const baseUrl = process.env.FRONTEND_URL || 'https://freshface.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`
    }))
  };
};

/**
 * GENERAR ORGANIZATION SCHEMA
 */
const generateOrganizationSchema = () => {
  const baseUrl = process.env.FRONTEND_URL || 'https://freshface.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'FreshFace',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Tu tienda online de belleza y cuidado personal',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+57-XXX-XXX-XXXX',
      contactType: 'Customer Service',
      availableLanguage: ['Spanish']
    },
    sameAs: [
      'https://www.facebook.com/freshface',
      'https://www.instagram.com/freshface',
      'https://www.twitter.com/freshface'
    ]
  };
};

/**
 * GENERAR WEBSITE SCHEMA
 */
const generateWebsiteSchema = () => {
  const baseUrl = process.env.FRONTEND_URL || 'https://freshface.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'FreshFace',
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/productos?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
};

module.exports = {
  generateSitemap,
  generateRobotsTxt,
  getProductMeta,
  getCategoryMeta,
  getDefaultMeta,
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateWebsiteSchema
};
