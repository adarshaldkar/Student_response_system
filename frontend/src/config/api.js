// API Configuration
// This handles both development and production environments

const getBackendUrl = () => {
  // In production, use the deployed backend URL
  // In development, use localhost
  
  // Check if we're in development (localhost)
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  if (isDevelopment) {
    // Development: use localhost
    return 'http://localhost:8001';
  } else {
    // Production: Try to use environment variable first, then fallback
    return process.env.REACT_APP_BACKEND_URL || 
           'https://student-response-system.onrender.com'; // Replace with your actual backend URL
  }
};

export const BACKEND_URL = getBackendUrl();
export const API = `${BACKEND_URL}/api`;

console.log('Environment:', window.location.hostname === 'localhost' ? 'Development' : 'Production');
console.log('Backend URL:', BACKEND_URL);
console.log('API base:', API);
