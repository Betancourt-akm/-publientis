const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactionDetails,
  getAllTransactions,
  deleteTransaction
} = require('../controller/payment/transactionController');

// POST para crear una transacción
router.post('/', createTransaction);

// GET para obtener todas las transacciones (reservas)
router.get('/', getAllTransactions);

// GET para obtener detalles de una transacción por referencia
router.get('/:reference', getTransactionDetails);

// DELETE para eliminar una transacción (reserva) por ID
router.delete('/:id', deleteTransaction);

module.exports = router;
