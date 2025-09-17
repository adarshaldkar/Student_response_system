const http = require('http');

async function createTestAdmin() {
  const postData = JSON.stringify({
    username: 'testadmin',
    email: 'testadmin@example.com',
    password: 'password123',
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
    console.log('Creating test admin user...');
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('Test admin created successfully!');
          console.log('Username: testadmin');
          console.log('Password: password123');
          console.log('Email: testadmin@example.com');
          resolve();
        } else if (res.statusCode === 400) {
          const response = JSON.parse(data);
          if (response.detail && response.detail.includes('already registered')) {
            console.log('Test admin already exists. You can use:');
            console.log('Username: testadmin');
            console.log('Password: password123');
            resolve();
          } else {
            console.error('Failed to create test admin:', response.detail);
            reject(new Error(response.detail));
          }
        } else {
          console.error('Failed to create test admin. Status:', res.statusCode);
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

createTestAdmin();
