import Staff from '../model/Staff.js';
import bcrypt from 'bcryptjs';

export const initializeAdmin = async () => {
  try {
    const existingAdmin = await Staff.findOne({ username: 'admin' });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      const admin = new Staff({
        name: 'Default Admin',
        username: 'admin',
        password: hashedPassword,
        role: 'Admin',
        status: 'Active'
      });

      await admin.save();
      console.log('✅ Default admin created: username="admin", password="admin123"');
    } else {
      console.log('ℹ️ Default admin already exists.');
    }
  } catch (err) {
    console.error('❌ Error creating default admin:', err.message);
  }
};
