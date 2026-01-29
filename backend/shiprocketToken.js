const axios = require('axios');
require('dotenv').config();

const testShiprocketAuth = async () => {
  try {
    console.log('🔄 Testing Shiprocket Authentication...');
    console.log(`📧 Email: ${process.env.SHIPROCKET_EMAIL}`);
    console.log(`🔐 Password: ${process.env.SHIPROCKET_PASSWORD}`);
    
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });

    console.log('\n✅ SUCCESS! Shiprocket Authentication Works\n');
    console.log('Token:', response.data.token);
    console.log('\nYour credentials are correct! ✨');
    console.log('The backend should now be able to create orders in Shiprocket.');
    
  } catch (error) {
    console.log('\n❌ AUTHENTICATION FAILED\n');
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      console.log('\n⚠️  This means:');
      console.log('   - Email or Password is WRONG');
      console.log('   - Please check your Shiprocket credentials');
      console.log('   - Make sure you\'re using the account password (not API password)');
    }
  }
};

testShiprocketAuth();
