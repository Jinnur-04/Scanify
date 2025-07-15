import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Staff from '../model/Staff.js';

dotenv.config();
const runMigration = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    const staffList = await Staff.find();
    let updatedCount = 0;

    for (const staff of staffList) {
      let needsUpdate = false;

if (!staff.profileImageUrl) {
  staff.profileImageUrl = '';
  needsUpdate = true;
}

if (!staff.imagePublicId) {
  staff.imagePublicId = '';
  needsUpdate = true;
}


      if (needsUpdate) {
        await staff.save({ validateBeforeSave: false }); // 👈 disables enum validation
        updatedCount++;
      }
    }

    console.log(`✅ Migration complete. ${updatedCount} staff documents updated.`);
    process.exit(0);

  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

runMigration();
