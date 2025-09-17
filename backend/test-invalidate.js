const http = require('http');

async function testInvalidateEndpoint() {
  console.log('🧪 Testing form invalidation endpoint...\n');
  
  // First, login to get admin token
  console.log('🔐 Logging in as admin...');
  
  const loginData = JSON.stringify({
    username: 'adarsh',
    password: 'adarsh123'
  });
  
  const loginOptions = {
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
    const req = http.request(loginOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ Login successful!');
          testInvalidateForm(response.access_token);
        } else {
          console.log('❌ Login failed:', res.statusCode, data);
          reject(new Error(`Login failed: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(loginData);
    req.end();
  });
}

function testInvalidateForm(token) {
  console.log('\\n📋 Getting forms list...');
  
  const options = {
    hostname: 'localhost',
    port: 8001,
    path: '/api/forms',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200) {
        const forms = JSON.parse(data);
        console.log(`✅ Found ${forms.length} forms`);
        
        // Find a form that is not already invalid
        const validForm = forms.find(form => !form.is_invalid);
        if (validForm) {
          console.log(`\\n🎯 Testing invalidation of: ${validForm.title}`);
          console.log(`   Form ID: ${validForm.id}`);
          console.log(`   Current status: ${validForm.is_invalid ? 'Invalid' : 'Valid'}`);
          
          invalidateForm(validForm.id, token);
        } else {
          console.log('⚠️  All forms are already invalid. Cannot test invalidation.');
        }
      } else {
        console.log('❌ Get forms failed:', res.statusCode, data);
      }
    });
  });
  
  req.on('error', (err) => {
    console.error('❌ Get forms request failed:', err.message);
  });
  
  req.end();
}

function invalidateForm(formId, token) {
  console.log(`\\n🚫 Invalidating form: ${formId}`);
  
  const options = {
    hostname: 'localhost',
    port: 8001,
    path: `/api/forms/${formId}/invalidate`,
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 200) {
        const response = JSON.parse(data);
        console.log('✅ Form invalidated successfully!');
        console.log('   Message:', response.message);
        console.log('   Form is now invalid:', response.form.is_invalid);
        
        // Test student access after invalidation
        testStudentAccessAfterInvalidation(formId);
      } else {
        console.log('❌ Form invalidation failed:', res.statusCode, data);
      }
    });
  });
  
  req.on('error', (err) => {
    console.error('❌ Invalidate request failed:', err.message);
  });
  
  req.end();
}

function testStudentAccessAfterInvalidation(formId) {
  console.log(`\\n👨‍🎓 Testing student access to invalidated form: ${formId}`);
  
  const options = {
    hostname: 'localhost',
    port: 8001,
    path: `/api/forms/${formId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      if (res.statusCode === 404) {
        console.log('✅ Perfect! Student correctly CANNOT access invalidated form');
        console.log('   Error message:', data);
      } else if (res.statusCode === 200) {
        console.log('❌ Problem! Student can still access invalidated form');
      } else {
        console.log(`⚠️  Unexpected response: ${res.statusCode} - ${data}`);
      }
      
      console.log('\\n🎉 Invalidation test completed!');
    });
  });
  
  req.on('error', (err) => {
    console.error('❌ Student access test failed:', err.message);
  });
  
  req.end();
}

// Run the test
testInvalidateEndpoint().catch(console.error);