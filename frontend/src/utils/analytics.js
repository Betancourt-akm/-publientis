/**
 * Sistema de Analytics y Tracking
 * Integración con Google Analytics 4, Hotjar y Microsoft Clarity
 */

// ==========================================
// GOOGLE ANALYTICS 4
// ==========================================

/**
 * Inicializar Google Analytics 4
 * Llamar en App.js o index.js
 */
export const initGA4 = (measurementId) => {
  if (!measurementId) {
    console.warn('⚠️ GA4 Measurement ID no proporcionado');
    return;
  }

  // Cargar script de GA4
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  // Inicializar dataLayer y gtag
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', measurementId, {
    send_page_view: false // Manejaremos page views manualmente
  });

  console.log('✅ Google Analytics 4 inicializado');
};

/**
 * Track Page View
 */
export const trackPageView = (path, title) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title
    });
  }
};

/**
 * Track Custom Event
 */
export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, parameters);
  }
};

// ==========================================
// E-COMMERCE EVENTS (GA4 Enhanced Ecommerce)
// ==========================================

/**
 * View Item List (Vista de Listado de Productos)
 */
export const trackViewItemList = (items, listName = 'Search Results') => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item_list', {
      item_list_name: listName,
      items: items.map((item, index) => ({
        item_id: item._id || item.id,
        item_name: item.name,
        item_category: item.category,
        item_brand: item.brand,
        price: item.price,
        index: index
      }))
    });
  }
};

/**
 * View Item (Ver Detalle de Producto)
 */
export const trackViewItem = (product) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_item', {
      currency: 'COP',
      value: product.price,
      items: [{
        item_id: product._id || product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: product.price
      }]
    });
  }
};

/**
 * Add to Cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_to_cart', {
      currency: 'COP',
      value: product.price * quantity,
      items: [{
        item_id: product._id || product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: product.price,
        quantity: quantity
      }]
    });
  }
};

/**
 * Remove from Cart
 */
export const trackRemoveFromCart = (product, quantity = 1) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'remove_from_cart', {
      currency: 'COP',
      value: product.price * quantity,
      items: [{
        item_id: product._id || product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: product.price,
        quantity: quantity
      }]
    });
  }
};

/**
 * View Cart
 */
export const trackViewCart = (cartItems, totalValue) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'view_cart', {
      currency: 'COP',
      value: totalValue,
      items: cartItems.map(item => ({
        item_id: item.productId._id || item.productId.id,
        item_name: item.productId.name,
        item_category: item.productId.category,
        item_brand: item.productId.brand,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }
};

/**
 * Begin Checkout
 */
export const trackBeginCheckout = (cartItems, totalValue) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'begin_checkout', {
      currency: 'COP',
      value: totalValue,
      items: cartItems.map(item => ({
        item_id: item.productId._id || item.productId.id,
        item_name: item.productId.name,
        item_category: item.productId.category,
        item_brand: item.productId.brand,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }
};

/**
 * Add Payment Info
 */
export const trackAddPaymentInfo = (paymentType, totalValue) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'add_payment_info', {
      currency: 'COP',
      value: totalValue,
      payment_type: paymentType
    });
  }
};

/**
 * Purchase (Conversión Final)
 */
export const trackPurchase = (order) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'purchase', {
      transaction_id: order._id || order.id,
      currency: 'COP',
      value: order.totalAmount,
      shipping: order.shippingCost || 0,
      items: order.items.map(item => ({
        item_id: item.productId._id || item.productId,
        item_name: item.name,
        item_category: item.category,
        item_brand: item.brand,
        price: item.price,
        quantity: item.quantity
      }))
    });
  }
};

/**
 * Search
 */
export const trackSearch = (searchTerm, resultsCount = null) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'search', {
      search_term: searchTerm,
      ...(resultsCount !== null && { results_count: resultsCount })
    });
  }
};

/**
 * Select Item (Click en Producto)
 */
export const trackSelectItem = (product, listName = 'Search Results', index = 0) => {
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'select_item', {
      item_list_name: listName,
      items: [{
        item_id: product._id || product.id,
        item_name: product.name,
        item_category: product.category,
        item_brand: product.brand,
        price: product.price,
        index: index
      }]
    });
  }
};

// ==========================================
// HOTJAR
// ==========================================

/**
 * Inicializar Hotjar
 */
export const initHotjar = (hjid, hjsv = 6) => {
  if (!hjid) {
    console.warn('⚠️ Hotjar ID no proporcionado');
    return;
  }

  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid,hjsv};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

  console.log('✅ Hotjar inicializado');
};

/**
 * Trigger Hotjar Event
 */
export const triggerHotjarEvent = (eventName) => {
  if (window.hj) {
    window.hj('event', eventName);
  }
};

/**
 * Identify User in Hotjar
 */
export const identifyHotjarUser = (userId, attributes = {}) => {
  if (window.hj) {
    window.hj('identify', userId, attributes);
  }
};

// ==========================================
// MICROSOFT CLARITY
// ==========================================

/**
 * Inicializar Microsoft Clarity
 */
export const initClarity = (projectId) => {
  if (!projectId) {
    console.warn('⚠️ Microsoft Clarity Project ID no proporcionado');
    return;
  }

  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", projectId);

  console.log('✅ Microsoft Clarity inicializado');
};

/**
 * Set Custom Tag in Clarity
 */
export const setClarityTag = (tagName, tagValue) => {
  if (window.clarity) {
    window.clarity('set', tagName, tagValue);
  }
};

/**
 * Identify User in Clarity
 */
export const identifyClarityUser = (userId, sessionId = null, pageId = null) => {
  if (window.clarity) {
    window.clarity('identify', userId, sessionId, pageId);
  }
};

// ==========================================
// UNIFIED TRACKING
// ==========================================

/**
 * Inicializar todos los servicios de analytics
 */
export const initAllAnalytics = (config = {}) => {
  const {
    ga4MeasurementId,
    hotjarId,
    clarityProjectId
  } = config;

  if (ga4MeasurementId) {
    initGA4(ga4MeasurementId);
  }

  if (hotjarId) {
    initHotjar(hotjarId);
  }

  if (clarityProjectId) {
    initClarity(clarityProjectId);
  }

  console.log('✅ Todos los servicios de analytics inicializados');
};

/**
 * Identify User en todos los servicios
 */
export const identifyUser = (user) => {
  if (!user) return;

  const userId = user._id || user.id;
  const userAttributes = {
    email: user.email,
    name: user.name,
    role: user.role
  };

  // Google Analytics
  if (typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', {
      user_id: userId,
      user_role: user.role
    });
  }

  // Hotjar
  identifyHotjarUser(userId, userAttributes);

  // Microsoft Clarity
  identifyClarityUser(userId);

  console.log('✅ Usuario identificado en analytics:', userId);
};

/**
 * Track conversion goal
 */
export const trackConversionGoal = (goalName, value = 0) => {
  trackEvent('conversion', {
    goal_name: goalName,
    value: value
  });
  
  triggerHotjarEvent(`conversion_${goalName}`);
  
  setClarityTag('conversion', goalName);
};

export default {
  // Initialization
  initGA4,
  initHotjar,
  initClarity,
  initAllAnalytics,
  
  // Page tracking
  trackPageView,
  trackEvent,
  
  // E-commerce
  trackViewItemList,
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewCart,
  trackBeginCheckout,
  trackAddPaymentInfo,
  trackPurchase,
  trackSearch,
  trackSelectItem,
  
  // User identification
  identifyUser,
  
  // Hotjar specific
  triggerHotjarEvent,
  identifyHotjarUser,
  
  // Clarity specific
  setClarityTag,
  identifyClarityUser,
  
  // Conversions
  trackConversionGoal
};
