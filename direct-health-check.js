// Simple script to check if the server is running
import fetch from 'node-fetch';

async function checkHealth() {
  try {
    console.log('Checking API health...');
    const response = await fetch('http://localhost:5000/api/health');
    
    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`);
      return;
    }
    
    const data = await response.json();
    console.log('API health check response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\nServer is running properly!');
  } catch (error) {
    console.error('Error connecting to API:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure the server is running on port 5000');
    console.log('2. Check for any errors in the server logs');
    console.log('3. Verify that the application has been started with `npm run dev`');
  }
}

checkHealth();