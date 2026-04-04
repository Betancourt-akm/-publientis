const express = require('express');
const app = express();

// Import routes
const orderRoutes = require('./routes/orderRoutes');

// Mount routes
app.use('/', orderRoutes);

// List all registered routes
console.log('=== REGISTERED ROUTES ===');
app._router.stack.forEach(function(r){
  if(r.route && r.route.path){
    Object.keys(r.route.methods).forEach(method => {
      console.log(`${method.toUpperCase()} ${r.route.path}`);
    });
  }
});

console.log('\n=== CHECKING ORDER ROUTES SPECIFICALLY ===');
// Check if the orderRoutes module exports routes correctly
console.log('Order routes type:', typeof orderRoutes);
console.log('Order routes stack length:', orderRoutes.stack ? orderRoutes.stack.length : 'No stack');

if (orderRoutes.stack) {
  orderRoutes.stack.forEach((layer, index) => {
    if (layer.route) {
      console.log(`Route ${index}: ${Object.keys(layer.route.methods).join(',')} ${layer.route.path}`);
    }
  });
}
