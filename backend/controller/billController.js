import axios from 'axios';
import mongoose from 'mongoose';
import Bill from '../model/Bill.js';
import Staff from '../model/Staff.js';
import PaymentMapping from '../model/PaymentMapping.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { ProductItem } from '../model/Product.js';
import puppeteer from 'puppeteer';

const API = process.env.MODEL_API;

export const getStaffPerformance = async (req, res) => {
  try {
    const aggregated = await Bill.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$staff',
          billsHandled: { $sum: 1 },
          totalProcessed: { $sum: '$total' },
          avgDiscount: {
            $avg: {
              $cond: [
                { $ne: ['$items.discount', null] },
                {
                  $toDouble: {
                    $replaceOne: {
                      input: '$items.discount',
                      find: '%',
                      replacement: ''
                    }
                  }
                },
                0
              ]
            }
          }
        }
      }
    ]);

    const staffDocs = await Staff.find({}, { _id: 1, name: 1 });
    const nameMap = new Map(staffDocs.map(staff => [staff._id.toString(), staff.name]));

    const formattedData = aggregated.map(entry => ({
      staffId: entry._id,
      staffName: nameMap.get(entry._id.toString()) || 'Unknown',
      billsHandled: entry.billsHandled,
      totalProcessed: entry.totalProcessed,
      avgDiscount: entry.avgDiscount
    }));

    const flaskURL = `${API}/api/staff`;
    const flaskResponse = await axios.post(flaskURL, formattedData);

    res.status(200).json(flaskResponse.data);
  } catch (err) {
    console.error('Error generating staff performance:', err);
    res.status(500).json({ message: 'Failed to generate staff performance', error: err.message });
  }
};

export const getBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate('staff', 'name').sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bills', error: err.message });
  }
};

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



export const saveBill = async (req, res) => {
  try {
    const { date, staff, customer, items } = req.body;

    // Basic validations
    if (!staff || !mongoose.Types.ObjectId.isValid(staff)) {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }

    if (!customer?.name || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing customer info or bill items' });
    }

    // Process each item for action (sell or return) and final price rounding
    const processedItems = items.map(item => {
      const roundedFinalPrice = Math.round(item.finalPrice * 100) / 100;
      const action = item.action || (roundedFinalPrice < 0 ? 'return' : 'sell');
      return {
        ...item,
        finalPrice: roundedFinalPrice,
        action
      };
    });

    // Calculate bill total
    const total = Math.round(
      processedItems.reduce((sum, item) => sum + item.finalPrice * item.qty, 0) * 100
    ) / 100;

    // Create bill document
    const bill = new Bill({
      date: date || new Date(),
      staff,
      customer,
      items: processedItems,
      total
    });

    const saved = await bill.save();

    // Update product 'sold' status based on action
    await Promise.all(
      processedItems.map(item => {
        console.log("Action:",item)
        if (item.action === 'sell') {
          return ProductItem.updateOne({ barcode: item.barcode }, { sold: true });
        } else if (item.action === 'return') {
          return ProductItem.updateOne({ barcode: item.barcode }, { sold: false });
        }
      })
    );

    // Populate staff for invoice
    const populated = await Bill.findById(saved._id).populate('staff', 'name');
    const actionMode = processedItems.some(item => item.action === 'return') ? 'Returning' : 'Selling';

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(populated, 'Cash', actionMode);

    // Respond with inline PDF for print view
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=invoice.pdf', // ✅ inline instead of attachment
    });
    res.send(pdfBuffer);

  } catch (err) {
    console.error('❌ Error saving bill:', err);
    res.status(500).json({ message: 'Failed to save bill', error: err.message });
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrderAndSaveBill = async (req, res) => {
  try {
    const { items, customer, staff } = req.body;

    if (!staff || !mongoose.Types.ObjectId.isValid(staff)) {
      return res.status(400).json({ message: 'Invalid staff ID' });
    }
    if (!customer?.name || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing customer info or bill items' });
    }
    console.log(items)
    const processedItems = items.map(item => {
      const roundedFinalPrice = Math.round(item.finalPrice * 100) / 100;
      return {
        ...item,
        finalPrice: roundedFinalPrice
      };
    });

    const total = Math.round(
      processedItems.reduce((sum, item) => sum + item.finalPrice * item.qty, 0) * 100
    ) / 100;

    const bill = new Bill({
      date: new Date(),
      staff,
      customer,
      items: processedItems,
      total
    });
    console.log(Math.round(total * 100))
    const savedBill = await bill.save();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { customer_name: customer.name, staff_id: staff }
    });

    await PaymentMapping.create({
      billId: savedBill._id,
      razorpayOrderId: razorpayOrder.id
    });

    res.status(200).json({
      razorpayOrder,
      billId: savedBill._id
    });

  } catch (err) {
    console.error('❌ Error creating order & saving bill:', err);
    res.status(500).json({ message: 'Order creation failed', error: err.message });
  }
};

export const verifyAndFinalizeBillPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    const mapping = await PaymentMapping.findOne({ razorpayOrderId: razorpay_order_id });
    if (!mapping) {
      return res.status(404).json({ message: 'Payment mapping not found' });
    }

    const bill = await Bill.findById(mapping.billId).populate('staff', 'name');
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    await Promise.all(
      bill.items.map(item =>
        ProductItem.updateOne({ barcode: item.barcode }, { sold: true })
      )
    );

    const pdfBuffer = await generateInvoicePDF(bill);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error('❌ Payment verification failed:', err);
    res.status(500).json({ message: 'Verification or PDF failed', error: err.message });
  }
};

const generateInvoicePDF = async (bill, paymentMode = 'Online', actionMode="Selling") => {
  const itemsHtml = bill.items.map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>${item.discount || '-'}</td>
      <td>₹${(item.finalPrice * item.qty).toFixed(2)}</td>
    </tr>`).join('');

  const html = `
    <html><head><style>
      body { font-family: sans-serif; padding: 20px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { border: 1px solid #999; padding: 8px; text-align: center; }
      .info { margin-top: 20px; }
      .summary { margin-top: 20px; text-align: right; font-size: 18px; }
    </style></head><body>
      <h2 style="text-align:center">Scanify | Customer Bill</h2>
      <h2 style="text-align:center">Scanify | ${actionMode} Invoice</h2>
      <div class="info">
        <p><strong>Customer Name:</strong> ${bill.customer.name}</p>
        <p><strong>Phone:</strong> ${bill.customer.phone || '-'}</p>
        <p><strong>Date:</strong> ${new Date(bill.date).toLocaleDateString()}</p>
        <p><strong>Payment Mode:</strong> ${paymentMode}</p>
      </div>
      <table><thead><tr><th>#</th><th>Name</th><th>Qty</th><th>Discount</th><th>Amount</th></tr></thead><tbody>
        ${itemsHtml}
        <tr><td colspan="4"><strong>Total</strong></td><td><strong>₹${bill.total.toFixed(2)}</strong></td></tr>
      </tbody></table>
      <div class="summary"><strong>Net Total:</strong> ₹${bill.total.toFixed(2)}</div>
    </body></html>`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({ format: 'A4' });
  await browser.close();

  return pdf;
};
