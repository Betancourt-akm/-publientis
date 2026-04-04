/**
 * Servicio de Chatbot con IA
 * Integra Google Gemini (gratis) para responder preguntas automáticamente
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/productModel');

class AIChatbotService {
  constructor() {
    // Inicializar Gemini si hay API key
    if (process.env.GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      this.enabled = true;
      console.log('🤖 Bot de IA inicializado con Google Gemini');
    } else {
      this.enabled = false;
      console.warn('⚠️ GEMINI_API_KEY no encontrada. Bot de IA deshabilitado.');
    }

    // Contexto del e-commerce
    this.systemContext = `
Eres un asistente virtual de FreshFace, un e-commerce de productos de belleza y cuidado personal.

INFORMACIÓN DE LA TIENDA:
- Nombre: FreshFace
- Productos: Cosméticos, skincare, maquillaje, fragancias
- Envío gratis en compras superiores a $100,000 COP
- Entrega: 2-5 días hábiles
- Garantía: 30 días de satisfacción
- Métodos de pago: Tarjeta, PayPal, transferencia
- Horario de atención: Lun-Vie 8am-6pm, Sáb 9am-2pm

TU PERSONALIDAD:
- Amable y profesional
- Conocedor de productos de belleza
- Ayudas a los clientes a encontrar productos
- Recomiendas basándote en necesidades
- Siempre positivo y servicial

QUÉ PUEDES HACER:
✅ Recomendar productos
✅ Explicar características de productos
✅ Informar sobre envíos y pagos
✅ Responder dudas sobre pedidos
✅ Ayudar con el proceso de compra
✅ Dar tips de belleza y skincare

QUÉ NO PUEDES HACER:
❌ Procesar pagos (di que deben hacerlo en el checkout)
❌ Acceder a información de cuentas (di que contacten a soporte)
❌ Modificar pedidos (di que te conectarán con un agente)
❌ Dar información médica (recomienda consultar dermatólogo)

CUÁNDO PEDIR AYUDA HUMANA:
Si el cliente necesita:
- Cancelar/modificar un pedido
- Problema con un pago
- Reclamo o queja seria
- Información de su cuenta

Responde: "Entiendo tu situación. Déjame conectarte con un agente humano que podrá ayudarte mejor con esto."

FORMATO DE RESPUESTAS:
- Respuestas cortas y directas (máximo 3 párrafos)
- Usa emojis ocasionalmente 💄✨
- Sé conversacional pero profesional
- Haz preguntas para entender mejor las necesidades
`;
  }

  /**
   * Verificar si debe responder el bot o esperar humano
   */
  shouldBotRespond(message, chatContext = {}) {
    // No responder si hay admin asignado y activo
    if (chatContext.assignedTo) {
      return false;
    }

    // Palabras clave que requieren humano
    const humanKeywords = [
      'problema', 'error', 'queja', 'reclamo', 'cancelar',
      'devolver', 'reembolso', 'modificar pedido', 'hablar con alguien',
      'agente', 'persona real', 'gerente', 'supervisor'
    ];

    const messageLC = message.toLowerCase();
    const needsHuman = humanKeywords.some(keyword => messageLC.includes(keyword));

    if (needsHuman) {
      return 'needs_human'; // Señal especial
    }

    return true;
  }

  /**
   * Obtener productos relevantes para contexto
   */
  async getRelevantProducts(query, limit = 3) {
    try {
      // Búsqueda simple por nombre/descripción
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ],
        stock: { $gt: 0 }
      })
      .limit(limit)
      .select('name price finalPrice discount category brand images')
      .lean();

      return products;
    } catch (error) {
      console.error('Error buscando productos:', error);
      return [];
    }
  }

  /**
   * Obtener contexto dinámico basado en tiempo
   */
  getDynamicContext() {
    const now = new Date();
    const hora = now.getHours();
    const dia = now.getDay(); // 0 = Domingo, 6 = Sábado
    const mes = now.getMonth(); // 0 = Enero, 11 = Diciembre
    const diaDelMes = now.getDate();

    let contexto = '\n\n📅 CONTEXTO ACTUAL:\n';

    // 🕐 Contexto de hora del día
    if (hora >= 5 && hora < 12) {
      contexto += '- Hora: Buenos días ☀️ Es de mañana (saluda con energía y positividad)\n';
    } else if (hora >= 12 && hora < 18) {
      contexto += '- Hora: Buenas tardes 🌤️ Es de tarde (sé cálido y amable)\n';
    } else if (hora >= 18 && hora < 22) {
      contexto += '- Hora: Buenas noches 🌙 Es de noche (sé relajado y acogedor)\n';
    } else {
      contexto += '- Hora: Es muy tarde 🌃 (sé breve, el cliente quiere rapidez)\n';
    }

    // 📆 Contexto de día de la semana
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    contexto += `- Día: ${dias[dia]} `;
    
    if (dia === 0) {
      contexto += '🎉 (Fin de semana - menciona que pueden relajarse con sus productos)\n';
    } else if (dia === 6) {
      contexto += '🛍️ (Sábado - día de compras, anima a explorar productos)\n';
    } else if (dia === 1) {
      contexto += '💪 (Lunes - motiva y energiza, nuevo comienzo de semana)\n';
    } else if (dia === 5) {
      contexto += '🎊 (Viernes - celebra el fin de semana cerca)\n';
    } else {
      contexto += '(Mitad de semana - ofrece productos para recargar energías)\n';
    }

    // 🎄 Contexto de temporada y fechas especiales
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    contexto += `- Mes: ${meses[mes]} `;

    // Eventos especiales
    if (mes === 1 && diaDelMes <= 14) {
      contexto += '💝 Temporada de San Valentín - sugiere productos románticos o para regalar\n';
    } else if (mes === 4 && diaDelMes <= 15) {
      contexto += '👩 Día de la Madre cerca - recomienda sets de regalo especiales\n';
    } else if (mes === 5 && diaDelMes <= 20) {
      contexto += '👨 Día del Padre cerca - sugiere fragancias masculinas\n';
    } else if (mes === 11 || (mes === 0 && diaDelMes <= 10)) {
      contexto += '🎄 Temporada Navideña - sets de regalo, productos festivos\n';
    } else if (mes === 10) {
      contexto += '🛍️ Black Friday/Cyber Monday - menciona ofertas especiales\n';
    } else if ([5, 6, 7].includes(mes)) {
      contexto += '☀️ Verano - enfoca en protección solar, hidratación intensa\n';
    } else if ([11, 0, 1].includes(mes)) {
      contexto += '❄️ Invierno - productos humectantes, cuidado labios, manos\n';
    } else {
      contexto += '🌸 Temporada regular\n';
    }

    // 🎁 Promociones según horario
    if (hora >= 9 && hora <= 12) {
      contexto += '- PROMOCIÓN ACTIVA: Descuentos matutinos (menciona si preguntan por ofertas)\n';
    } else if (hora >= 20 && hora <= 23) {
      contexto += '- PROMOCIÓN ACTIVA: Flash sale nocturno (menciona si preguntan por ofertas)\n';
    }

    return contexto;
  }

  /**
   * Analizar el tono/sentimiento del mensaje del usuario
   */
  analyzeSentiment(message) {
    const messageLC = message.toLowerCase();
    
    // Palabras positivas
    const positiveWords = ['gracias', 'genial', 'perfecto', 'excelente', 'encanta', 'feliz', 'contento', 'bueno', 'super'];
    // Palabras negativas
    const negativeWords = ['mal', 'problema', 'terrible', 'pésimo', 'enojado', 'molesto', 'frustrado', 'horrible'];
    // Palabras urgentes
    const urgentWords = ['urgente', 'rápido', 'ya', 'necesito ahora', 'inmediato', 'apurado'];
    
    let sentiment = 'neutral';
    
    if (positiveWords.some(word => messageLC.includes(word))) {
      sentiment = 'positivo';
    } else if (negativeWords.some(word => messageLC.includes(word))) {
      sentiment = 'negativo';
    } else if (urgentWords.some(word => messageLC.includes(word))) {
      sentiment = 'urgente';
    }

    return sentiment;
  }

  /**
   * Generar respuesta con IA (MEJORADA con contexto dinámico)
   */
  async generateResponse(userMessage, conversationHistory = []) {
    if (!this.enabled) {
      return {
        success: false,
        message: 'Bot de IA no está configurado'
      };
    }

    try {
      // 🕐 Obtener contexto dinámico de tiempo
      const dynamicContext = this.getDynamicContext();

      // 😊 Analizar sentimiento del usuario
      const sentiment = this.analyzeSentiment(userMessage);
      let sentimentContext = '';
      
      if (sentiment === 'positivo') {
        sentimentContext = '\n🎯 El cliente está contento - mantén la energía positiva y ofrece más productos\n';
      } else if (sentiment === 'negativo') {
        sentimentContext = '\n⚠️ El cliente está molesto - sé empático, ofrece soluciones, considera transferir a humano\n';
      } else if (sentiment === 'urgente') {
        sentimentContext = '\n⏰ El cliente tiene prisa - sé directo, respuestas cortas, ve al grano\n';
      }

      // 🛍️ Buscar productos relevantes
      const productsContext = await this.getRelevantProducts(userMessage);
      
      let productsInfo = '';
      if (productsContext.length > 0) {
        productsInfo = '\n\n🛍️ PRODUCTOS DISPONIBLES RELEVANTES:\n';
        productsContext.forEach(p => {
          const price = p.finalPrice || p.price;
          const discount = p.discount > 0 ? ` (${p.discount}% OFF - ¡MENCIÓNALO!)` : '';
          productsInfo += `- ${p.name} - $${price.toLocaleString('es-CO')}${discount}\n  Categoría: ${p.category}\n`;
        });
      }

      // 💬 Construir historial de conversación
      let conversationText = '';
      if (conversationHistory.length > 0) {
        conversationText = '\n\n📜 HISTORIAL RECIENTE:\n';
        conversationHistory.slice(-5).forEach(msg => {
          const role = msg.senderRole === 'user' ? 'Cliente' : 'Tú';
          conversationText += `${role}: ${msg.content}\n`;
        });
      }

      // 🎯 Detectar intención del usuario
      let intentContext = '\n🎯 INTENCIÓN DETECTADA: ';
      const messageLC = userMessage.toLowerCase();
      
      if (messageLC.includes('busco') || messageLC.includes('quiero') || messageLC.includes('necesito')) {
        intentContext += 'El cliente busca un producto específico - recomienda opciones concretas\n';
      } else if (messageLC.includes('precio') || messageLC.includes('costo') || messageLC.includes('vale')) {
        intentContext += 'Pregunta por precios - sé transparente, menciona ofertas\n';
      } else if (messageLC.includes('envío') || messageLC.includes('entrega') || messageLC.includes('demora')) {
        intentContext += 'Pregunta por logística - explica tiempos y costos de envío\n';
      } else if (messageLC.includes('funciona') || messageLC.includes('cómo') || messageLC.includes('ingredientes')) {
        intentContext += 'Quiere detalles técnicos - sé específico y educativo\n';
      } else if (messageLC.includes('regalo') || messageLC.includes('cumpleaños') || messageLC.includes('aniversario')) {
        intentContext += 'Busca un regalo - sugiere sets y opciones para regalar\n';
      } else {
        intentContext += 'Consulta general - pregunta qué necesita específicamente\n';
      }

      // 📝 Prompt completo mejorado
      const prompt = `${this.systemContext}${dynamicContext}${sentimentContext}${intentContext}${productsInfo}${conversationText}

💬 MENSAJE ACTUAL DEL CLIENTE:
"${userMessage}"

📌 INSTRUCCIONES ESPECIALES:
- Adapta tu saludo según la hora del día
- Considera el contexto de temporada/día para tus sugerencias
- Responde según el sentimiento del cliente
- Si hay productos relevantes, menciónales sus mejores opciones
- Máximo 3 párrafos cortos
- Usa emojis pero no exageres

🤖 TU RESPUESTA:`;

      // Generar respuesta con Gemini
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        message: text.trim(),
        products: productsContext,
        needsHuman: this.detectNeedsHuman(text)
      };

    } catch (error) {
      console.error('Error generando respuesta de IA:', error);
      
      // Respuesta de fallback con hora del día
      const hora = new Date().getHours();
      let saludo = '¡Hola!';
      
      if (hora >= 5 && hora < 12) saludo = '¡Buenos días!';
      else if (hora >= 12 && hora < 18) saludo = '¡Buenas tardes!';
      else if (hora >= 18) saludo = '¡Buenas noches!';
      
      return {
        success: true,
        message: `${saludo} 👋 Soy el asistente virtual de FreshFace. ¿En qué puedo ayudarte hoy? Puedo responder sobre nuestros productos, envíos, pagos o cualquier consulta general.`,
        needsHuman: false
      };
    }
  }

  /**
   * Detectar si la IA sugiere contacto humano
   */
  detectNeedsHuman(aiResponse) {
    const humanPhrases = [
      'conectarte con un agente',
      'agente humano',
      'nuestro equipo de soporte',
      'contactar directamente'
    ];

    const responseLC = aiResponse.toLowerCase();
    return humanPhrases.some(phrase => responseLC.includes(phrase));
  }

  /**
   * Respuesta automática de bienvenida (con contexto dinámico)
   */
  getWelcomeMessage() {
    const hora = new Date().getHours();
    const dia = new Date().getDay();
    
    // Saludo según hora
    let saludo = '¡Hola!';
    let emoji = '👋';
    
    if (hora >= 5 && hora < 12) {
      saludo = '¡Buenos días!';
      emoji = '☀️';
    } else if (hora >= 12 && hora < 18) {
      saludo = '¡Buenas tardes!';
      emoji = '🌤️';
    } else if (hora >= 18 && hora < 22) {
      saludo = '¡Buenas noches!';
      emoji = '🌙';
    } else {
      saludo = '¡Hola!';
      emoji = '🌃';
    }

    // Mensaje extra según día
    let diaExtra = '';
    if (dia === 0) { // Domingo
      diaExtra = '\n\n🎉 ¡Feliz domingo! Perfecto para explorar productos y consentirte.';
    } else if (dia === 1) { // Lunes
      diaExtra = '\n\n💪 ¡Feliz lunes! Empieza la semana con energía y buenos productos.';
    } else if (dia === 5) { // Viernes
      diaExtra = '\n\n🎊 ¡Feliz viernes! El fin de semana está cerca.';
    } else if (dia === 6) { // Sábado
      diaExtra = '\n\n🛍️ ¡Feliz sábado! Gran día para explorar nuestro catálogo.';
    }

    return {
      success: true,
      message: `${saludo} ${emoji} Bienvenido a FreshFace.

Soy tu asistente virtual y estoy aquí para ayudarte. Puedo:

✨ Recomendarte productos perfectos para ti
💄 Explicarte características de nuestros productos
📦 Informarte sobre envíos y entregas
💳 Responder sobre métodos de pago
🎁 Ayudarte con promociones y descuentos${diaExtra}

¿En qué puedo ayudarte hoy?`,
      needsHuman: false
    };
  }

  /**
   * Mensaje cuando se necesita agente humano
   */
  getTransferMessage() {
    return {
      success: true,
      message: `Entiendo tu situación. 👤

Déjame conectarte con uno de nuestros agentes de soporte que podrá ayudarte mejor con esto.

Un momento por favor... ⏳`,
      needsHuman: true
    };
  }

  /**
   * Respuesta cuando el bot está fuera de horario
   */
  getOfflineMessage() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();

    // Verificar si es fin de semana
    const isWeekend = day === 0; // Domingo
    
    // Verificar si es fuera de horario (antes de 8am o después de 6pm)
    const isOffHours = hour < 8 || hour >= 18;

    if (isWeekend) {
      return {
        success: true,
        message: `¡Hola! 👋

Actualmente estamos fuera de nuestro horario de atención (Lun-Vie 8am-6pm, Sáb 9am-2pm).

De todas formas, puedo ayudarte con:
- Recomendaciones de productos
- Información sobre envíos y pagos
- Responder preguntas generales

Si tienes una consulta urgente, uno de nuestros agentes te responderá el próximo día hábil. ¿En qué puedo ayudarte?`,
        needsHuman: false
      };
    }

    if (isOffHours) {
      return {
        success: true,
        message: `¡Hola! 👋

Estamos fuera de nuestro horario de atención (Lun-Vie 8am-6pm, Sáb 9am-2pm).

Pero no te preocupes, puedo ayudarte con información sobre productos, envíos, pagos y consultas generales.

Para asuntos que requieran un agente humano, te responderemos en nuestro próximo horario de atención. ¿En qué puedo ayudarte?`,
        needsHuman: false
      };
    }

    return null; // Horario normal
  }
}

// Singleton
const aiChatbot = new AIChatbotService();

module.exports = aiChatbot;
