const http = require('http');

async function loginUser(username, password) {
  const postData = JSON.stringify({ username, password });

  const options = {
    hostname: 'localhost',
    port: 8001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log(`✅ Login successful for ${username}!`);
          resolve(response.access_token);
        } else {
          console.log(`❌ Login failed for ${username}. Status: ${res.statusCode}`);
          console.log('Response:', data);
          reject(new Error(`Login failed for ${username}`));
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

async function getAdmins(token, username) {
  const options = {
    hostname: 'localhost',
    port: 8001,
    path: '/api/fileshare/admins',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n👤 Admins visible to ${username}:`);
        console.log('Status:', res.statusCode);
        
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          if (response.admins.length === 0) {
            console.log('📭 No other admins found');
          } else {
            console.log(`📋 Found ${response.admins.length} other admin(s):`);
            response.admins.forEach((admin, index) => {
              console.log(`   ${index + 1}. ${admin.username} (${admin.email})`);
            });
          }
          resolve(response.admins);
        } else {
          console.log('❌ Failed to get admins:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('Request failed:', err.message);
      reject(err);
    });
    
    req.end();
  });
}

async function testAllAdmins() {
  console.log('🔍 Checking admin users in the system...\n');

  const testUsers = [
    { username: 'testadmin', password: 'password123' },
    { username: 'adarsh', password: 'adarsh123' }, // Try common password
    { username: 'admin', password: 'admin123' },   // Try if there's a default admin
  ];

  for (const user of testUsers) {
    try {
      console.log(`\n🔐 Testing login for: ${user.username}`);
      const token = await loginUser(user.username, user.password);
      await getAdmins(token, user.username);
    } catch (error) {
      console.log(`❌ Could not test ${user.username}:`, error.message);
    }
  }
}

testAllAdmins();
