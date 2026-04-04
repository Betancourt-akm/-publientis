const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createTestOrders() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Crear usuario de prueba si no existe
        let testUser = await User.findOne({ email: 'cliente@test.com' });
        
        if (!testUser) {
            const salt = bcrypt.genSaltSync(10);
            const hashPassword = bcrypt.hashSync('test123', salt);
            
            testUser = new User({
                name: 'Cliente de Prueba',
                email: 'cliente@test.com',
                password: hashPassword,
                role: 'USER',
                isVerified: true,
                tel: '+57 300 555 0123'
            });
            
            await testUser.save();
            console.log('👤 Usuario de prueba creado: cliente@test.com');
        }

        // Verificar si ya existen órdenes de prueba
        const existingOrders = await Order.countDocuments();
        if (existingOrders > 0) {
            console.log(`⚠️ Ya existen ${existingOrders} órdenes en la base de datos`);
            console.log('¿Deseas continuar? Las nuevas órdenes se agregarán a las existentes.');
        }

        // Crear órdenes de prueba
        const testOrders = [
            {
                userId: testUser._id,
                items: [
                    {
                        productId: new mongoose.Types.ObjectId(),
                        name: 'Smartphone Samsung Galaxy',
                        image: 'https://via.placeholder.com/150',
                        price: 850000,
                        quantity: 1
                    },
                    {
                        productId: new mongoose.Types.ObjectId(),
                        name: 'Funda Protectora',
                        image: 'https://via.placeholder.com/150',
                        price: 25000,
                        quantity: 2
                    }
                ],
                shippingAddress: {
                    fullName: 'Cliente de Prueba',
                    address: 'Calle 123 #45-67',
                    city: 'Medellín',
                    postalCode: '050001',
                    country: 'Colombia',
                    phone: '+57 300 555 0123'
                },
                paymentMethod: 'PayPal',
                paymentStatus: 'Pagado',
                subtotal: 900000,
                shippingCost: 15000,
                tax: 171000,
                totalPrice: 1086000,
                orderStatus: 'Procesando',
                notes: 'Entrega rápida por favor'
            },
            {
                userId: testUser._id,
                items: [
                    {
                        productId: new mongoose.Types.ObjectId(),
                        name: 'Laptop HP Pavilion',
                        image: 'https://via.placeholder.com/150',
                        price: 2500000,
                        quantity: 1
                    }
                ],
                shippingAddress: {
                    fullName: 'Cliente de Prueba',
                    address: 'Carrera 70 #52-20',
                    city: 'Bogotá',
                    postalCode: '110111',
                    country: 'Colombia',
                    phone: '+57 300 555 0123'
                },
                paymentMethod: 'Tarjeta de Crédito',
                paymentStatus: 'Pendiente',
                subtotal: 2500000,
                shippingCost: 0, // Envío gratis
                tax: 475000,
                totalPrice: 2975000,
                orderStatus: 'Pendiente',
                notes: 'Primera compra del cliente'
            },
            {
                userId: testUser._id,
                items: [
                    {
                        productId: new mongoose.Types.ObjectId(),
                        name: 'Auriculares Bluetooth',
                        image: 'https://via.placeholder.com/150',
                        price: 180000,
                        quantity: 1
                    },
                    {
                        productId: new mongoose.Types.ObjectId(),
                        name: 'Cable USB-C',
                        image: 'https://via.placeholder.com/150',
                        price: 35000,
                        quantity: 3
                    }
                ],
                shippingAddress: {
                    fullName: 'Cliente de Prueba',
                    address: 'Avenida El Poblado #10-15',
                    city: 'Medellín',
                    postalCode: '050021',
                    country: 'Colombia',
                    phone: '+57 300 555 0123'
                },
                paymentMethod: 'PSE',
                paymentStatus: 'Pagado',
                subtotal: 285000,
                shippingCost: 12000,
                tax: 54150,
                totalPrice: 351150,
                orderStatus: 'Entregado',
                deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Hace 2 días
                notes: ''
            },
            {
                userId: testUser._id,
                items: [
                    {
                        productId: new mongoose.Types.ObjectId(),
                        name: 'Tablet Android',
                        image: 'https://via.placeholder.com/150',
                        price: 650000,
                        quantity: 1
                    }
                ],
                shippingAddress: {
                    fullName: 'Cliente de Prueba',
                    address: 'Calle 80 #11-42',
                    city: 'Cali',
                    postalCode: '760001',
                    country: 'Colombia',
                    phone: '+57 300 555 0123'
                },
                paymentMethod: 'Efectivo Contra Entrega',
                paymentStatus: 'Fallido',
                subtotal: 650000,
                shippingCost: 18000,
                tax: 123500,
                totalPrice: 791500,
                orderStatus: 'Cancelado',
                cancelledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hace 1 día
                cancelReason: 'Pago fallido - cliente no disponible',
                notes: 'Cliente no contestó llamadas'
            }
        ];

        // Guardar órdenes en la base de datos
        const savedOrders = [];
        for (const orderData of testOrders) {
            const order = new Order(orderData);
            await order.save();
            savedOrders.push(order);
        }

        console.log('🎉 Órdenes de prueba creadas exitosamente!');
        console.log(`📦 Total de órdenes creadas: ${savedOrders.length}`);
        console.log('');
        console.log('📋 Resumen de órdenes:');
        savedOrders.forEach((order, index) => {
            console.log(`${index + 1}. ${order.orderNumber} - ${order.orderStatus} - ${order.paymentStatus} - $${order.totalPrice.toLocaleString()}`);
        });
        console.log('');
        console.log('🔗 Ahora puedes ver estas órdenes en: http://localhost:3000/admin-panel/ordenes');
        console.log('👤 Inicia sesión como admin: admin@freshface.com / admin123');

    } catch (error) {
        console.error('❌ Error al crear órdenes de prueba:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
        process.exit(0);
    }
}

createTestOrders();
