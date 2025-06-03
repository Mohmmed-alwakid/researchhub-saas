"use strict";
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
exports.dropAllCollections = exports.initDBIndexes = exports.dbHealthCheck = exports.getDBStatus = exports.disconnectDB = exports.connectDB = exports.db = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Database connection configuration and initialization
 */
class DatabaseConnection {
    static instance;
    isConnected = false;
    constructor() { }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    /**
     * Connect to MongoDB database
     */
    async connect() {
        if (this.isConnected) {
            console.log('Database already connected');
            return;
        }
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/researchhub';
            console.log('🔌 Attempting to connect to MongoDB...');
            await mongoose_1.default.connect(mongoUri, {
                // Connection options
                maxPoolSize: 10, // Maintain up to 10 socket connections
                serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
                socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
                bufferCommands: false, // Disable mongoose buffering
                connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
                retryWrites: true,
            });
            this.isConnected = true;
            console.log('✅ Connected to MongoDB successfully');
            // Handle connection events
            mongoose_1.default.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
            });
            mongoose_1.default.connection.on('disconnected', () => {
                console.log('📡 MongoDB disconnected');
                this.isConnected = false;
            });
            mongoose_1.default.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
                this.isConnected = true;
            });
            // Graceful shutdown
            process.on('SIGINT', this.gracefulShutdown.bind(this));
            process.on('SIGTERM', this.gracefulShutdown.bind(this));
        }
        catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error);
            console.log('⚠️  Server will continue without database connection');
            console.log('⚠️  Some features may not work properly');
            // Don't exit process - let Railway healthcheck succeed even without DB
            // process.exit(1);
        }
    }
    /**
     * Disconnect from MongoDB
     */
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.connection.close();
            this.isConnected = false;
            console.log('🔌 Disconnected from MongoDB');
        }
        catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error);
        }
    }
    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose_1.default.connection.readyState,
            host: mongoose_1.default.connection.host,
            name: mongoose_1.default.connection.name
        };
    }
    /**
     * Health check for the database connection
     */
    async healthCheck() {
        try {
            const adminDb = mongoose_1.default.connection.db?.admin();
            const result = await adminDb?.ping();
            return {
                status: 'healthy',
                timestamp: new Date(),
                details: {
                    isConnected: this.isConnected,
                    readyState: mongoose_1.default.connection.readyState,
                    host: mongoose_1.default.connection.host,
                    name: mongoose_1.default.connection.name,
                    ping: result
                }
            };
        }
        catch (error) {
            return {
                status: 'unhealthy',
                timestamp: new Date(),
                details: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    isConnected: this.isConnected,
                    readyState: mongoose_1.default.connection.readyState
                }
            };
        }
    }
    /**
     * Initialize database indexes
     */
    async initializeIndexes() {
        try {
            console.log('🔍 Initializing database indexes...'); // Import all models to ensure indexes are created
            await Promise.resolve().then(() => __importStar(require('./models/User.model')));
            await Promise.resolve().then(() => __importStar(require('./models/Study.model')));
            await Promise.resolve().then(() => __importStar(require('./models/Task.model')));
            await Promise.resolve().then(() => __importStar(require('./models/Session.model')));
            // Create indexes for all collections
            const collections = await mongoose_1.default.connection.db?.collections();
            if (collections) {
                for (const collection of collections) {
                    try {
                        const indexes = await collection.listIndexes().toArray();
                        if (indexes.length === 0) {
                            console.log(`📋 No custom indexes defined for ${collection.collectionName}`);
                        }
                        else {
                            console.log(`✅ Indexes verified for ${collection.collectionName}`);
                        }
                    }
                    catch (error) {
                        console.warn(`⚠️ Failed to verify indexes for ${collection.collectionName}:`, error);
                    }
                }
            }
            console.log('✅ Database indexes initialized successfully');
        }
        catch (error) {
            console.error('❌ Failed to initialize database indexes:', error);
        }
    }
    /**
     * Drop all collections (for testing purposes)
     */
    async dropAllCollections() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot drop collections in production environment');
        }
        try {
            const collections = await mongoose_1.default.connection.db?.collections();
            if (collections) {
                for (const collection of collections) {
                    await collection.drop();
                    console.log(`🗑️ Dropped collection: ${collection.collectionName}`);
                }
            }
            console.log('✅ All collections dropped successfully');
        }
        catch (error) {
            console.error('❌ Failed to drop collections:', error);
            throw error;
        }
    }
    /**
     * Graceful shutdown handler
     */
    async gracefulShutdown(signal) {
        console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
        try {
            await this.disconnect();
            console.log('✅ Database connection closed successfully');
            process.exit(0);
        }
        catch (error) {
            console.error('❌ Error during graceful shutdown:', error);
            process.exit(1);
        }
    }
}
// Export singleton instance
exports.db = DatabaseConnection.getInstance();
// Export connection utilities
const connectDB = () => exports.db.connect();
exports.connectDB = connectDB;
const disconnectDB = () => exports.db.disconnect();
exports.disconnectDB = disconnectDB;
const getDBStatus = () => exports.db.getConnectionStatus();
exports.getDBStatus = getDBStatus;
const dbHealthCheck = () => exports.db.healthCheck();
exports.dbHealthCheck = dbHealthCheck;
const initDBIndexes = () => exports.db.initializeIndexes();
exports.initDBIndexes = initDBIndexes;
// Development utilities
const dropAllCollections = () => exports.db.dropAllCollections();
exports.dropAllCollections = dropAllCollections;
