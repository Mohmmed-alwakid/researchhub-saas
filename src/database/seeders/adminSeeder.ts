/**
 * Admin Account Seeder
 * Creates initial super admin account for cloud deployment
 */

import { User } from '../models/User.model.js';
import bcrypt from 'bcryptjs';

interface AdminSeedConfig {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization?: string;
}

/**
 * Creates initial super admin account if it doesn't exist
 */
export const seedAdminAccount = async (): Promise<void> => {
  try {
    console.log('🌱 Checking for admin account...');

    // Check if any super admin exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingSuperAdmin) {
      console.log('✅ Super admin account already exists:', existingSuperAdmin.email);
      return;
    }

    // Get admin configuration from environment variables
    const adminConfig: AdminSeedConfig = {
      email: process.env.ADMIN_EMAIL || 'admin@researchhub.com',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
      firstName: process.env.ADMIN_FIRST_NAME || 'ResearchHub',
      lastName: process.env.ADMIN_LAST_NAME || 'Administrator',
      organization: process.env.ADMIN_ORGANIZATION || 'ResearchHub Platform'
    };

    console.log('🔧 Creating initial super admin account...');

    // Create super admin user
    const adminUser = new User({
      email: adminConfig.email,
      password: adminConfig.password, // Will be hashed by pre-save hook
      firstName: adminConfig.firstName,
      lastName: adminConfig.lastName,
      role: 'super_admin',
      organization: adminConfig.organization,
      status: 'active',
      isVerified: true,
      isEmailVerified: true,
      profile: {
        isOnboardingComplete: true,
        preferences: {
          emailNotifications: true,
          marketingEmails: false,
          language: 'en',
          timezone: 'UTC'
        }
      }
    });

    await adminUser.save();

    console.log('✅ Super admin account created successfully!');
    console.log('📧 Email:', adminConfig.email);
    console.log('🔑 Password: [CONFIGURED VIA ENVIRONMENT]');
    console.log('⚠️  Please change default credentials after first login');

  } catch (error) {
    console.error('❌ Failed to seed admin account:', error);
    throw error;
  }
};

/**
 * Seeds multiple admin accounts from configuration
 */
export const seedMultipleAdmins = async (admins: AdminSeedConfig[]): Promise<void> => {
  try {
    console.log(`🌱 Seeding ${admins.length} admin accounts...`);

    for (const adminConfig of admins) {
      const existingUser = await User.findOne({ email: adminConfig.email });
      
      if (existingUser) {
        console.log(`⏭️  Admin already exists: ${adminConfig.email}`);
        continue;
      }

      const adminUser = new User({
        ...adminConfig,
        role: 'super_admin',
        status: 'active',
        isVerified: true,
        isEmailVerified: true,
        profile: {
          isOnboardingComplete: true,
          preferences: {
            emailNotifications: true,
            marketingEmails: false,
            language: 'en',
            timezone: 'UTC'
          }
        }
      });

      await adminUser.save();
      console.log(`✅ Created admin: ${adminConfig.email}`);
    }

  } catch (error) {
    console.error('❌ Failed to seed multiple admin accounts:', error);
    throw error;
  }
};

/**
 * Creates default test admin account for development
 */
export const seedTestAdmin = async (): Promise<void> => {
  try {
    const testAdmin = await User.findOne({ email: 'testadmin@test.com' });
    
    if (testAdmin) {
      console.log('✅ Test admin account already exists');
      return;
    }

    const adminUser = new User({
      email: 'testadmin@test.com',
      password: 'AdminPassword123!',
      firstName: 'Test',
      lastName: 'Admin',
      role: 'super_admin',
      organization: 'Test Organization',
      status: 'active',
      isVerified: true,
      isEmailVerified: true,
      profile: {
        isOnboardingComplete: true,
        preferences: {
          emailNotifications: true,
          marketingEmails: false,
          language: 'en',
          timezone: 'UTC'
        }
      }
    });

    await adminUser.save();
    console.log('✅ Test admin account created: testadmin@test.com / AdminPassword123!');

  } catch (error) {
    console.error('❌ Failed to create test admin account:', error);
    throw error;
  }
};

export default {
  seedAdminAccount,
  seedMultipleAdmins,
  seedTestAdmin
};
