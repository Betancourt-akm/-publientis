/**
 * Script de Prueba para Sistema de Cupones
 * Ejecutar: node scripts/testCoupons.js
 */

const mongoose = require('mongoose');
const Coupon = require('../models/couponModel');
require('dotenv').config();

const testCoupons = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar cupones de prueba anteriores
    await Coupon.deleteMany({ code: { $in: ['TEST10', 'WELCOME20', 'FIXED5K'] } });
    console.log('🧹 Cupones de prueba anteriores eliminados');

    // ==========================================
    // TEST 1: Cupón de Porcentaje Simple
    // ==========================================
    console.log('\n📝 TEST 1: Creando cupón de porcentaje...');
    const percentageCoupon = await Coupon.create({
      code: 'TEST10',
      description: '10% de descuento de prueba',
      discountType: 'percentage',
      discountValue: 10,
      minPurchaseAmount: 50000,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      usageLimit: 100,
      usagePerUser: 1,
      isActive: true
    });
    console.log('✅ Cupón creado:', percentageCoupon.code);

    // Validar cupón
    const validation1 = percentageCoupon.isValid();
    console.log('🔍 Validación:', validation1);

    // Calcular descuento
    const cartTotal1 = 100000;
    const discount1 = percentageCoupon.calculateDiscount(cartTotal1);
    console.log(`💰 Descuento para $${cartTotal1.toLocaleString()}:`, `$${discount1.toLocaleString()}`);
    console.log(`💵 Total final:`, `$${(cartTotal1 - discount1).toLocaleString()}`);

    // ==========================================
    // TEST 2: Cupón con Descuento Fijo
    // ==========================================
    console.log('\n📝 TEST 2: Creando cupón de monto fijo...');
    const fixedCoupon = await Coupon.create({
      code: 'FIXED5K',
      description: '$5,000 de descuento fijo',
      discountType: 'fixed',
      discountValue: 5000,
      minPurchaseAmount: 20000,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    });
    console.log('✅ Cupón creado:', fixedCoupon.code);

    const cartTotal2 = 30000;
    const discount2 = fixedCoupon.calculateDiscount(cartTotal2);
    console.log(`💰 Descuento para $${cartTotal2.toLocaleString()}:`, `$${discount2.toLocaleString()}`);
    console.log(`💵 Total final:`, `$${(cartTotal2 - discount2).toLocaleString()}`);

    // ==========================================
    // TEST 3: Cupón con Límite Máximo
    // ==========================================
    console.log('\n📝 TEST 3: Creando cupón con descuento máximo...');
    const maxDiscountCoupon = await Coupon.create({
      code: 'WELCOME20',
      description: '20% con máximo $30,000',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 30000,
      minPurchaseAmount: 50000,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true
    });
    console.log('✅ Cupón creado:', maxDiscountCoupon.code);

    // Test con total alto
    const cartTotal3 = 200000; // $200,000
    const discount3 = maxDiscountCoupon.calculateDiscount(cartTotal3);
    console.log(`💰 Descuento calculado (20% de $${cartTotal3.toLocaleString()}):`, `$${discount3.toLocaleString()}`);
    console.log(`📊 Descuento esperado sin límite:`, `$${(cartTotal3 * 0.2).toLocaleString()}`);
    console.log(`✅ Descuento aplicado (con límite):`, `$${discount3.toLocaleString()}`);
    console.log(`💵 Total final:`, `$${(cartTotal3 - discount3).toLocaleString()}`);

    // ==========================================
    // TEST 4: Validaciones de Errores
    // ==========================================
    console.log('\n📝 TEST 4: Probando validaciones...');

    // Intentar crear cupón duplicado
    try {
      await Coupon.create({
        code: 'TEST10', // Ya existe
        description: 'Duplicado',
        discountType: 'percentage',
        discountValue: 10,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    } catch (error) {
      console.log('✅ Error esperado (código duplicado):', error.message.includes('duplicate'));
    }

    // Cupón inactivo
    const inactiveCoupon = await Coupon.create({
      code: 'INACTIVE',
      description: 'Cupón inactivo',
      discountType: 'percentage',
      discountValue: 10,
      startDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: false
    });
    const validation2 = inactiveCoupon.isValid();
    console.log('✅ Validación de cupón inactivo:', validation2);

    // Cupón expirado
    const expiredCoupon = await Coupon.create({
      code: 'EXPIRED',
      description: 'Cupón expirado',
      discountType: 'percentage',
      discountValue: 10,
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Ayer
      isActive: true
    });
    const validation3 = expiredCoupon.isValid();
    console.log('✅ Validación de cupón expirado:', validation3);

    // ==========================================
    // TEST 5: Simular Uso
    // ==========================================
    console.log('\n📝 TEST 5: Simulando uso de cupón...');
    
    const testUserId = new mongoose.Types.ObjectId();
    const testOrderId = new mongoose.Types.ObjectId();

    // Primer uso
    percentageCoupon.usedBy.push({
      userId: testUserId,
      orderId: testOrderId,
      usedAt: new Date(),
      discountApplied: 10000
    });
    percentageCoupon.usageCount += 1;
    await percentageCoupon.save();
    console.log('✅ Primer uso registrado');

    // Verificar si puede usar de nuevo
    const canUse = percentageCoupon.canUserUse(testUserId);
    console.log('🔍 ¿Puede usar de nuevo?:', canUse);

    // ==========================================
    // RESUMEN FINAL
    // ==========================================
    console.log('\n📊 RESUMEN FINAL:');
    const allCoupons = await Coupon.find({});
    console.log(`Total de cupones en DB: ${allCoupons.length}`);
    
    allCoupons.forEach(coupon => {
      console.log(`\n- ${coupon.code}:`);
      console.log(`  Tipo: ${coupon.discountType === 'percentage' ? 'Porcentaje' : 'Fijo'}`);
      console.log(`  Valor: ${coupon.discountValue}${coupon.discountType === 'percentage' ? '%' : ''}`);
      console.log(`  Activo: ${coupon.isActive ? '✅' : '❌'}`);
      console.log(`  Usos: ${coupon.usageCount}${coupon.usageLimit ? `/${coupon.usageLimit}` : ''}`);
    });

    console.log('\n✅ TODOS LOS TESTS COMPLETADOS');
    console.log('\n💡 Los cupones TEST10, WELCOME20 y FIXED5K están listos para usar');
    console.log('   Puedes probarlos en el checkout con estos códigos');

  } catch (error) {
    console.error('❌ Error en tests:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Desconectado de MongoDB');
  }
};

// Ejecutar tests
testCoupons();
