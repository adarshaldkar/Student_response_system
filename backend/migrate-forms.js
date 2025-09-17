const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateExistingForms() {
  const client = new MongoClient(process.env.MONGO_URL);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB for migration');
    
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection('feedbackforms');
    
    // Update all existing forms that don't have the isInvalid field
    const result = await collection.updateMany(
      { isInvalid: { $exists: false } },
      { $set: { isInvalid: false } }
    );
    
    console.log(`✅ Migration completed successfully!`);
    console.log(`📊 Updated ${result.modifiedCount} forms with isInvalid: false`);
    
    // Check the results
    const totalForms = await collection.countDocuments({});
    const validForms = await collection.countDocuments({ isInvalid: false });
    const invalidForms = await collection.countDocuments({ isInvalid: true });
    
    console.log(`\n📋 Summary:`);
    console.log(`   Total forms: ${totalForms}`);
    console.log(`   Valid forms: ${validForms}`);
    console.log(`   Invalid forms: ${invalidForms}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

// Run the migration
migrateExistingForms();