const Subscription = require('../models/subscriptionModel');
const User = require('../models/userModel');

// Obtener suscripción actual de una organización
exports.getMySubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Verificar que es una organización
    if (req.user.role !== 'ORGANIZATION') {
      return res.status(403).json({
        success: false,
        message: 'Solo las organizaciones pueden tener suscripciones'
      });
    }
    
    let subscription = await Subscription.findOne({
      organization: userId,
      status: 'active'
    });
    
    // Si no existe, crear suscripción FREE por defecto
    if (!subscription) {
      subscription = await Subscription.create({
        organization: userId,
        plan: 'free',
        status: 'active',
        features: Subscription.getPlanFeatures('free'),
        history: [{
          action: 'created',
          newPlan: 'free',
          date: new Date(),
          notes: 'Suscripción gratuita por defecto'
        }]
      });
    }
    
    return res.status(200).json({
      success: true,
      data: subscription,
      isPro: subscription.plan === 'pro' || subscription.plan === 'premium'
    });
  } catch (error) {
    console.error('Error en getMySubscription:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener suscripción'
    });
  }
};

// Crear/Actualizar suscripción PRO (después de pago)
exports.upgradeToPro = async (req, res) => {
  try {
    const userId = req.user._id;
    const { transactionId, frequency = 'monthly' } = req.body;
    
    if (req.user.role !== 'ORGANIZATION') {
      return res.status(403).json({
        success: false,
        message: 'Solo las organizaciones pueden actualizar a PRO'
      });
    }
    
    let subscription = await Subscription.findOne({
      organization: userId
    });
    
    const newPlan = 'pro';
    const planFeatures = Subscription.getPlanFeatures(newPlan);
    
    if (subscription) {
      // Actualizar existente
      const previousPlan = subscription.plan;
      
      subscription.plan = newPlan;
      subscription.status = 'active';
      subscription.features = planFeatures;
      subscription.startDate = new Date();
      subscription.endDate = subscription.calculateEndDate(frequency);
      subscription.payment = {
        amount: 1.00,
        currency: 'USD',
        frequency,
        lastPaymentDate: new Date(),
        nextPaymentDate: subscription.calculateEndDate(frequency),
        transactionId
      };
      
      subscription.history.push({
        action: previousPlan === 'free' ? 'upgraded' : 'renewed',
        previousPlan,
        newPlan,
        date: new Date(),
        notes: `Actualización a ${newPlan.toUpperCase()} - $1 USD/${frequency}`
      });
      
      await subscription.save();
    } else {
      // Crear nueva
      subscription = await Subscription.create({
        organization: userId,
        plan: newPlan,
        status: 'active',
        features: planFeatures,
        startDate: new Date(),
        endDate: subscription.calculateEndDate(frequency),
        payment: {
          amount: 1.00,
          currency: 'USD',
          frequency,
          lastPaymentDate: new Date(),
          nextPaymentDate: subscription.calculateEndDate(frequency),
          transactionId
        },
        history: [{
          action: 'created',
          newPlan,
          date: new Date(),
          notes: `Suscripción ${newPlan.toUpperCase()} activada - $1 USD/${frequency}`
        }]
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Suscripción PRO activada exitosamente',
      data: subscription
    });
  } catch (error) {
    console.error('Error en upgradeToPro:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al actualizar suscripción'
    });
  }
};

// Cancelar suscripción (volver a FREE)
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reason } = req.body;
    
    const subscription = await Subscription.findOne({
      organization: userId,
      status: 'active'
    });
    
    if (!subscription || subscription.plan === 'free') {
      return res.status(400).json({
        success: false,
        message: 'No tienes una suscripción activa para cancelar'
      });
    }
    
    const previousPlan = subscription.plan;
    
    subscription.plan = 'free';
    subscription.features = Subscription.getPlanFeatures('free');
    subscription.endDate = null;
    subscription.autoRenew = false;
    subscription.cancellationReason = reason;
    subscription.cancelledAt = new Date();
    subscription.cancelledBy = userId;
    
    subscription.history.push({
      action: 'downgraded',
      previousPlan,
      newPlan: 'free',
      date: new Date(),
      notes: `Cancelación: ${reason || 'Sin razón especificada'}`
    });
    
    await subscription.save();
    
    return res.status(200).json({
      success: true,
      message: 'Suscripción cancelada. Ahora estás en el plan gratuito',
      data: subscription
    });
  } catch (error) {
    console.error('Error en cancelSubscription:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al cancelar suscripción'
    });
  }
};

// Verificar si una organización tiene plan PRO activo
exports.checkProStatus = async (req, res) => {
  try {
    const { organizationId } = req.params;
    
    const subscription = await Subscription.findOne({
      organization: organizationId,
      status: 'active'
    });
    
    const isPro = subscription && 
                  (subscription.plan === 'pro' || subscription.plan === 'premium') &&
                  subscription.isActive();
    
    return res.status(200).json({
      success: true,
      isPro,
      plan: subscription?.plan || 'free',
      features: subscription?.features || Subscription.getPlanFeatures('free')
    });
  } catch (error) {
    console.error('Error en checkProStatus:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al verificar estado PRO'
    });
  }
};

// Obtener estadísticas de suscripciones (Admin)
exports.getSubscriptionStats = async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const proSubscriptions = await Subscription.countDocuments({ 
      plan: 'pro', 
      status: 'active' 
    });
    const freeSubscriptions = await Subscription.countDocuments({ 
      plan: 'free', 
      status: 'active' 
    });
    
    const monthlyRevenue = proSubscriptions * 1.00; // $1 por PRO
    
    return res.status(200).json({
      success: true,
      data: {
        total: totalSubscriptions,
        active: activeSubscriptions,
        pro: proSubscriptions,
        free: freeSubscriptions,
        conversionRate: totalSubscriptions > 0 
          ? ((proSubscriptions / totalSubscriptions) * 100).toFixed(2) 
          : 0,
        monthlyRevenue: `$${monthlyRevenue.toFixed(2)} USD`
      }
    });
  } catch (error) {
    console.error('Error en getSubscriptionStats:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener estadísticas'
    });
  }
};

// Job para verificar suscripciones expiradas
exports.checkExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lte: now },
      plan: { $ne: 'free' }
    });
    
    for (const sub of expiredSubscriptions) {
      if (sub.autoRenew) {
        // Aquí iría lógica de cobro automático
        console.log(`Renovación automática para ${sub.organization}`);
      } else {
        // Downgrade a FREE
        sub.plan = 'free';
        sub.status = 'expired';
        sub.features = Subscription.getPlanFeatures('free');
        sub.history.push({
          action: 'expired',
          previousPlan: sub.plan,
          newPlan: 'free',
          date: now,
          notes: 'Suscripción expirada - Downgrade a FREE'
        });
        await sub.save();
        
        console.log(`Suscripción expirada para ${sub.organization} - Downgrade a FREE`);
      }
    }
    
    console.log(`Verificación de suscripciones: ${expiredSubscriptions.length} procesadas`);
  } catch (error) {
    console.error('Error en checkExpiredSubscriptions:', error);
  }
};
