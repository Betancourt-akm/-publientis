const mongoose = require("mongoose");
const PaymentSchema = new mongoose.Schema({
  referenceCode: { type: String, required: true },
  paypalOrderId: { type: String, default: null },
  docType: String,
  docNumber: String,
  buyerName: String,
  buyerLastName: String,
  buyerEmail: String,
  amount: Number,
  currency: String,
  reservationDetails: Array,
  status: { type: String, default: "pending" },
});
module.exports = mongoose.model("Payment", PaymentSchema);
