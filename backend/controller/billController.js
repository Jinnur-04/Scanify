import Bill from '../model/Bill.js';
import mongoose from 'mongoose';
import { ProductItem } from '../model/Product.js'; // Make sure this is the correct path

// Save Bill
export const saveBill = async (req, res) => {
  try {
    const { date, staff, customer, items } = req.body;

    // ✅ Validation
    if (!staff || !mongoose.Types.ObjectId.isValid(staff)) {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }

    if (!customer?.name || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing customer info or bill items' });
    }

    // ✅ Round prices
    const processedItems = items.map(item => ({
      ...item,
      finalPrice: Math.round(item.finalPrice * 100) / 100
    }));

    // ✅ Calculate total
    const total = Math.round(
      processedItems.reduce((sum, item) => sum + item.finalPrice * item.qty, 0) * 100
    ) / 100;

    // ✅ Save Bill
    const bill = new Bill({
      date: date || new Date(),
      staff,
      customer,
      items: processedItems,
      total
    });

    const saved = await bill.save();

    // ✅ Mark productItems as sold
    await Promise.all(
      processedItems.map(item =>
        ProductItem.updateOne({ barcode: item.barcode }, { sold: true })
      )
    );

    // ✅ Populate staff name
    const populated = await Bill.findById(saved._id).populate('staff', 'name');

    res.status(201).json(populated);

  } catch (err) {
    console.error('Error saving bill:', err);
    res.status(500).json({ message: 'Failed to save bill', error: err.message });
  }
};


// Get all bills
export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find()
      .populate('staff', 'name')
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bills', error: err.message });
  }
};

// Get bill by ID
export const getBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findById(id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bill', error: err.message });
  }
};

// Get Daily Revenue and Profit Chart Data
export const getDailyRevenue = async (req, res) => {
  try {
    const result = await Bill.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          totalRevenue: { $sum: "$total" },
          billCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const chartData = result.map(r => ({
      date: r._id,
      revenue: r.totalRevenue,
      profit: (r.totalRevenue * 0.3).toFixed(2)
    }));

    res.json(chartData);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching revenue data', error: err.message });
  }
};

// Get Top Selling Products (for Pie Chart)
export const getTopProducts = async (req, res) => {
  try {
    const result = await Bill.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          count: { $sum: "$items.qty" }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const labels = result.map(r => r._id);
    const data = result.map(r => r.count);

    res.json({ labels, data });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching top products', error: err.message });
  }
};
