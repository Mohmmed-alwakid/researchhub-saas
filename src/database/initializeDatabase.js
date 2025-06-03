"use strict";
/**
 * Database Initialization and Seeding
 * Handles database setup and initial data seeding for cloud deployment
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAdminAccount = exports.initializeDatabaseWithRetries = exports.initializeDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const adminSeeder_js_1 = require("./seeders/adminSeeder.js");
/**
 * Initialize database with essential data
 */
const initializeDatabase = async () => {
    try {
        console.log('🚀 Initializing database...');
        // Wait for database connection to be ready
        if (mongoose_1.default.connection.readyState !== 1) {
            console.log('⏳ Waiting for database connection...');
            await new Promise((resolve) => {
                mongoose_1.default.connection.once('open', resolve);
            });
        }
        console.log('✅ Database connection ready');
        // Seed admin accounts based on environment
        const nodeEnv = process.env.NODE_ENV || 'development';
        if (nodeEnv === 'production') {
            // Production: Create admin from environment variables
            await (0, adminSeeder_js_1.seedAdminAccount)();
        }
        else {
            // Development: Create test admin account
            await (0, adminSeeder_js_1.seedTestAdmin)();
        }
        console.log('✅ Database initialization completed');
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
/**
 * Run database initialization with retries
 */
const initializeDatabaseWithRetries = async (maxRetries = 3) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await (0, exports.initializeDatabase)();
            return;
        }
        catch (error) {
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
exports.initializeDatabaseWithRetries = initializeDatabaseWithRetries;
/**
 * Verify admin account exists
 */
const verifyAdminAccount = async () => {
    try {
        const { User } = await Promise.resolve().then(() => __importStar(require('./models/User.model.js')));
        const adminCount = await User.countDocuments({
            role: { $in: ['admin', 'super_admin'] }
        });
        if (adminCount === 0) {
            console.warn('⚠️  No admin accounts found in database');
            return false;
        }
        console.log(`✅ Found ${adminCount} admin account(s)`);
        return true;
    }
    catch (error) {
        console.error('❌ Failed to verify admin accounts:', error);
        return false;
    }
};
exports.verifyAdminAccount = verifyAdminAccount;
exports.default = {
    initializeDatabase: exports.initializeDatabase,
    initializeDatabaseWithRetries: exports.initializeDatabaseWithRetries,
    verifyAdminAccount: exports.verifyAdminAccount
};
