const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const initDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed admin
    const adminExists = await User.findOne({ email: 'admin@primetrade.ai' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await User.create({
        name: 'Admin User',
        email: 'admin@primetrade.ai',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Database initialized: Admin user created');
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn(`If you are running locally without Docker, ensure MongoDB is installed and running on port 27017!`);
    // process.exit(1); // Don't exit completely so we don't crash loop if testing
  }
};

module.exports = { initDb };
