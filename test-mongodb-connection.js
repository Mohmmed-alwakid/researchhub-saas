import { MongoClient } from 'mongodb';

async function testConnection() {
    const uri = 'mongodb://researchhub:researchhub2025secure@localhost:27017/researchhub?authSource=admin';
    
    console.log('Testing MongoDB connection...');
    console.log('URI:', uri);
    
    try {
        const client = new MongoClient(uri);
        await client.connect();
        
        console.log('✅ Successfully connected to MongoDB!');
        
        // Test database access
        const db = client.db('researchhub');
        const collections = await db.listCollections().toArray();
        console.log('📋 Collections:', collections);
        
        // Test creating a collection
        const testCollection = db.collection('connection_test');
        await testCollection.insertOne({ test: true, timestamp: new Date() });
        console.log('✅ Successfully created test document');
        
        // Clean up
        await testCollection.deleteMany({});
        
        await client.close();
        console.log('✅ Connection test completed successfully');
        
        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        return false;
    }
}

testConnection().then(success => {
    if (success) {
        console.log('\n🎉 MongoDB is ready for ResearchHub!');
        console.log('📝 Next step: Update backend environment variables');
    } else {
        console.log('\n❌ MongoDB connection failed');
    }
    process.exit(success ? 0 : 1);
});
