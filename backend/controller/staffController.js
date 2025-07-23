import Staff from '../model/Staff.js';
import Bill from '../model/Bill.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import cloudinary from '../utils/cloudinary.js';
import multer from 'multer';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import ResetToken from '../model/ResetToken.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const storage = multer.memoryStorage();
export const upload = multer({ storage });

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
  profileImageUrl: staff.profileImageUrl || '',
  imagePublicId: staff.imagePublicId || '',
  token,
});
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
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
          from: "staffs", 
          localField: "_id",
          foreignField: "_id",
          as: "staffInfo"
        }
      },
      {
        $unwind: {
          path: "$staffInfo",
          preserveNullAndEmptyArrays: true
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

// 📋 Get full staff profile with bill count
export const getStaffProfileWithStats = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id).select('-password');
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const billCount = await Bill.countDocuments({ staff: id });

    res.json({ 
      ...staff.toObject(), 
      billsHandled: billCount 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile', error: err.message });
  }
};

// 🔑 Change password
export const changeStaffPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    const isMatch = await bcrypt.compare(currentPassword, staff.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    if (newPassword.length < 4)
      return res.status(400).json({ message: 'New password must be at least 4 characters.' });

    staff.password = await bcrypt.hash(newPassword, 10);
    await staff.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating password', error: err.message });
  }
};




// 📸 Update profile photo
export const updateProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const staff = await Staff.findById(id);
    if (!staff) return res.status(404).json({ message: 'Staff not found' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Upload to Cloudinary
    const streamUpload = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'scanify-profiles' },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(req.file.buffer); 
      });
    };

    const result = await streamUpload();

    // Update profile fields
    staff.profileImageUrl = result.secure_url;
    staff.imagePublicId = result.public_id;
    await staff.save();

    res.json({
      message: 'Profile photo updated',
      photo: result.secure_url,
    });
  } catch (err) {
    console.error('❌ Profile photo upload error:', err);
    res.status(500).json({ message: 'Error updating profile photo', error: err.message });
  }
};


export const sendResetLink = async (req, res) => {
  const { email } = req.body;

  const staff = await Staff.findOne({ email });
  if (!staff) {
    return res.status(404).json({ message: 'No user found with this username.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Save token to DB
  await ResetToken.findOneAndDelete({ userId: staff._id });
  await ResetToken.create({
    userId: staff._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  // Send email
  const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
  from: `"Scanify Support" <${process.env.EMAIL_USER}>`,
  to: staff.email,
  subject: 'Password Reset Instructions - Scanify',
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #2c3e50;">Hello ${staff.name},</h2>
      <p>We received a request to reset the password for your Scanify account.</p>
      <p><strong>Username:</strong> ${staff.username}</p>
      <p>Please click the button below to proceed with resetting your password. This link will expire in <strong>15 minutes</strong> for security reasons.</p>
      <a href="${resetUrl}" style="
        display: inline-block;
        margin: 20px 0;
        padding: 10px 20px;
        background-color: #4e73df;
        color: #fff;
        text-decoration: none;
        border-radius: 5px;
        font-weight: bold;
      ">
        Reset Password
      </a>
      <p>If you didn’t request this change, you can safely ignore this email. No changes will be made to your account.</p>
      <p>Best regards,<br/>The Scanify Support Team</p>
    </div>
  `,
});


  res.status(200).json({ message: 'Reset link sent to your email.' });
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const tokenDoc = await ResetToken.findOne({ token: hashedToken });

  if (!tokenDoc || tokenDoc.expiresAt < Date.now()) {
    return res.status(400).json({ message: 'Token is invalid or expired.' });
  }

  const staff = await Staff.findById(tokenDoc.userId);
  if (!staff) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  staff.password = hashedPassword;
  await staff.save();

  await ResetToken.deleteOne({ token: hashedToken });

  res.status(200).json({ message: 'Password reset successful.' });
};

