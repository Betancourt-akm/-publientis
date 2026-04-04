const Vendor = require('../models/vendorModel');
const Product = require('../models/productModel');
const Order = require('../models/orderModel');

const getMyVendorProfile = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;

    const vendor = await Vendor.findOne({ userId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMySalesSummary = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const vendor = await Vendor.findOne({ userId });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado',
      });
    }

    const matchStage = {
      'items.vendorId': vendor._id,
    };

    if (req.query.paymentStatus) {
      matchStage.paymentStatus = req.query.paymentStatus;
    }

    const summary = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      { $match: { 'items.vendorId': vendor._id } },
      {
        $group: {
          _id: null,
          itemsCount: { $sum: 1 },
          unitsSold: { $sum: '$items.quantity' },
          grossSales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          vendorAmount: { $sum: '$items.vendorAmount' },
          platformAmount: { $sum: '$items.platformAmount' },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: summary[0] || {
        itemsCount: 0,
        unitsSold: 0,
        grossSales: 0,
        vendorAmount: 0,
        platformAmount: 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMySalesItems = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const vendor = await Vendor.findOne({ userId });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado',
      });
    }

    const matchStage = {
      'items.vendorId': vendor._id,
    };

    if (req.query.paymentStatus) {
      matchStage.paymentStatus = req.query.paymentStatus;
    }

    const items = await Order.aggregate([
      { $match: matchStage },
      { $unwind: '$items' },
      { $match: { 'items.vendorId': vendor._id } },
      {
        $project: {
          _id: 0,
          orderId: '$_id',
          orderNumber: '$orderNumber',
          orderStatus: '$orderStatus',
          paymentStatus: '$paymentStatus',
          paidAt: '$paidAt',
          createdAt: '$createdAt',
          item: '$items',
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 200 },
    ]);

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const registerVendor = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;

    const existing = await Vendor.findOne({ userId });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'El vendedor ya existe',
        data: existing,
      });
    }

    const name = (req.body?.name || '').trim();
    const paymentAccount = (req.body?.paymentAccount || '').trim();

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del vendedor es requerido',
      });
    }

    const vendor = await Vendor.create({
      userId,
      name,
      email: req.user?.email,
      paymentAccount: paymentAccount || null,
    });

    return res.status(201).json({
      success: true,
      message: 'Vendedor creado exitosamente',
      data: vendor,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const vendor = await Vendor.findOne({ userId: req.user?._id || req.userId });
      return res.status(200).json({
        success: true,
        message: 'El vendedor ya existe',
        data: vendor,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const vendor = await Vendor.findOne({ userId });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado',
      });
    }

    const products = await Product.find({ vendor: vendor._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const createMyProduct = async (req, res) => {
  try {
    const userId = req.user?._id || req.userId;
    const vendor = await Vendor.findOne({ userId });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado',
      });
    }

    const body = req.body || {};

    const product = new Product({
      name: body.name,
      description: body.description,
      price: body.price,
      originalPrice: body.originalPrice ?? null,
      discount: body.discount ?? 0,
      category: body.category,
      brand: body.brand,
      images: body.images,
      stock: body.stock ?? 0,
      features: body.features ?? [],
      specifications: body.specifications,
      tags: body.tags ?? [],
      isFeatured: false,
      isActive: false,
      vendor: vendor._id,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: product,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMyVendorProfile,
  registerVendor,
  getMyProducts,
  createMyProduct,
  getMySalesSummary,
  getMySalesItems,
};
