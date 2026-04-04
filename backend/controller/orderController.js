const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Vendor = require('../models/vendorModel');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');

// Crear orden (soporta usuarios autenticados y guest checkout)
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, notes, items: guestItems } = req.body;
    
    let orderItems = [];
    let subtotal = 0;
    
    // ✅ COMPRA CON USUARIO AUTENTICADO
    if (req.user) {
      console.log('🔐 Orden con usuario autenticado:', req.user.email);
      
      // Obtener carrito del usuario
      const cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
      
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El carrito está vacío',
        });
      }
      
      const resolveCartProduct = async (cartItem) => {
        const populatedProduct = cartItem?.productId;
        if (populatedProduct && typeof populatedProduct === 'object' && populatedProduct._id) {
          return populatedProduct;
        }
        return Product.findById(cartItem.productId);
      };

      // Verificar stock de todos los productos
      for (const item of cart.items) {
        const product = await resolveCartProduct(item);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente para ${product?.name || 'producto'}`,
          });
        }
      }
      
      // Preparar items para la orden (incluye snapshot vendor + comisión por ítem)
      orderItems = [];
      for (const item of cart.items) {
        const product = await resolveCartProduct(item);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Producto no encontrado',
          });
        }

        let vendorId = null;
        let vendorName = null;
        let commissionPercentage = 0;

        if (product?.vendor) {
          const vendor = await Vendor.findById(product.vendor);
          if (vendor) {
            vendorId = vendor._id;
            vendorName = vendor.name;
            commissionPercentage = Number(vendor.commissionPercentage || 0);
          }
        }

        const unitPrice = Number(item.price);
        const quantity = Number(item.quantity);
        const lineTotal = unitPrice * quantity;
        const commissionAmount = Math.round((lineTotal * commissionPercentage) / 100);
        const vendorAmount = Math.round(lineTotal - commissionAmount);

        orderItems.push({
          productId: product._id,
          vendorId,
          vendorName,
          name: product.name,
          image: product.images[0],
          price: unitPrice,
          quantity,
          commissionPercentage,
          commissionAmount,
          vendorAmount,
          platformAmount: commissionAmount,
        });
      }
      
      subtotal = cart.totalPrice;
    } 
    // ✅ GUEST CHECKOUT - Compra sin login
    else {
      console.log('🛒 Guest checkout - Compra sin login');
      
      if (!guestItems || guestItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El carrito está vacío',
        });
      }
      
      // Verificar stock y calcular subtotal
      for (const item of guestItems) {
        const product = await Product.findById(item.productId);
        
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Producto no encontrado: ${item.productId}`,
          });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Stock insuficiente para ${product.name}`,
          });
        }
        
        let vendorId = null;
        let vendorName = null;
        let commissionPercentage = 0;

        if (product?.vendor) {
          const vendor = await Vendor.findById(product.vendor);
          if (vendor) {
            vendorId = vendor._id;
            vendorName = vendor.name;
            commissionPercentage = Number(vendor.commissionPercentage || 0);
          }
        }

        const unitPrice = Number(product.selling);
        const quantity = Number(item.quantity);
        const lineTotal = unitPrice * quantity;
        const commissionAmount = Math.round((lineTotal * commissionPercentage) / 100);
        const vendorAmount = Math.round(lineTotal - commissionAmount);

        // Preparar item para la orden
        orderItems.push({
          productId: product._id,
          vendorId,
          vendorName,
          name: product.name,
          image: product.images[0],
          price: unitPrice,
          quantity,
          commissionPercentage,
          commissionAmount,
          vendorAmount,
          platformAmount: commissionAmount,
        });
        
        subtotal += unitPrice * quantity;
      }
    }
    
    // Calcular totales
    const shippingCost = subtotal > 100000 ? 0 : 10000; // Envío gratis sobre $100,000
    const tax = subtotal * 0.19; // IVA 19%
    const totalPrice = subtotal + shippingCost + tax;
    
    // ✅ Generar número de orden único
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${String(orderCount + 1).padStart(6, '0')}`;
    
    // Crear orden (con userId: null si es guest)
    const order = new Order({
      userId: req.user ? req.user._id : null, // null para guest checkout
      orderNumber,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      totalPrice,
      notes: notes || '',
      isGuestOrder: !req.user, // Flag para identificar órdenes de invitado
    });
    
    await order.save();
    
    // ❌ NO reducir stock ni limpiar carrito hasta que el pago se confirme
    // El stock se reducirá en capturePayPalOrder cuando el pago sea exitoso
    
    console.log('✅ Orden creada. ID:', order._id);
    console.log('🛒 Tipo:', req.user ? 'Usuario autenticado' : 'Guest checkout');
    
    // 📧 Enviar email de confirmación de orden
    try {
      const emailData = req.user || { email: shippingAddress.email, name: shippingAddress.fullName };
      await emailService.sendOrderConfirmation(order, emailData);
      console.log('📧 Email de confirmación enviado a:', emailData.email);
    } catch (emailError) {
      console.error('❌ Error enviando email de confirmación:', emailError);
      // No fallar la respuesta por error de email
    }
    
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: order,
    });
  } catch (error) {
    console.error('❌ Error creando orden:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener órdenes del usuario
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener orden por ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }
    
    // Verificar que la orden pertenece al usuario (excepto admin)
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta orden',
      });
    }
    
    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Actualizar estado de pago (Admin o sistema de pago)
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, transactionId } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }
    
    order.paymentStatus = paymentStatus;
    if (transactionId) {
      order.transactionId = transactionId;
    }
    
    if (paymentStatus === 'Pagado' && order.orderStatus === 'Pendiente') {
      order.orderStatus = 'Procesando';
    }
    
    await order.save();
    
    res.status(200).json({
      success: true,
      message: 'Estado de pago actualizado',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Actualizar estado de orden (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, trackingNumber, cancelReason } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }
    
    const oldStatus = order.orderStatus;
    order.orderStatus = orderStatus;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    if (orderStatus === 'Entregado') {
      order.deliveredAt = new Date();
    }
    
    if (orderStatus === 'Cancelado') {
      order.cancelledAt = new Date();
      order.cancelReason = cancelReason || 'Cancelado por administrador';
      
      // Devolver stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { 
            stock: item.quantity,
            salesCount: -item.quantity,
          },
        });
      }
    }
    
    await order.save();
    
    // 📧 Enviar emails según el nuevo estado
    try {
      const orderWithDetails = await Order.findById(order._id).populate('userId');
      
      if (orderStatus === 'Enviado') {
        await emailService.sendShippingNotification(orderWithDetails);
        console.log('📧 Email de envío enviado');
      } else if (orderStatus === 'Entregado') {
        await emailService.sendDeliveryConfirmation(orderWithDetails);
        console.log('📧 Email de entrega enviado');
      } else {
        await emailService.sendOrderStatusChange(orderWithDetails, oldStatus, orderStatus);
        console.log(`📧 Email de cambio de estado enviado: ${oldStatus} → ${orderStatus}`);
      }

      // 📲 Enviar notificación push
      try {
        await notificationService.notifyOrderStatusChange(orderWithDetails, oldStatus, orderStatus);
        console.log('📲 Notificación push enviada');
      } catch (pushError) {
        console.error('❌ Error enviando notificación push:', pushError);
        // No fallar si el push falla
      }
    } catch (emailError) {
      console.error('❌ Error enviando email de estado:', emailError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Estado de orden actualizado',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Cancelar orden (Usuario)
const cancelOrder = async (req, res) => {
  try {
    const { cancelReason } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Orden no encontrada',
      });
    }
    
    // Verificar que la orden pertenece al usuario
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para cancelar esta orden',
      });
    }
    
    // Solo se puede cancelar si está en estado Pendiente o Procesando
    if (!['Pendiente', 'Procesando'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar esta orden en su estado actual',
      });
    }
    
    const oldStatus = order.orderStatus;
    order.orderStatus = 'Cancelado';
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || 'Cancelado por el usuario';
    
    // Devolver stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { 
          stock: item.quantity,
          salesCount: -item.quantity,
        },
      });
    }
    
    await order.save();
    
    // 📧 Enviar email de cancelación
    try {
      const orderWithDetails = await Order.findById(order._id).populate('userId');
      await emailService.sendOrderStatusChange(orderWithDetails, oldStatus, 'Cancelado');
      console.log('📧 Email de cancelación enviado');
    } catch (emailError) {
      console.error('❌ Error enviando email de cancelación:', emailError);
    }
    
    res.status(200).json({
      success: true,
      message: 'Orden cancelada exitosamente',
      data: order,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener todas las órdenes (Admin)
const getAllOrders = async (req, res) => {
  try {
    console.log('📦 getAllOrders - Iniciando consulta...');
    console.log('👤 Usuario autenticado:', req.user ? req.user.email : 'NO AUTENTICADO');
    console.log('🔑 Rol del usuario:', req.user ? req.user.role : 'NO ROLE');
    console.log('🍪 Cookies recibidas:', req.cookies);
    console.log('🔐 Headers Authorization:', req.headers.authorization);
    console.log('Query params:', req.query);
    
    // Verificar autenticación
    if (!req.user) {
      console.log('❌ Usuario no autenticado');
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }
    
    // Verificar rol de admin
    if (req.user.role !== 'ADMIN') {
      console.log('❌ Usuario sin permisos de admin:', req.user.role);
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos de administrador'
      });
    }
    
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (status) {
      query.orderStatus = status;
    }
    
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }
    
    console.log('📦 Filtros aplicados:', query);
    
    const skip = (page - 1) * limit;
    
    // Primero verificamos si hay órdenes
    console.log('📦 Contando documentos...');
    const total = await Order.countDocuments(query);
    console.log(`📦 Total de órdenes encontradas: ${total}`);
    
    if (total === 0) {
      console.log('📦 No hay órdenes, devolviendo array vacío');
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          currentPage: Number(page),
          totalPages: 0,
          totalOrders: 0,
          limit: Number(limit),
        },
      });
    }
    
    // Consultar órdenes SIN populate primero para evitar errores
    console.log('📦 Consultando órdenes...');
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Usar lean() para mejor performance
    
    console.log(`📦 Órdenes recuperadas: ${orders.length}`);
    console.log('📦 Primera orden (sample):', orders[0] ? {
      id: orders[0]._id,
      orderNumber: orders[0].orderNumber,
      orderStatus: orders[0].orderStatus
    } : 'No hay órdenes');
    
    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        limit: Number(limit),
      },
    });
  } catch (error) {
    console.error('❌ Error en getAllOrders:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error code:', error.code);
    
    res.status(500).json({
      success: false,
      message: 'Error al obtener las órdenes',
      error: error.message,
      errorName: error.name,
      errorCode: error.code,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updatePaymentStatus,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
};
