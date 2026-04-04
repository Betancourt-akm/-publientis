const Cart = require('../models/cartModel');
const Product = require('../models/productModel');

// Obtener carrito del usuario
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user._id }).populate('items.productId');
    
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
      await cart.save();
    }
    
    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Agregar producto al carrito
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // Verificar que el producto existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }
    
    // Verificar stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente',
      });
    }
    
    // Buscar o crear carrito
    let cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }
    
    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (existingItemIndex > -1) {
      // Actualizar cantidad
      cart.items[existingItemIndex].quantity += quantity;
      
      // Verificar stock nuevamente
      if (cart.items[existingItemIndex].quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Stock insuficiente',
        });
      }
    } else {
      // Agregar nuevo item
      cart.items.push({
        productId,
        quantity,
        price: product.finalPrice,
      });
    }
    
    await cart.save();
    await cart.populate('items.productId');
    
    res.status(200).json({
      success: true,
      message: 'Producto agregado al carrito',
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Actualizar cantidad de producto
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad debe ser al menos 1',
      });
    }
    
    // Verificar stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Stock insuficiente',
      });
    }
    
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado',
      });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado en el carrito',
      });
    }
    
    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.productId');
    
    res.status(200).json({
      success: true,
      message: 'Cantidad actualizada',
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Eliminar producto del carrito
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado',
      });
    }
    
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );
    
    await cart.save();
    await cart.populate('items.productId');
    
    res.status(200).json({
      success: true,
      message: 'Producto eliminado del carrito',
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Limpiar carrito
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Carrito no encontrado',
      });
    }
    
    cart.items = [];
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Carrito vaciado',
      data: cart,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Obtener contador de items en carrito
const getCartCount = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    
    const count = cart ? cart.totalItems : 0;
    
    res.status(200).json({
      success: true,
      data: { count },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
};
