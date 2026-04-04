const Transaction = require('../../models/Transaction');
const User = require('../../models/userModel'); 
const generateUniqueReference = require('../../utils/generateReference');

// Controlador para crear una transacción
exports.createTransaction = async (req, res) => {
  try {
    let { 
      reference, 
      amountInCents, 
      status, 
      reservationDetails, 
      productDetails, 
      shippingInfo, 
      user 
    } = req.body;

    console.log("📥 Recibiendo datos de transacción:", {
      reference,
      amountInCents,
      status,
      user,
      productDetails: productDetails ? "presente" : "null",
      shippingInfo: shippingInfo ? "presente" : "null"
    });

    // Si no se proporciona la referencia, se genera automáticamente
    if (!reference) {
      reference = generateUniqueReference();
    }

    // Validar campos obligatorios
    if (!amountInCents || !status) {
      return res.status(400).json({
        success: false,
        message: "Los campos 'amountInCents' y 'status' son obligatorios."
      });
    }

    // Verificar si ya existe una transacción con esa referencia
    const existingTransaction = await Transaction.findOne({ reference });
    if (existingTransaction) {
      console.log("⚠️ Transacción duplicada detectada:", reference);
      console.log("ℹ️ Transacción existente ID:", existingTransaction._id);
      return res.status(409).json({
        success: false,
        message: "Ya existe una transacción con esa referencia.",
        code: "DUPLICATE_TRANSACTION",
        existingTransaction: existingTransaction._id
      });
    }

    // Preparar datos de la transacción
    const transactionData = {
      reference,
      amountInCents,
      status,
      reservationDetails: reservationDetails || [],
      productDetails: productDetails || null,
      shippingInfo: shippingInfo || null
    };

    // Solo agregar el campo 'user' si es un valor válido
    if (user && user !== null && user !== 'null' && user !== 'undefined') {
      transactionData.user = user;
    }

    console.log("💾 Intentando guardar transacción:", transactionData);

    // Crear la transacción
    const transaction = new Transaction(transactionData);
    await transaction.save();

    console.log("✅ Transacción guardada exitosamente:", transaction._id);

    res.status(201).json({
      success: true,
      message: "Transacción guardada exitosamente",
      data: transaction
    });
  } catch (error) {
    console.error("❌ Error al crear la transacción:", error);
    console.error("Stack completo:", error.stack);
    res.status(500).json({
      success: false,
      message: "Error al guardar la transacción.",
      error: error.message
    });
  }
};

// Controlador para obtener detalles de una transacción por referencia
exports.getTransactionDetails = async (req, res) => {
  try {
    const { reference } = req.params;
    const transaction = await Transaction.findOne({ reference })
      .populate("user", "name email tel");  // Populamos el campo user

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ninguna transacción con la referencia ${reference}`
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error("Error al obtener detalles de la transacción:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener detalles de la transacción.",
      error: error.message
    });
  }
};

// Controlador para obtener todas las transacciones (reservas o ventas)
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email tel") // Populamos el campo user
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error("Error al obtener las transacciones:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las transacciones.",
      error: error.message
    });
  }
};

// Controlador para eliminar una transacción por su ID
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findByIdAndDelete(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Reserva no encontrada."
      });
    }
    res.status(200).json({
      success: true,
      message: "Reserva eliminada correctamente."
    });
  } catch (error) {
    console.error("Error al eliminar la transacción:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la transacción.",
      error: error.message
    });
  }
};
