const Vendor = require('../models/vendorModel');
const Product = require('../models/productModel');

const getPendingVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find({ verificationStatus: 'PENDING' }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: vendors,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const approveVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { verificationStatus: 'APPROVED' },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendedor aprobado',
      data: vendor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectVendor = async (req, res) => {
  try {
    const { vendorId } = req.params;

    const vendor = await Vendor.findByIdAndUpdate(
      vendorId,
      { verificationStatus: 'REJECTED' },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendedor no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendedor rechazado',
      data: vendor,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getPendingVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: { $ne: null }, isActive: false })
      .populate('vendor')
      .sort({ createdAt: -1 });

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

const approveVendorProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: productId, vendor: { $ne: null } },
      { isActive: true },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Producto aprobado',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const rejectVendorProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOneAndUpdate(
      { _id: productId, vendor: { $ne: null } },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Producto marcado como no activo',
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getPendingVendors,
  approveVendor,
  rejectVendor,
  getPendingVendorProducts,
  approveVendorProduct,
  rejectVendorProduct,
};
