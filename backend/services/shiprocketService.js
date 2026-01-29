// Shiprocket Integration Service
// Documentation: https://shiprocket.in/
// API Base URL: https://apiv2.shiprocket.in

const axios = require('axios');

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

let shiprocketToken = null;
let tokenExpiry = null;

// Authenticate with Shiprocket
const authenticateShiprocket = async () => {
  try {
    // Return cached token if valid
    if (shiprocketToken && tokenExpiry && Date.now() < tokenExpiry) {
      return shiprocketToken;
    }

    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD
    });

    shiprocketToken = response.data.token;
    tokenExpiry = Date.now() + (12 * 60 * 60 * 1000); // Token valid for 12 hours

    return shiprocketToken;
  } catch (error) {
    console.error('Shiprocket Auth Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

// Create order in Shiprocket
const createShiprocketOrder = async (orderData) => {
  try {
    const token = await authenticateShiprocket();

    const payload = {
      order_id: orderData._id.toString(),
      order_date: orderData.createdAt,
      pickup_location: 'Default',
      channel_id: '', // Can be set if specific channel
      comment: orderData.adminNotes || '',
      billing_customer_name: orderData.customerName,
      billing_email: orderData.email,
      billing_phone: orderData.phoneNumber,
      billing_address: orderData.address,
      billing_address_2: '',
      billing_city: orderData.city,
      billing_pincode: orderData.pincode,
      billing_state: orderData.state,
      billing_country: 'India',
      shipping_is_billing: true,
      order_items: orderData.items.map(item => ({
        name: item.productName,
        sku: item.productId.toString(),
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn_code: ''
      })),
      payment_method: orderData.paymentMethod.toUpperCase(),
      shipping_charges: orderData.shippingCost,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: orderData.subtotal,
      length: 5,
      breadth: 5,
      height: 5,
      weight: 0.5
    };

    const response = await axios.post(`${SHIPROCKET_BASE_URL}/orders/create/adhoc`, payload, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      success: true,
      shiprocketOrderId: response.data.order_id,
      trackingNumber: response.data.shipment_id,
      data: response.data
    };
  } catch (error) {
    console.error('Shiprocket Order Creation Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
};

// Get shipment details
const getShipmentDetails = async (shipmentId) => {
  try {
    const token = await authenticateShiprocket();

    const response = await axios.get(`${SHIPROCKET_BASE_URL}/shipments/${shipmentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Shiprocket Get Shipment Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Cancel shipment
const cancelShipment = async (shipmentId) => {
  try {
    const token = await authenticateShiprocket();

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/shipments/${shipmentId}/cancel`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Shiprocket Cancel Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate manifest
const generateManifest = async (shipmentIds) => {
  try {
    const token = await authenticateShiprocket();

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/manifests/generate`,
      { shipment_ids: shipmentIds },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return {
      success: true,
      manifestId: response.data.manifest_id,
      data: response.data
    };
  } catch (error) {
    console.error('Shiprocket Manifest Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  createShiprocketOrder,
  getShipmentDetails,
  cancelShipment,
  generateManifest
};
