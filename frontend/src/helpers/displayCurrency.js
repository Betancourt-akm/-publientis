const displayUSDCurrency = (amount) => {
  const numericValue = Number(amount);
  if (isNaN(numericValue)) {
    return '$0.00';
  }

  // Esto mostrará, por ejemplo: $10,000.00
  return numericValue.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  });
};

export default displayUSDCurrency;
