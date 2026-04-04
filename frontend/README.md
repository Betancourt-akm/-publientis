# Getting Started with Create React App
// src/pages/Cart.js

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import displayINRCurrency from '../helpers/displayCurrency';
import { MdDelete } from 'react-icons/md';
import './Cart.css';
import { removeFromCart } from '../store/cartSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SummaryApi from '../common'; // Asegúrate de importar correctamente

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cartItems);

  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerLastName, setBuyerLastName] = useState('');
  const [docType, setDocType] = useState('CC');
  const [docNumber, setDocNumber] = useState('');

  // Estado para controlar si el script de ePayco está cargado
  const [ePaycoLoaded, setEPaycoLoaded] = useState(false);

  // Verificar si ePayco está disponible en window
  useEffect(() => {
    if (window.ePayco) {
      setEPaycoLoaded(true);
    } else {
      console.error('ePayco no está disponible en window.');
    }
  }, []);

  // Calcular el total del carrito
  const calculateTotal = () => {
    let total = 0;
    cartItems.forEach((item) => {
      if (
        item &&
        item.reservationDetails &&
        typeof item.reservationDetails.totalPrice === 'number'
      ) {
        total += item.reservationDetails.totalPrice;
      }
    });
    return total;
  };

  const totalAmount = calculateTotal();

  // Calcular el 10% del totalAmount para el pago y redondear al entero más cercano
  const paymentAmount = Math.round(totalAmount * 0.10);

  // Función para eliminar un producto del carrito
  const handleRemoveFromCart = (productId) => {
    dispatch(removeFromCart({ productId }));
  };

  // Función para verificar si es un ObjectId válido
  const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Función para manejar el pago con ePayco
  const handlePayment = async (e) => {
    e.preventDefault();

    // Verificar si el script de ePayco está cargado
    if (!ePaycoLoaded) {
      alert('El sistema de pagos aún se está cargando. Por favor, espera un momento e inténtalo de nuevo.');
      return;
    }

    // Validaciones básicas
    if (!buyerEmail || !buyerName || !buyerLastName || !docType || !docNumber) {
      alert('Por favor, completa todos los campos del comprador.');
      return;
    }

    // Validar los productId y las fechas
    for (const item of cartItems) {
      if (!isValidObjectId(item.productId)) {
        alert(`El productId ${item.productId} no es válido. Por favor, elimina este producto del carrito.`);
        return;
      }

      const startDate = new Date(item.reservationDetails.startDate);
      const endDate = new Date(item.reservationDetails.endDate);

      if (endDate <= startDate) {
        alert(`La fecha de fin debe ser posterior a la fecha de inicio para el producto con ID: ${item.productId}`);
        return;
      }
    }

    try {
      // Preparar los datos del pago
      const paymentData = {
        amount: paymentAmount.toString(), // '17900'
        currency: 'COP',
        buyerEmail,
        buyerName,
        buyerLastName,
        docType,
        docNumber,
        reservationDetails: cartItems.map((item) => ({
          productId: item.productId,
          city: item.reservationDetails.city,
          planType: item.reservationDetails.planType,
          planOption: item.reservationDetails.planOption,
          startDate: item.reservationDetails.startDate,
          startTime: item.reservationDetails.startTime,
          endDate: item.reservationDetails.endDate,
          endTime: item.reservationDetails.endTime,
          additionalProducts: item.reservationDetails.additionalProducts,
          totalPrice: item.reservationDetails.totalPrice,
        })),
      };

      // Log para verificar los datos enviados
      console.log('Datos de pago que se enviarán al backend:', paymentData);

      // Enviar la solicitud al backend para obtener los datos de configuración de ePayco
      const response = await axios.post(
        SummaryApi.processPayment.url, // Usar SummaryApi correctamente configurado
        paymentData,
        { withCredentials: true } // Asegura que las cookies se envíen si es necesario
      );

      // Log para verificar la respuesta del backend
      console.log('Respuesta del backend:', response.data);

      // Manejar la respuesta del pago
      if (response.data.paymentData) {
        // Log para verificar los datos recibidos
        console.log('Datos de configuración de ePayco recibidos:', response.data.paymentData);

        // Configurar ePayco Checkout
        if (window.ePayco && window.ePayco.checkout) {
          const handler = window.ePayco.checkout.configure({
            key: response.data.paymentData.key,
            test: response.data.paymentData.test,
            // Puedes agregar más opciones de configuración si es necesario
          });

          // Abrir el checkout pasando los paymentData
          handler.open(response.data.paymentData);
          console.log('Checkout de ePayco abierto correctamente.');
        } else {
          console.error('ePayco no está definido en el objeto window.');
          alert('Error al iniciar el sistema de pago. Por favor, intenta de nuevo más tarde.');
        }
      } else {
        // Manejar errores o estados inesperados
        console.error('Error en el pago:', response.data);
        const errorMessage = response.data.error || 'Error desconocido';
        alert(`Hubo un error al procesar tu pago: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error al procesar el pago:', error.response || error);

      // Verificar si hay una respuesta del servidor
      if (error.response) {
        console.log('Datos de error de la respuesta:', error.response.data);
        const errorMessage = error.response.data.error || error.response.data.message || 'Error desconocido';
        alert(`Hubo un error al procesar tu pago: ${errorMessage}`);
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.log('No se recibió respuesta del servidor:', error.request);
        alert('No se recibió respuesta del servidor. Por favor, intenta de nuevo más tarde.');
      } else {
        // Algo sucedió al configurar la solicitud
        console.log('Error al configurar la solicitud:', error.message);
        alert(`Hubo un error al procesar tu pago: ${error.message}`);
      }
    }
  };

  return (
    <div className="uniqueCart-container">
      {!cartItems || cartItems.length === 0 ? (
        <div className="uniqueCart-emptyContainer">
          <p className="uniqueCart-emptyMessage">
            No hay motos en la reserva.
          </p>
        </div>
      ) : (
        <div className="uniqueCart-content">
          {/* Lista de productos */}
          <div className="uniqueCart-productList">
            {cartItems.map((item, index) => (
              <div key={index} className="uniqueCart-productCard">
                <div className="uniqueCart-productImage">
                  <img
                    src={
                      item.reservationDetails.productImage ||
                      'ruta/por/defecto.jpg'
                    }
                    alt={
                      item.reservationDetails.productName || 'Producto'
                    }
                    className="uniqueCart-productImg"
                  />
                  <div
                    className="uniqueCart-deleteButton"
                    onClick={() => handleRemoveFromCart(item.productId)}
                  >
                    <MdDelete />
                  </div>
                </div>
                <div className="uniqueCart-details">
                  <h2 className="uniqueCart-name">
                    {item.reservationDetails.productName || 'Producto'}
                  </h2>
                  <p className="uniqueCart-category">
                    {item.reservationDetails.category ||
                      'Categoría desconocida'}
                  </p>
                  {/* Mostrar los detalles de la reserva */}
                  <div className="uniqueCart-reservationDetails">
                    <p>
                      <strong>Ciudad:</strong>{' '}
                      {item.reservationDetails.city || 'No especificado'}
                    </p>
                    <p>
                      <strong>Plan:</strong>{' '}
                      {item.reservationDetails.planType || 'No especificado'}
                    </p>
                    <p>
                      <strong>Opción del Plan:</strong>{' '}
                      {item.reservationDetails.planOption ||
                        'No especificado'}
                    </p>
                    <p>
                      <strong>Fecha de Inicio:</strong>{' '}
                      {item.reservationDetails.startDate ||
                        'No especificado'}
                    </p>
                    <p>
                      <strong>Hora de Inicio:</strong>{' '}
                      {item.reservationDetails.startTime ||
                        'No especificado'}
                    </p>
                    <p>
                      <strong>Fecha de Fin:</strong>{' '}
                      {item.reservationDetails.endDate ||
                        'No especificado'}
                    </p>
                    <p>
                      <strong>Hora de Fin:</strong>{' '}
                      {item.reservationDetails.endTime ||
                        'No especificado'}
                    </p>
                    <p>
                      <strong>Productos Adicionales:</strong>{' '}
                      {item.reservationDetails.additionalProducts?.join(
                        ', '
                      ) || 'Ninguno'}
                    </p>
                  </div>
                  <div className="uniqueCart-price">
                    <p className="uniqueCart-totalPrice">
                      Total:{' '}
                      {displayINRCurrency(
                        item.reservationDetails.totalPrice || 0
                      )}{' '}
                      COP
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mostrar el total general y el 10% a pagar */}
          <div className="uniqueCart-summary">
            <h3 className="uniqueCart-totalAmount">
              Total: {displayINRCurrency(totalAmount)} COP
            </h3>
            <h3 className="uniqueCart-paymentAmount">
              Adelanto (10%): {displayINRCurrency(paymentAmount)} COP
            </h3>
          </div>

          {/* Formulario de pago */}
          <div className="uniqueCart-paymentForm">
            <h2>Pagar con ePayco</h2>
            <form onSubmit={handlePayment}>
              <div className="uniqueCart-formGroup">
                <label>Nombre:</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => {
                    setBuyerName(e.target.value);
                    console.log('buyerName:', e.target.value);
                  }}
                  required
                />
              </div>
              <div className="uniqueCart-formGroup">
                <label>Apellido:</label>
                <input
                  type="text"
                  value={buyerLastName}
                  onChange={(e) => {
                    setBuyerLastName(e.target.value);
                    console.log('buyerLastName:', e.target.value);
                  }}
                  required
                />
              </div>
              <div className="uniqueCart-formGroup">
                <label>Correo electrónico:</label>
                <input
                  type="email"
                  value={buyerEmail}
                  onChange={(e) => {
                    setBuyerEmail(e.target.value);
                    console.log('buyerEmail:', e.target.value);
                  }}
                  required
                />
              </div>
              <div className="uniqueCart-formGroup">
                <label>Tipo de documento:</label>
                <select
                  value={docType}
                  onChange={(e) => {
                    setDocType(e.target.value);
                    console.log('docType:', e.target.value);
                  }}
                  required
                >
                  <option value="CC">Cédula de ciudadanía</option>
                  <option value="CE">Cédula de extranjería</option>
                  <option value="TI">Tarjeta de identidad</option>
                  <option value="PPN">Pasaporte</option>
                </select>
              </div>
              <div className="uniqueCart-formGroup">
                <label>Número de documento:</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => {
                    setDocNumber(e.target.value);
                    console.log('docNumber:', e.target.value);
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                className="uniqueCart-paymentButton"
              >
                Pagar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;

























// /controllers/paymentController.js

const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Reservation = require('../models/Reservation');

// Función para formatear el monto como entero
function formatAmount(amount) {
  return Number(amount).toString(); // Convierte a string sin decimales
}

exports.processPayment = async (req, res) => {
  console.log('Datos recibidos en el backend:', req.body); // Log de depuración

  const {
    amount,
    currency,
    buyerEmail,
    buyerName,
    buyerLastName,
    docType,
    docNumber,
    reservationDetails,
  } = req.body;

  // Validar los campos necesarios
  if (
    !amount ||
    !currency ||
    !buyerEmail ||
    !buyerName ||
    !buyerLastName ||
    !docType ||
    !docNumber ||
    !reservationDetails
  ) {
    console.log('Faltan campos requeridos.');
    return res.status(400).json({ error: 'Faltan campos requeridos.' });
  }

  // Validar cada productId y fechas
  for (const item of reservationDetails) {
    if (!mongoose.Types.ObjectId.isValid(item.productId)) {
      console.log(`productId inválido: ${item.productId}`);
      return res.status(400).json({ error: `productId inválido: ${item.productId}` });
    }

    const startDate = new Date(item.startDate);
    const endDate = new Date(item.endDate);

    if (endDate <= startDate) {
      console.log(`endDate (${endDate}) es anterior o igual a startDate (${startDate}) para productId: ${item.productId}`);
      return res.status(400).json({ error: `La fecha de fin debe ser posterior a la fecha de inicio para el producto con ID: ${item.productId}` });
    }
  }

  // Generar un código de referencia único
  const referenceCode = uuidv4();

  // Crear una nueva transacción en la base de datos
  let newPayment;
  try {
    newPayment = new Payment({
      referenceCode, // Añadido
      docNumber,
      docType,
      buyerLastName,
      buyerName,
      amount: Number(amount), // Almacenar como entero
      currency,
      buyerEmail,
      reservationDetails,
    });

    await newPayment.save();
    console.log('Transacción guardada:', newPayment); // Log de depuración
  } catch (error) {
    console.error('Error al crear la transacción:', error);
    // Verificar si el error es de validación de Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages.join('. ') });
    }
    return res.status(500).json({ error: 'Error interno del servidor al crear la transacción.' });
  }

  // Obtener las variables de entorno necesarias
  const publicKey = process.env.EPAYCO_PUBLIC_KEY;
  const frontendDomain = process.env.FRONTEND_DOMAIN;
  const backendDomain = process.env.BACKEND_DOMAIN;

  // Verificar si las variables de entorno críticas están definidas
  if (!publicKey || !frontendDomain || !backendDomain) {
    console.error('Variables de entorno de ePayco no definidas correctamente.');
    return res.status(500).json({ error: 'Configuración de pago incorrecta.' });
  }

  // Datos para configurar el checkout onpage de ePayco
  const paymentData = {
    key: publicKey,
    test: true, // Añadir este parámetro
    amount: formatAmount(amount), // '17900'
    tax_base: '0',
    tax: '0',
    currency,
    invoice: referenceCode,
    name: `Compra de ${formatAmount(amount)} ${currency} en FourRent`,
    description: `Compra de ${formatAmount(amount)} ${currency} en FourRent`,
    country: 'CO',
    lang: 'es',
    external: false, // Cambiado a booleano
    response: `${frontendDomain}/payment-response`,
    confirmation: `${backendDomain}/api/epayco/webhook`,
    name_billing: buyerName,
    address_billing: 'Dirección de facturación', // Considera obtener esto del usuario
    type_doc_billing: docType,
    mobilephone_billing: '0000000000', // Considera obtener esto del usuario
    number_doc_billing: docNumber,
    email_billing: buyerEmail,
    methodsDisable: ['SP'], // Por ejemplo, deshabilitar pagos en efectivo
  };

  console.log('paymentData preparado:', paymentData); // Log de depuración

  try {
    // Enviar el objeto paymentData al frontend
    res.status(200).json({ paymentData });
  } catch (error) {
    console.error('Error al preparar los datos de pago:', error);
    res.status(500).json({ error: 'Error al preparar los datos de pago.' });
  }
};

exports.handleWebhook = async (req, res) => {
  const notification = req.body;
  console.log('Webhook recibido:', notification); // Log de depuración

  // Obtener las variables de entorno necesarias
  const pKey = process.env.EPAYCO_PRIVATE_KEY;
  const pCustIdCliente = process.env.EPAYCO_CUST_ID_CLIENTE;

  if (!pKey || !pCustIdCliente) {
    console.error('Variables de entorno de ePayco no definidas correctamente.');
    return res.status(500).send('Configuración de pago incorrecta.');
  }

  // Verificar la firma de la notificación
  const signature = notification.x_signature;
  const refPayco = notification.x_ref_payco;
  const transactionId = notification.x_transaction_id;
  const amount = notification.x_amount;
  const currency = notification.x_currency_code;

  // Generar el string para la firma según las especificaciones de ePayco
  const signatureString = `${pCustIdCliente}^${pKey}^${refPayco}^${transactionId}^${amount}^${currency}`;
  const expectedSignature = crypto
    .createHash('sha256')
    .update(signatureString)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.warn('Firma inválida en la notificación de ePayco.');
    return res.status(400).send('Firma inválida');
  }

  const referenceCode = notification.x_id_invoice; // Este es el código de referencia que generamos
  const transactionStatus = notification.x_response;

  try {
    // Actualizar el estado de la transacción en la base de datos
    const payment = await Payment.findOne({ referenceCode });

    if (payment) {
      payment.status = transactionStatus;
      await payment.save();
      console.log(
        `Transacción ${referenceCode} actualizada a ${payment.status}`
      );

      if (payment.status === 'Aceptada') {
        // Crear las reservas si aún no se han creado
        const existingReservations = await Reservation.find({
          referenceCode,
        });

        if (existingReservations.length === 0) {
          const reservationDetailsArray = payment.reservationDetails;

          for (const details of reservationDetailsArray) {
            const newReservation = new Reservation({
              referenceCode: payment.referenceCode,
              productId: details.productId,
              city: details.city,
              planType: details.planType,
              planOption: details.planOption,
              startDate: details.startDate,
              startTime: details.startTime,
              endDate: details.endDate,
              endTime: details.endTime,
              additionalProducts: details.additionalProducts,
              totalPrice: details.totalPrice,
              // Otros campos adicionales que puedas necesitar
            });

            await newReservation.save();
          }

          console.log(
            `Reservas creadas para la transacción ${payment.referenceCode}`
          );
        }
      }
    } else {
      console.warn(`Transacción con referencia ${referenceCode} no encontrada.`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error al procesar el webhook:', error);
    res.status(500).send('Error interno del servidor.');
  }
};

// Ruta para confirmar el estado de una transacción (para el frontend)
exports.confirmPayment = async (req, res) => {
  const { referenceCode } = req.query;
  console.log('ConfirmPayment solicitado para referenceCode:', referenceCode); // Log de depuración

  try {
    const payment = await Payment.findOne({ referenceCode });

    if (!payment) {
      return res
        .status(404)
        .json({ status: 'error', message: 'Transacción no encontrada.' });
    }

    // Determinar el estado del pago
    if (payment.status === 'Aceptada') {
      return res
        .status(200)
        .json({ status: 'success', message: 'Pago aprobado.' });
    } else if (payment.status === 'Rechazada') {
      return res
        .status(200)
        .json({ status: 'failure', message: 'Pago rechazado.' });
    } else {
      return res
        .status(200)
        .json({ status: 'pending', message: 'Pago en proceso.' });
    }
  } catch (error) {
    console.error('Error al confirmar el pago:', error);
    return res
      .status(500)
      .json({ status: 'error', message: 'Error interno del servidor.' });
  }
};