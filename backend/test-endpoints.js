const http = require('http');

async function testLogin() {
  const postData = JSON.stringify({
    username: 'adarsh',
    password: 'your-actual-password-here' // You'll need to replace this with the actual password
  });

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
          console.log('Login successful!');
          console.log('Token:', response.access_token);
          resolve(response.access_token);
        } else {
          console.error('Login failed. Status:', res.statusCode);
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

async function testFileshareAdmins(token) {
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
        console.log('Fileshare admins endpoint response:');
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
        
        if (res.statusCode === 200) {
          resolve(data);
        } else {
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

async function testEndpoints() {
  try {
    console.log('Testing authentication...');
    // For testing, let's try with testadmin first
    const testPostData = JSON.stringify({
      username: 'testadmin',
      password: 'password123'
    });

    const testOptions = {
      hostname: 'localhost',
      port: 8001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testPostData)
      }
    };

    const token = await new Promise((resolve, reject) => {
      const req = http.request(testOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            const response = JSON.parse(data);
            console.log('Login successful for testadmin!');
            resolve(response.access_token);
          } else {
            console.error('Login failed. Status:', res.statusCode);
            console.error('Response:', data);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });
      
      req.on('error', (err) => {
        console.error('Request failed:', err.message);
        reject(err);
      });
      
      req.write(testPostData);
      req.end();
    });
    
    console.log('Testing fileshare endpoints...');
    await testFileshareAdmins(token);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEndpoints();
