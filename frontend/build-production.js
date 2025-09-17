const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building for production...');

// Set production environment
process.env.NODE_ENV = 'production';

// Copy production env file
const envProdPath = path.join(__dirname, '.env.production');
const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envProdPath)) {
  console.log('📄 Using production environment variables...');
  fs.copyFileSync(envProdPath, envPath);
}

// Build the project
try {
  console.log('🔨 Running build command...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully!');
  
  // Verify public assets are copied
  const publicPath = path.join(__dirname, 'build');
  if (fs.existsSync(path.join(publicPath, 'college_logo_1.jpg'))) {
    console.log('✅ Static assets verified');
  } else {
    console.warn('⚠️ Warning: Some static assets may be missing');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
