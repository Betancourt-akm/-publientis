require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoDBConnection() {
  console.log('=== TESTING MONGODB CONNECTION ===');
  console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
  console.log('URI preview:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : 'N/A');
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Successfully connected to MongoDB');
    
    // Test basic operations
    console.log('Connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // Test if we can access collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Test Order model specifically
    const Order = require('./models/orderModel');
    const orderCount = await Order.countDocuments();
    console.log(`Total orders in database: ${orderCount}`);
    
    if (orderCount > 0) {
      const sampleOrder = await Order.findOne().lean();
      console.log('Sample order:', {
        id: sampleOrder._id,
        orderNumber: sampleOrder.orderNumber,
        orderStatus: sampleOrder.orderStatus,
        createdAt: sampleOrder.createdAt
      });
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed.');
  }
}

testMongoDBConnection();
