import axios from 'axios';
import Bill from '../model/Bill.js';
import { ProductType, ProductItem } from '../model/Product.js';
import cloudinary from '../utils/cloudinary.js';
const API= process.env.MODEL_API

// 📤 Upload to Cloudinary
const uploadToCloudinary = async (buffer) => {
  return await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'scanify-products' },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(buffer);
  });
};

// 🔁 Generate unique 5-digit barcode
const generateUniqueBarcode = async () => {
  let barcode, exists = true;
  while (exists) {
    barcode = Math.floor(10000 + Math.random() * 90000).toString();
    const existing = await ProductItem.findOne({ barcode });
    exists = !!existing;
  }
  return barcode;
};


// 📦 Inventory Forecast Controller
export const getInventoryForecast = async (req, res) => {
  try {
    const allItems = await ProductItem.find().populate('type');

    const productMap = {};          // name → stock
    const barcodeNameMap = {};      // barcode → name

    for (const item of allItems) {
      const type = item.type;
      if (!type) continue;

      const name = type.name;
      const barcode = item.barcode;

      // Map barcode to product name
      barcodeNameMap[barcode] = name;

      // Count unsold items only
      if (!item.sold) {
        productMap[name] = (productMap[name] || 0) + 1;
      }
    }

    // Format products array for Flask
    const products = Object.keys(productMap).map(name => ({
      name,
      stock: productMap[name]
    }));

    // 📜 Fetch bills
    const bills = await Bill.find({}, { date: 1, items: 1 });

    // 🧠 Enrich with product name for Flask
    const enrichedBills = bills.map(b => ({
      date: b.date,
      items: b.items.map(i => ({
        barcode: i.barcode,
        qty: i.qty,
        name: barcodeNameMap[i.barcode] || null
      })).filter(i => i.name !== null)
    }));

    // 📤 Send to Flask
    const flaskRes = await axios.post(`${API}/api/forecast`, {
      products,
      bills: enrichedBills
    });

    res.status(200).json(flaskRes.data);

  } catch (err) {
    console.error('Inventory forecast error:', err);
    res.status(500).json({ message: 'Inventory forecast failed', error: err.message });
  }
};






// 📦 Add new ProductType with 1 unsold item
export const addProduct = async (req, res) => {
  try {
    const { name, brand, price, discount, category, unit } = req.body;
    let imageUrl = '', imagePublicId = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const productType = new ProductType({
      name, brand, price, discount, category, unit, imageUrl, imagePublicId
    });

    const savedType = await productType.save();
    const barcode = await generateUniqueBarcode();

    const productItem = new ProductItem({ barcode, type: savedType._id });
    await productItem.save();

    res.status(201).json({
      message: '✅ Product added',
      productType: savedType,
      barcode: productItem.barcode
    });
  } catch (err) {
    console.error('❌ Error adding product:', err);
    res.status(500).json({ message: 'Error adding product', error: err.message });
  }
};

// ➕ Add new barcode to existing ProductType
export const addProductItem = async (req, res) => {
  try {
    const { typeId } = req.body;
    const barcode = await generateUniqueBarcode();

    const newItem = new ProductItem({ type: typeId, barcode });
    await newItem.save();

    res.status(201).json({ message: 'Barcode added', barcode });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add barcode', error: err.message });
  }
};

// 🔍 Get product details by barcode (unsold only)
export const getProductByBarcode = async (req, res) => {
  try {
    const item = await ProductItem.findOne({ barcode: req.params.barcode, sold: isReturn ? true : false }).populate('type');
    if (!item) return res.status(404).json({ message: 'Product not found or already sold' });

    res.json(item.type);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product by barcode', error: err.message });
  }
};

// 🔁 Update ProductType
export const updateProduct = async (req, res) => {
  try {
    const updateData = req.body;
    const existing = await ProductType.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    if (req.file) {
      if (existing.imagePublicId) {
        await cloudinary.uploader.destroy(existing.imagePublicId);
      }
      const result = await uploadToCloudinary(req.file.buffer);
      updateData.imageUrl = result.secure_url;
      updateData.imagePublicId = result.public_id;
    }

    const updated = await ProductType.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('❌ Update error:', err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
};

// ❌ Delete ProductType + barcodes + image
export const deleteProduct = async (req, res) => {
  try {
    const type = await ProductType.findById(req.params.id);
    if (!type) return res.status(404).json({ message: 'Product not found' });

    if (type.imagePublicId) {
      await cloudinary.uploader.destroy(type.imagePublicId);
    }

    await ProductItem.deleteMany({ type: type._id });
    await ProductType.findByIdAndDelete(type._id);

    res.json({ message: 'Product and barcodes deleted' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};

// 📋 Get all products with at least one unsold barcode
export const getAllProducts = async (req, res) => {
  try {
    const types = await ProductType.find().sort({ createdAt: -1 });

    const products = await Promise.all(
      types.map(async (type) => {
        const items = await ProductItem.find({ type: type._id, sold: false });
        if (items.length === 0) return null;

        return {
          ...type.toObject(),
          barcodes: items.map(item => item.barcode)
        };
      })
    );

    res.json(products.filter(p => p !== null));
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// 🔍 Get product by ID with unsold barcodes only
export const getProductById = async (req, res) => {
  try {
    const type = await ProductType.findById(req.params.id);
    if (!type) return res.status(404).json({ message: 'Product not found' });

    const items = await ProductItem.find({ type: type._id, sold: false });
    if (items.length === 0) return res.status(404).json({ message: 'No available stock for this product' });

    res.json({
      ...type.toObject(),
      barcodes: items.map(item => item.barcode)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};

// 📉 Low Stock Alert (Top 5 with unsold items only)
export const getLowStockAlert = async (req, res) => {
  try {
    const types = await ProductType.find();
    const stockMap = new Map();

    for (const type of types) {
      const unsoldCount = await ProductItem.countDocuments({ type: type._id, sold: false });

      if (unsoldCount > 0) {
        const name = type.name;

        // Accumulate stock count by product name
        if (stockMap.has(name)) {
          stockMap.set(name, stockMap.get(name) + unsoldCount);
        } else {
          stockMap.set(name, unsoldCount);
        }
      }
    }

    // Convert to array and sort
    const result = Array.from(stockMap, ([name, stock]) => ({ name, stock }));
    result.sort((a, b) => a.stock - b.stock);
    const top5 = result.slice(0, 5);

    res.json({
      labels: top5.map(p => p.name),
      data: top5.map(p => p.stock)
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching low stock data', error: err.message });
  }
};

