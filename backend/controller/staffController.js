import Staff from '../model/Staff.js';
import Bill from '../model/Bill.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Register new staff
export const createStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { name,email, role, status = 'InActive', username, password } = req.body;

    const existing = await Staff.findOne({ username });
    if (existing) return res.status(409).json({ message: 'Username already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = new Staff({ name,email, role, status, username, password: hashedPassword });
    await staff.save();

    res.status(201).json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Error creating staff', error: err.message });
  }
};

// Get all staff
export const getAllStaff = async (req, res) => {
  try {
    const staffList = await Staff.find();
    res.json(staffList);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff', error: err.message });
  }
};

// Get staff by ID
export const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid staff ID' });

    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff', error: err.message });
  }
};

// Update staff
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid staff ID' });

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updated = await Staff.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Staff not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating staff', error: err.message });
  }
};

// Delete staff
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: 'Invalid staff ID' });

    const deleted = await Staff.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Staff not found' });

    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting staff', error: err.message });
  }
};

// Staff login
export const loginStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { username, password } = req.body;

    const staff = await Staff.findOne({ username });
    if (!staff) return res.status(401).json({ message: 'Invalid username or password' });

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid username or password' });

    const token = jwt.sign(
      { id: staff._id, role: staff.role, name: staff.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      _id: staff._id,
      name: staff.name,
      username: staff.username,
      role: staff.role,
      status: staff.status,
      token,
    });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

// Forgot password (for demo only)

export const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;
    if (username==="admin"){
      res.status(401).json({ message: 'Forget Password for Admin is Not Applicable, error: err.message' });
  } 
    const staff = await Staff.findOne({ username });

    if (!staff) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User exists. You can reset password now.' });
  } catch (err) {
    res.status(500).json({ message: 'Error checking user', error: err.message });
  }
};

//Reset Password 
export const resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;

    const staff = await Staff.findOne({ username });
    if (!staff) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ message: 'Password must be at least 4 characters.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    staff.password = hashedPassword;
    await staff.save();

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (err) {
    res.status(500).json({ message: 'Password reset failed', error: err.message });
  }
};

// Staff Performance (for Bar Chart)
export const getStaffPerformance = async (req, res) => {
  try {
    const result = await Bill.aggregate([
      {
        $group: {
          _id: "$staff", // Group by staff ID
          count: { $sum: 1 } // Count bills
        }
      },
      {
        $lookup: {
          from: "staffs", // Make sure this matches the actual MongoDB collection name (usually lowercase plural)
          localField: "_id",
          foreignField: "_id",
          as: "staffInfo"
        }
      },
      {
        $unwind: {
          path: "$staffInfo",
          preserveNullAndEmptyArrays: true // Avoid breaking if a staff member was deleted
        }
      },
      {
        $project: {
          name: { $ifNull: ["$staffInfo.name", "Unknown Staff"] },
          count: 1
        }
      }
    ]);

    const labels = result.map(r => r.name);
    const data = result.map(r => r.count);

    res.json({ labels, data });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching staff performance', error: err.message });
  }
};

