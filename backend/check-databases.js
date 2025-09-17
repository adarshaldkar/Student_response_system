const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDatabases() {
  const client = new MongoClient(process.env.MONGO_URL);
  
  try {
    await client.connect();
    console.log('🔍 Checking both databases for data...\n');
    
    // Check student_feedback (singular - current .env)
    const db1 = client.db('student_feedback');
    const users1 = await db1.collection('users').countDocuments({});
    const forms1 = await db1.collection('feedbackforms').countDocuments({});
    
    console.log('📊 student_feedback database:');
    console.log(`   Users: ${users1}`);
    console.log(`   Forms: ${forms1}`);
    
    // Check students_feedback (plural - might be old)
    const db2 = client.db('students_feedback');
    const users2 = await db2.collection('users').countDocuments({});
    const forms2 = await db2.collection('feedbackforms').countDocuments({});
    
    console.log('\\n📊 students_feedback database:');
    console.log(`   Users: ${users2}`);
    console.log(`   Forms: ${forms2}`);
    
    // Determine which database has the data
    if (users1 > 0 || forms1 > 0) {
      console.log('\\n✅ Data found in: student_feedback (singular)');
      console.log('   This matches the current .env configuration');
    } else if (users2 > 0 || forms2 > 0) {
      console.log('\\n⚠️  Data found in: students_feedback (plural)');
      console.log('   Need to update .env DB_NAME to students_feedback');
    } else {
      console.log('\\n❌ No data found in either database');
    }
    
    // Show sample user from the database with data
    if (users1 > 0) {
      const sampleUser = await db1.collection('users').findOne({});
      console.log('\\n👤 Sample user in student_feedback:');
      console.log(`   Username: ${sampleUser?.username}`);
      console.log(`   Email: ${sampleUser?.email}`);
    }
    
    if (users2 > 0) {
      const sampleUser = await db2.collection('users').findOne({});
      console.log('\\n👤 Sample user in students_feedback:');
      console.log(`   Username: ${sampleUser?.username}`);
      console.log(`   Email: ${sampleUser?.email}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

checkDatabases();