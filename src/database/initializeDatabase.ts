/**
 * Database Initialization and Seeding
 * Handles database setup and initial data seeding for cloud deployment
 */

import mongoose from 'mongoose';
import { seedAdminAccount, seedTestAdmin } from './seeders/adminSeeder.js';

/**
 * Initialize database with essential data
 */
export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing database...');

    // Wait for database connection to be ready
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Waiting for database connection...');
      await new Promise((resolve) => {
        mongoose.connection.once('open', resolve);
      });
    }

    console.log('✅ Database connection ready');

    // Seed admin accounts based on environment
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    if (nodeEnv === 'production') {
      // Production: Create admin from environment variables
      await seedAdminAccount();
    } else {
      // Development: Create test admin account
      await seedTestAdmin();
    }

    console.log('✅ Database initialization completed');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

/**
 * Run database initialization with retries
 */
export const initializeDatabaseWithRetries = async (maxRetries: number = 3): Promise<void> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      await initializeDatabase();
      return;
    } catch (error) {
      retries++;
      console.error(`❌ Database initialization attempt ${retries} failed:`, error);
      
      if (retries >= maxRetries) {
        console.error('❌ Max retries reached. Database initialization failed.');
        throw error;
      }
      
      // Wait before retrying
      const delay = Math.min(1000 * Math.pow(2, retries), 10000); // Exponential backoff, max 10s
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

/**
 * Verify admin account exists
 */
export const verifyAdminAccount = async (): Promise<boolean> => {
  try {
    const { User } = await import('./models/User.model.js');
    const adminCount = await User.countDocuments({ 
      role: { $in: ['admin', 'super_admin'] } 
    });
    
    if (adminCount === 0) {
      console.warn('⚠️  No admin accounts found in database');
      return false;
    }
    
    console.log(`✅ Found ${adminCount} admin account(s)`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to verify admin accounts:', error);
    return false;
  }
};

export default {
  initializeDatabase,
  initializeDatabaseWithRetries,
  verifyAdminAccount
};
