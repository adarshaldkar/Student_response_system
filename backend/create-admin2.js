const http = require('http');

async function createAdmin(username, email, password) {
  const postData = JSON.stringify({
    username,
    email,
    password,
    role: 'admin'
  });

  const options = {
    hostname: 'localhost',
    port: 8001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    console.log(`Creating admin user: ${username}...`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${username} created successfully!`);
          console.log(`   Email: ${email}`);
          console.log(`   Password: ${password}`);
          resolve();
        } else if (res.statusCode === 400) {
          const response = JSON.parse(data);
          if (response.detail && response.detail.includes('already registered')) {
            console.log(`ℹ️  ${username} already exists.`);
            resolve();
          } else {
            console.error(`❌ Failed to create ${username}:`, response.detail);
            reject(new Error(response.detail));
          }
        } else {
          console.error(`❌ Failed to create ${username}. Status:`, res.statusCode);
          console.error('Response:', data);
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('Request failed:', err.message);
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

async function createMultipleAdmins() {
  console.log('🚀 Creating multiple admin users for testing...\n');
  
  const admins = [
    { username: 'admin1', email: 'admin1@test.com', password: 'password123' },
    { username: 'admin2', email: 'admin2@test.com', password: 'password123' },
    { username: 'admin3', email: 'admin3@test.com', password: 'password123' },
    { username: 'fileadmin', email: 'fileadmin@test.com', password: 'password123' }
  ];

  for (const admin of admins) {
    try {
      await createAdmin(admin.username, admin.email, admin.password);
    } catch (error) {
      console.error(`Failed to create ${admin.username}:`, error.message);
    }
  }
  
  console.log('\n✅ Admin creation process completed!');
  console.log('\n📋 Available admin users:');
  console.log('   • testadmin (password123)');
  console.log('   • admin1 (password123)');
  console.log('   • admin2 (password123)');
  console.log('   • admin3 (password123)');
  console.log('   • fileadmin (password123)');
}

createMultipleAdmins();
