import mongoose from 'mongoose';

/**
 * Database connection configuration and initialization
 */
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Connect to MongoDB database
   */
  public async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('Database already connected');
      return;
    }

    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/researchhub';
        await mongoose.connect(mongoUri, {
        // Connection options
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferCommands: false, // Disable mongoose buffering
      });

      this.isConnected = true;
      console.log('✅ Connected to MongoDB successfully');

      // Handle connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📡 MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
        this.isConnected = true;
      });

      // Graceful shutdown
      process.on('SIGINT', this.gracefulShutdown.bind(this));
      process.on('SIGTERM', this.gracefulShutdown.bind(this));

    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
      process.exit(1);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.connection.close();
      this.isConnected = false;
      console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
    }
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): { isConnected: boolean; readyState: number; host?: string; name?: string } {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  }

  /**
   * Health check for the database connection
   */
  public async healthCheck(): Promise<{ status: string; timestamp: Date; details: any }> {
    try {
      const adminDb = mongoose.connection.db?.admin();
      const result = await adminDb?.ping();
      
      return {
        status: 'healthy',
        timestamp: new Date(),
        details: {
          isConnected: this.isConnected,
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          name: mongoose.connection.name,
          ping: result
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        details: {
          error: error instanceof Error ? error.message : 'Unknown error',
          isConnected: this.isConnected,
          readyState: mongoose.connection.readyState
        }
      };
    }
  }

  /**
   * Initialize database indexes
   */
  public async initializeIndexes(): Promise<void> {
    try {
      console.log('🔍 Initializing database indexes...');      // Import all models to ensure indexes are created
      await import('./models/User.model');
      await import('./models/Study.model');
      await import('./models/Task.model');
      await import('./models/Session.model');
      
      // Create indexes for all collections
      const collections = await mongoose.connection.db?.collections();
      
      if (collections) {
        for (const collection of collections) {
          try {
            const indexes = await collection.listIndexes().toArray();
            if (indexes.length === 0) {
              console.log(`📋 No custom indexes defined for ${collection.collectionName}`);
            } else {
              console.log(`✅ Indexes verified for ${collection.collectionName}`);
            }
          } catch (error) {
            console.warn(`⚠️ Failed to verify indexes for ${collection.collectionName}:`, error);
          }
        }
      }
      
      console.log('✅ Database indexes initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database indexes:', error);
    }
  }

  /**
   * Drop all collections (for testing purposes)
   */
  public async dropAllCollections(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot drop collections in production environment');
    }

    try {
      const collections = await mongoose.connection.db?.collections();
      
      if (collections) {
        for (const collection of collections) {
          await collection.drop();
          console.log(`🗑️ Dropped collection: ${collection.collectionName}`);
        }
      }
      
      console.log('✅ All collections dropped successfully');
    } catch (error) {
      console.error('❌ Failed to drop collections:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown handler
   */
  private async gracefulShutdown(signal: string): Promise<void> {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    
    try {
      await this.disconnect();
      console.log('✅ Database connection closed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  }
}

// Export singleton instance
export const db = DatabaseConnection.getInstance();

// Export connection utilities
export const connectDB = () => db.connect();
export const disconnectDB = () => db.disconnect();
export const getDBStatus = () => db.getConnectionStatus();
export const dbHealthCheck = () => db.healthCheck();
export const initDBIndexes = () => db.initializeIndexes();

// Development utilities
export const dropAllCollections = () => db.dropAllCollections();
