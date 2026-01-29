// UPI Payment Service
// UPI ID: 7995732336@ibl

const generateOrderId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INF-${timestamp}-${random}`;
};

const generateUpiDeepLink = (orderId, amount) => {
  // Format: upi://pay?pa=upi-id&pn=business-name&am=amount&tr=transaction-ref
  const testUpiId = "7995732336@ibl";  // Infinitly UPI ID
  const businessName = "Infinitly%20Customizations";
  const upiLink = `upi://pay?pa=${testUpiId}&pn=${businessName}&am=${amount}&tr=${orderId}&tn=Order%20${orderId}`;
  return upiLink;
};

const generateQRCodeData = (upiDeepLink) => {
  // Return the UPI deep link itself - this will be used to generate QR code on frontend
  return upiDeepLink;
};

module.exports = {
  generateOrderId,
  generateUpiDeepLink,
  generateQRCodeData
};
