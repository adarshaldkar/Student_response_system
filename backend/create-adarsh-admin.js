const http = require('http');

async function createAdarshAdmin() {
  console.log('🚀 Creating adarsh admin user...\n');
  
  const userData = {
    username: 'adarsh',
    email: 'adarsh@mvit.edu.in',
    password: 'adarsh123',
    role: 'admin'
  };
  
  const postData = JSON.stringify(userData);
  
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
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 201) {
          console.log('✅ adarsh admin user created successfully!');
          console.log('Username: adarsh');
          console.log('Email: adarsh@mvit.edu.in'); 
          console.log('Password: adarsh123');
          console.log('Role: admin');
          resolve();
        } else if (res.statusCode === 400) {
          const response = JSON.parse(data);
          if (response.detail === 'Username already exists') {
            console.log('ℹ️  adarsh user already exists!');
            console.log('Username: adarsh');
            console.log('Password: adarsh123 (if not changed)');
            resolve();
          } else {
            console.log('❌ Failed to create adarsh user:', response.detail);
            reject(new Error(response.detail));
          }
        } else {
          console.log('❌ Failed to create adarsh user. Status:', res.statusCode);
          console.log('Response:', data);
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

// Test login after creation
async function testAdarshLogin() {
  console.log('\n🔐 Testing adarsh login...');
  
  const loginData = JSON.stringify({
    username: 'adarsh',
    password: 'adarsh123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 8001,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ adarsh login successful!');
          console.log('Role:', response.role);
          console.log('User ID:', response.user_id);
          resolve(response.access_token);
        } else {
          console.log('❌ adarsh login failed:', res.statusCode);
          console.log('Response:', data);
          reject(new Error(`Login failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
}

// Test file sharing API
async function testFileSharingForAdarsh(token) {
  console.log('\n📁 Testing file sharing API for adarsh...');
  
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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log(`✅ adarsh can see ${response.admins.length} other admin users:`);
          response.admins.forEach((admin, index) => {
            console.log(`   ${index + 1}. ${admin.username} (${admin.email})`);
          });
          resolve();
        } else {
          console.log('❌ File sharing API failed for adarsh:', res.statusCode);
          console.log('Response:', data);
          reject(new Error(`API failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  try {
    await createAdarshAdmin();
    const token = await testAdarshLogin();
    await testFileSharingForAdarsh(token);
    
    console.log('\n🎉 adarsh admin user is ready for file sharing!');
    console.log('\n📋 SUMMARY:');
    console.log('✓ User created/verified: adarsh');
    console.log('✓ Password: adarsh123');
    console.log('✓ Role: admin'); 
    console.log('✓ File sharing API working');
    console.log('\n🌐 Now you can login in the browser with:');
    console.log('Username: adarsh');
    console.log('Password: adarsh123');
    
  } catch (error) {
    console.error('💥 Setup failed:', error.message);
    process.exit(1);
  }
}

main();
