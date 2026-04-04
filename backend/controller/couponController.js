/**
 * Controlador de Cupones y Descuentos
 */

const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');

// Crear cupón (Admin)
const createCoupon = async (req, res) => {
  try {
    const couponData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const coupon = await Coupon.create(couponData);
    
    console.log(`✅ Cupón creado: ${coupon.code}`);
    
    res.status(201).json({
      success: true,
      message: 'Cupón creado exitosamente',
      data: coupon
    });
  } catch (error) {
    console.error('❌ Error creando cupón:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener todos los cupones (Admin)
const getAllCoupons = async (req, res) => {
  try {
    const { active, expired } = req.query;
    
    let query = {};
    
    if (active === 'true') {
      query.isActive = true;
      query.expiryDate = { $gte: new Date() };
    }
    
    if (expired === 'true') {
      query.expiryDate = { $lt: new Date() };
    }
    
    const coupons = await Coupon.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons
    });
  } catch (error) {
    console.error('❌ Error obteniendo cupones:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener cupón por código (Público)
const getCouponByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase() 
    });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }
    
    // Validar cupón
    const validation = coupon.isValid();
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }
    
    // Verificar uso del usuario si está autenticado
    if (req.user) {
      const userValidation = coupon.canUserUse(req.user._id);
      if (!userValidation.can) {
        return res.status(400).json({
          success: false,
          message: userValidation.message
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minPurchaseAmount: coupon.minPurchaseAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
        expiryDate: coupon.expiryDate
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo cupón:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Validar y aplicar cupón
const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    
    if (!code || !cartTotal) {
      return res.status(400).json({
        success: false,
        message: 'Código y total del carrito son requeridos'
      });
    }
    
    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase() 
    });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no válido'
      });
    }
    
    // Validar cupón
    const validation = coupon.isValid();
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }
    
    // Verificar monto mínimo
    if (cartTotal < coupon.minPurchaseAmount) {
      return res.status(400).json({
        success: false,
        message: `El monto mínimo para este cupón es $${coupon.minPurchaseAmount.toLocaleString('es-CO')}`
      });
    }
    
    // Verificar uso del usuario
    if (req.user) {
      const userValidation = coupon.canUserUse(req.user._id);
      if (!userValidation.can) {
        return res.status(400).json({
          success: false,
          message: userValidation.message
        });
      }
    }
    
    // Calcular descuento
    const discount = coupon.calculateDiscount(cartTotal);
    const finalTotal = cartTotal - discount;
    
    res.status(200).json({
      success: true,
      message: 'Cupón aplicado exitosamente',
      data: {
        couponCode: coupon.code,
        discount: discount,
        originalTotal: cartTotal,
        finalTotal: finalTotal,
        discountPercentage: ((discount / cartTotal) * 100).toFixed(2)
      }
    });
  } catch (error) {
    console.error('❌ Error validando cupón:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Aplicar cupón en una orden (usado internamente)
const applyCouponToOrder = async (couponCode, orderId, userId) => {
  try {
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase() 
    });
    
    if (!coupon) {
      throw new Error('Cupón no válido');
    }
    
    const validation = coupon.isValid();
    if (!validation.valid) {
      throw new Error(validation.message);
    }
    
    const userValidation = coupon.canUserUse(userId);
    if (!userValidation.can) {
      throw new Error(userValidation.message);
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error('Orden no encontrada');
    }
    
    const discount = coupon.calculateDiscount(order.totalAmount);
    
    // Registrar uso
    coupon.usedBy.push({
      userId: userId,
      orderId: orderId,
      usedAt: new Date(),
      discountApplied: discount
    });
    
    coupon.usageCount += 1;
    await coupon.save();
    
    console.log(`✅ Cupón ${coupon.code} aplicado a orden ${order.orderNumber}`);
    
    return {
      success: true,
      discount: discount
    };
  } catch (error) {
    console.error('❌ Error aplicando cupón:', error);
    throw error;
  }
};

// Actualizar cupón (Admin)
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByIdAndUpdate(
      id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }
    
    console.log(`✅ Cupón actualizado: ${coupon.code}`);
    
    res.status(200).json({
      success: true,
      message: 'Cupón actualizado exitosamente',
      data: coupon
    });
  } catch (error) {
    console.error('❌ Error actualizando cupón:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Eliminar cupón (Admin)
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByIdAndDelete(id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }
    
    console.log(`🗑️ Cupón eliminado: ${coupon.code}`);
    
    res.status(200).json({
      success: true,
      message: 'Cupón eliminado exitosamente'
    });
  } catch (error) {
    console.error('❌ Error eliminando cupón:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener estadísticas de cupón (Admin)
const getCouponStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findById(id).populate('usedBy.userId', 'name email');
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Cupón no encontrado'
      });
    }
    
    const totalDiscount = coupon.usedBy.reduce((sum, usage) => sum + usage.discountApplied, 0);
    
    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        usageCount: coupon.usageCount,
        usageLimit: coupon.usageLimit,
        totalDiscountGiven: totalDiscount,
        averageDiscount: coupon.usageCount > 0 ? totalDiscount / coupon.usageCount : 0,
        recentUsages: coupon.usedBy.slice(-10).reverse()
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createCoupon,
  getAllCoupons,
  getCouponByCode,
  validateCoupon,
  applyCouponToOrder,
  updateCoupon,
  deleteCoupon,
  getCouponStats
};
