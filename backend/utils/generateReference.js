// utils/generateReference.js
const { v4: uuidv4 } = require('uuid');

// Genera una referencia única
const generateUniqueReference = () => {
  return `ref-${uuidv4()}`;
};

module.exports = generateUniqueReference;
