const { getAllOrders } = require('./controller/orderController');
const Order = require('./models/orderModel');

// Test the getAllOrders function
async function testGetAllOrders() {
  console.log('=== TESTING getAllOrders FUNCTION ===');
  
  try {
    // Mock request and response objects
    const mockReq = {
      user: {
        _id: '507f1f77bcf86cd799439011', // Mock admin user ID
        role: 'ADMIN'
      },
      query: {}
    };
    
    const mockRes = {
      status: function(code) {
        console.log(`Response status: ${code}`);
        return this;
      },
      json: function(data) {
        console.log('Response data:', JSON.stringify(data, null, 2));
        return this;
      }
    };
    
    console.log('Calling getAllOrders...');
    await getAllOrders(mockReq, mockRes);
    
  } catch (error) {
    console.error('Error testing getAllOrders:', error);
  }
}

// Test database connection first
async function testDatabase() {
  try {
    console.log('=== TESTING DATABASE CONNECTION ===');
    const mongoose = require('mongoose');
    
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to database...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/freshface');
    }
    
    console.log('Database connection state:', mongoose.connection.readyState);
    
    // Test Order model
    const orderCount = await Order.countDocuments();
    console.log(`Total orders in database: ${orderCount}`);
    
    // Test a simple find
    const orders = await Order.find().limit(1);
    console.log(`Sample order:`, orders[0] || 'No orders found');
    
  } catch (error) {
    console.error('Database test error:', error);
  }
}

async function runTests() {
  await testDatabase();
  await testGetAllOrders();
  process.exit(0);
}

runTests();
