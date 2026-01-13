import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import CompanyCash from '../models/CompanyCash.js';
import { USER_ROLES } from '../config/constants.js';

dotenv.config();

const seedUsers = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing users (optional - comment out in production)
    await User.deleteMany({});

    // Create default admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@company.com',
      password: 'Admin@123',
      role: USER_ROLES.ADMIN,
      fullName: 'System Administrator',
      isActive: true,
    });

    console.log('✓ Admin user created:', admin.username);

    // Create sample manager user
    const manager = await User.create({
      username: 'manager1',
      email: 'manager@company.com',
      password: 'Manager@123',
      role: USER_ROLES.MANAGER,
      fullName: 'Sales Manager',
      isActive: true,
    });

    console.log('✓ Manager user created:', manager.username);

    // Create sample data entry user
    const dataEntry = await User.create({
      username: 'dataentry1',
      email: 'dataentry@company.com',
      password: 'Data@123',
      role: USER_ROLES.DATA_ENTRY,
      fullName: 'Data Entry Employee',
      isActive: true,
    });

    console.log('✓ Data entry user created:', dataEntry.username);

    // Initialize company cash
    await CompanyCash.deleteMany({});
    const companyCash = await CompanyCash.create({
      cashByProduct: {
        chips: 0,
        flavors: 0,
        pellets: 0,
        thalgy: 0,
      },
      totalCompanyCash: 0,
      overallDebit: 0,
      overallRiskFactor: 0,
      lastUpdated: new Date(),
    });

    console.log('✓ Company cash initialized');

    console.log('\n=== Seed Data Summary ===');
    console.log('Admin Credentials:');
    console.log('  Username: admin');
    console.log('  Password: Admin@123');
    console.log('\nManager Credentials:');
    console.log('  Username: manager1');
    console.log('  Password: Manager@123');
    console.log('\nData Entry Credentials:');
    console.log('  Username: dataentry1');
    console.log('  Password: Data@123');
    console.log('\n✓ Seeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedUsers();

