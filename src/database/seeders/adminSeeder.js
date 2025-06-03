"use strict";
/**
 * Admin Account Seeder
 * Creates initial super admin account for cloud deployment
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTestAdmin = exports.seedMultipleAdmins = exports.seedAdminAccount = void 0;
const User_model_js_1 = require("../models/User.model.js");
/**
 * Creates initial super admin account if it doesn't exist
 */
const seedAdminAccount = async () => {
    try {
        console.log('🌱 Checking for admin account...');
        // Check if any super admin exists
        const existingSuperAdmin = await User_model_js_1.User.findOne({ role: 'super_admin' });
        if (existingSuperAdmin) {
            console.log('✅ Super admin account already exists:', existingSuperAdmin.email);
            return;
        }
        // Get admin configuration from environment variables
        const adminConfig = {
            email: process.env.ADMIN_EMAIL || 'admin@researchhub.com',
            password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
            firstName: process.env.ADMIN_FIRST_NAME || 'ResearchHub',
            lastName: process.env.ADMIN_LAST_NAME || 'Administrator',
            organization: process.env.ADMIN_ORGANIZATION || 'ResearchHub Platform'
        };
        console.log('🔧 Creating initial super admin account...');
        // Create super admin user
        const adminUser = new User_model_js_1.User({
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
    }
    catch (error) {
        console.error('❌ Failed to seed admin account:', error);
        throw error;
    }
};
exports.seedAdminAccount = seedAdminAccount;
/**
 * Seeds multiple admin accounts from configuration
 */
const seedMultipleAdmins = async (admins) => {
    try {
        console.log(`🌱 Seeding ${admins.length} admin accounts...`);
        for (const adminConfig of admins) {
            const existingUser = await User_model_js_1.User.findOne({ email: adminConfig.email });
            if (existingUser) {
                console.log(`⏭️  Admin already exists: ${adminConfig.email}`);
                continue;
            }
            const adminUser = new User_model_js_1.User({
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
    }
    catch (error) {
        console.error('❌ Failed to seed multiple admin accounts:', error);
        throw error;
    }
};
exports.seedMultipleAdmins = seedMultipleAdmins;
/**
 * Creates default test admin account for development
 */
const seedTestAdmin = async () => {
    try {
        const testAdmin = await User_model_js_1.User.findOne({ email: 'testadmin@test.com' });
        if (testAdmin) {
            console.log('✅ Test admin account already exists');
            return;
        }
        const adminUser = new User_model_js_1.User({
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
    }
    catch (error) {
        console.error('❌ Failed to create test admin account:', error);
        throw error;
    }
};
exports.seedTestAdmin = seedTestAdmin;
exports.default = {
    seedAdminAccount: exports.seedAdminAccount,
    seedMultipleAdmins: exports.seedMultipleAdmins,
    seedTestAdmin: exports.seedTestAdmin
};
