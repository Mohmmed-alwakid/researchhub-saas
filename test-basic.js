// Simple test to isolate the import issue
console.log('🧪 Testing basic imports...');

try {
  console.log('1. Testing express import...');
  const express = require('express');
  console.log('✅ Express imported successfully');

  console.log('2. Testing basic app creation...');
  const app = express();
  console.log('✅ Express app created successfully');

  console.log('3. Testing basic route...');
  app.get('/', (req, res) => {
    res.json({ message: 'Test' });
  });
  console.log('✅ Basic route added successfully');

  console.log('4. Testing server creation...');
  const server = app.listen(3003, () => {
    console.log('✅ Server started on port 3003');
    server.close();
    console.log('✅ Test completed successfully');
  });

} catch (error) {
  console.error('❌ Error during basic test:', error);
}
