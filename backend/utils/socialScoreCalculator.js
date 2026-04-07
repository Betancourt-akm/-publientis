const User = require('../models/userModel');

/**
 * Social Score Calculator - Algoritmo de Visibilidad Social
 * 
 * Calcula un puntaje (0-100) que determina la posición
 * del egresado en búsquedas del Marketplace.
 * 
 * Pesos:
 * - 30% Publicaciones validadas por profesores
 * - 25% Endorsements de la Facultad
 * - 20% Completitud de portafolio + perfil
 * - 15% Rating promedio de evaluaciones
 * - 10% Rapidez de respuesta a organizaciones
 */

const WEIGHTS = {
  VALIDATED_PUBLICATIONS: 0.30,
  FACULTY_ENDORSEMENTS: 0.25,
  PROFILE_COMPLETENESS: 0.20,
  EVALUATION_RATING: 0.15,
  RESPONSE_TIME: 0.10
};

/**
 * Calcular socialScore para un usuario
 * @param {String} userId - ID del usuario
 * @returns {Number} Score entre 0-100
 */
async function calculateSocialScore(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return 0;

    const metrics = user.socialMetrics || {};
    
    // 1. Publicaciones validadas (max 100 puntos)
    const pubScore = Math.min(100, (metrics.validatedPublications || 0) * 10);
    
    // 2. Endorsements de Facultad (max 100 puntos)
    const endorseScore = Math.min(100, (metrics.facultyEndorsements || 0) * 20);
    
    // 3. Completitud de perfil/portafolio (max 100 puntos)
    const completenessScore = user.profileCompleteness || 0;
    
    // 4. Rating de evaluaciones (max 100 puntos)
    // Se normaliza de escala 1-5 a 0-100
    const avgRating = metrics.avgEvaluationRating || 0;
    const ratingScore = avgRating > 0 ? (avgRating / 5) * 100 : 0;
    
    // 5. Rapidez de respuesta (max 100 puntos)
    // < 2h = 100, < 6h = 80, < 12h = 60, < 24h = 40, > 24h = 20
    const responseHours = metrics.avgResponseHours || 24;
    let responseScore;
    if (responseHours <= 2) responseScore = 100;
    else if (responseHours <= 6) responseScore = 80;
    else if (responseHours <= 12) responseScore = 60;
    else if (responseHours <= 24) responseScore = 40;
    else responseScore = 20;

    // Calcular score final ponderado
    const finalScore = Math.round(
      pubScore * WEIGHTS.VALIDATED_PUBLICATIONS +
      endorseScore * WEIGHTS.FACULTY_ENDORSEMENTS +
      completenessScore * WEIGHTS.PROFILE_COMPLETENESS +
      ratingScore * WEIGHTS.EVALUATION_RATING +
      responseScore * WEIGHTS.RESPONSE_TIME
    );

    // Actualizar en la base de datos
    await User.findByIdAndUpdate(userId, {
      socialScore: finalScore,
      lastSocialScoreUpdate: new Date()
    });

    return finalScore;

  } catch (error) {
    console.error('Error calculando socialScore:', error);
    return 0;
  }
}

/**
 * Recalcular socialScore para todos los usuarios verificados
 * Ejecutar como cron job diario
 */
async function recalculateAllScores() {
  try {
    const verifiedUsers = await User.find({ profileStatus: 'verified' }).select('_id');
    
    let updated = 0;
    for (const user of verifiedUsers) {
      await calculateSocialScore(user._id);
      updated++;
    }

    console.log(`✅ SocialScore recalculado para ${updated} usuarios verificados`);
    return updated;
  } catch (error) {
    console.error('Error recalculando scores:', error);
    return 0;
  }
}

/**
 * Incrementar métricas específicas
 */
async function incrementMetric(userId, metric, amount = 1) {
  try {
    const updateField = `socialMetrics.${metric}`;
    await User.findByIdAndUpdate(userId, {
      $inc: { [updateField]: amount }
    });
    
    // Recalcular score
    return await calculateSocialScore(userId);
  } catch (error) {
    console.error(`Error incrementando métrica ${metric}:`, error);
    return 0;
  }
}

module.exports = {
  calculateSocialScore,
  recalculateAllScores,
  incrementMetric,
  WEIGHTS
};
