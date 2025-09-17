const http = require('http');

async function testFormAccess() {
  console.log('🧪 Testing form access after migration...\n');
  
  // First, let's login to get admin token
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
          testGetForms(response.access_token);
        } else {
          console.log('❌ Login failed:', res.statusCode, data);
          reject(new Error(`Login failed: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (err) => {
      console.error('❌ Login request failed:', err.message);
      reject(err);
    });
    
    req.write(loginData);
    req.end();
  });
}

function testGetForms(token) {
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
        
        if (forms.length > 0) {
          const form = forms[0];
          console.log(`\\n🎯 Testing form access: ${form.title}`);
          console.log(`   Form ID: ${form.id}`);
          console.log(`   Is Invalid: ${form.is_invalid}`);
          
          testStudentAccess(form.id);
        } else {
          console.log('⚠️  No forms found to test');
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

function testStudentAccess(formId) {
  console.log(`\\n👨‍🎓 Testing student access to form: ${formId}`);
  
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
      if (res.statusCode === 200) {
        const form = JSON.parse(data);
        console.log('✅ Student can access form successfully!');
        console.log(`   Form: ${form.title}`);
        console.log(`   Department: ${form.department}`);
        console.log(`   Year: ${form.year}`);
        console.log(`   Section: ${form.section}`);
      } else {
        console.log('❌ Student cannot access form:', res.statusCode, data);
      }
      
      console.log('\\n🎉 Test completed!');
    });
  });
  
  req.on('error', (err) => {
    console.error('❌ Student access request failed:', err.message);
  });
  
  req.end();
}

// Run the test
testFormAccess().catch(console.error);