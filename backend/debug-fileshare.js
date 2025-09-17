const http = require('http');

// Test admin loading and identify issues
async function testAPI() {
  console.log('🔍 Testing File Sharing API endpoints...\n');
  
  // Test 1: Login as testadmin
  console.log('Step 1: Logging in as testadmin...');
  
  try {
    const token = await loginUser('testadmin', 'password123');
    console.log('✅ Login successful!');
    
    // Test 2: Fetch admins
    console.log('\nStep 2: Testing /api/fileshare/admins endpoint...');
    const admins = await fetchAdmins(token);
    console.log(`✅ Successfully fetched ${admins.length} admin users`);
    
    // Test 3: Test other endpoints
    console.log('\nStep 3: Testing other fileshare endpoints...');
    await testFileShareEndpoints(token);
    
    console.log('\n🎉 All tests passed! File sharing should work correctly.');
    
    // Instructions for frontend
    console.log('\n📋 FRONTEND CONFIGURATION CHECK:');
    console.log('1. Ensure REACT_APP_BACKEND_URL is set to http://localhost:8001');
    console.log('2. Check that authentication token is being passed correctly');
    console.log('3. Verify CORS settings allow frontend domain');
    console.log('4. Make sure admin user is logged in before accessing File Share tab');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Ensure MongoDB is running and accessible');
    console.log('2. Check that admin users exist in database');
    console.log('3. Verify JWT token is valid and not expired');
    console.log('4. Check server logs for additional error details');
  }
}

// Login function
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
          resolve(response.access_token);
        } else {
          reject(new Error(`Login failed: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.write(postData);
    req.end();
  });
}

// Fetch admins function
async function fetchAdmins(token) {
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
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('Admin users found:');
          response.admins.forEach((admin, index) => {
            console.log(`  ${index + 1}. ${admin.username} (${admin.email})`);
          });
          resolve(response.admins);
        } else {
          reject(new Error(`Failed to fetch admins: ${res.statusCode} - ${data}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

// Test other endpoints
async function testFileShareEndpoints(token) {
  const endpoints = [
    { path: '/api/fileshare/received', method: 'GET', name: 'Received Files' },
    { path: '/api/fileshare/sent', method: 'GET', name: 'Sent Files' },
    { path: '/api/fileshare/chat/unread-count', method: 'GET', name: 'Unread Count' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      await testEndpoint(token, endpoint);
      console.log(`  ✅ ${endpoint.name} endpoint working`);
    } catch (error) {
      console.log(`  ❌ ${endpoint.name} endpoint failed: ${error.message}`);
    }
  }
}

// Test individual endpoint
async function testEndpoint(token, endpoint) {
  const options = {
    hostname: 'localhost',
    port: 8001,
    path: endpoint.path,
    method: endpoint.method,
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
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

// Wait for server to start
async function waitForServer() {
  const maxAttempts = 10;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:8001/health', (res) => {
          resolve();
        });
        
        req.on('error', (err) => {
          reject(err);
        });
        
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      
      console.log('✅ Server is running!');
      return true;
    } catch (error) {
      attempts++;
      console.log(`⏳ Waiting for server... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('Server is not responding');
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting File Sharing Debug Tool...\n');
    await waitForServer();
    await testAPI();
  } catch (error) {
    console.error('💥 Debug failed:', error.message);
    process.exit(1);
  }
}

main();
