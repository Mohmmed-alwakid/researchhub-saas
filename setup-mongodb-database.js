import { MongoClient } from 'mongodb';

async function setupDatabase() {
    const uri = 'mongodb://researchhub:researchhub2025secure@localhost:27017/researchhub?authSource=admin';
    
    console.log('🔧 Setting up ResearchHub database...');
    
    try {
        const client = new MongoClient(uri);
        await client.connect();
        
        console.log('✅ Connected to MongoDB successfully');
        
        // Switch to researchhub database
        const db = client.db('researchhub');
        
        // Create collections with proper indexes
        console.log('📋 Creating collections...');
        
        // Users collection
        const usersCollection = db.collection('users');
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.createIndex({ role: 1 });
        console.log('✅ Users collection created with indexes');
        
        // Studies collection
        const studiesCollection = db.collection('studies');
        await studiesCollection.createIndex({ title: 1 });
        await studiesCollection.createIndex({ createdBy: 1 });
        await studiesCollection.createIndex({ status: 1 });
        console.log('✅ Studies collection created with indexes');
        
        // Tasks collection
        const tasksCollection = db.collection('tasks');
        await tasksCollection.createIndex({ studyId: 1 });
        await tasksCollection.createIndex({ type: 1 });
        console.log('✅ Tasks collection created with indexes');
        
        // Sessions collection
        const sessionsCollection = db.collection('sessions');
        await sessionsCollection.createIndex({ studyId: 1 });
        await sessionsCollection.createIndex({ participantId: 1 });
        await sessionsCollection.createIndex({ status: 1 });
        console.log('✅ Sessions collection created with indexes');
        
        // Create a test admin user
        const adminUser = {
            email: 'admin@researchhub.com',
            password: '$2a$12$LQvx5lGAKJ2yGzO8KxYX8uKJ3jXmN7Q9pD2kL5mR6wS4vT8nC3dE2', // AdminPassword123!
            firstName: 'ResearchHub',
            lastName: 'Administrator',
            role: 'super_admin',
            organization: 'ResearchHub Platform',
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const existingAdmin = await usersCollection.findOne({ email: adminUser.email });
        if (!existingAdmin) {
            await usersCollection.insertOne(adminUser);
            console.log('✅ Test admin user created');
        } else {
            console.log('✅ Admin user already exists');
        }
        
        // List all collections to verify
        const collections = await db.listCollections().toArray();
        console.log('📋 Collections in database:', collections.map(c => c.name));
        
        await client.close();
        console.log('✅ Database setup completed successfully');
        
        return true;
    } catch (error) {
        console.error('❌ Database setup failed:', error);
        return false;
    }
}

setupDatabase().then(success => {
    if (success) {
        console.log('\n🎉 ResearchHub database is ready!');
        console.log('📝 Next: Restart the backend server');
    }
    process.exit(success ? 0 : 1);
});
