# STC Bank Payment Gateway Integration Guide

## Overview

This guide explains how to integrate STC Bank payment gateway (https://merchant.stcbank.com.sa) into your ResearchHub platform. The integration supports both STC Bank and DodoPayments side by side, allowing you to choose your preferred payment provider.

## 🔧 Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Payment Gateway Configuration
DEFAULT_PAYMENT_PROVIDER=stcbank

# STC Bank Payment Gateway
STC_BANK_MERCHANT_ID=your_stc_merchant_id
STC_BANK_API_KEY=your_stc_api_key
STC_BANK_SECRET_KEY=your_stc_secret_key
STC_BANK_WEBHOOK_SECRET=your_stc_webhook_secret
STC_BANK_ENVIRONMENT=sandbox
# STC_BANK_ENVIRONMENT=production (use this for live transactions)

# Frontend and API URLs
FRONTEND_URL=https://researchhub-saas.vercel.app
API_URL=https://researchhub-saas.vercel.app
```

### 2. STC Bank Account Setup

1. **Open STC Bank Merchant Account**: You mentioned you already have an account at https://merchant.stcbank.com.sa
2. **Get API Credentials**: From your STC Bank merchant dashboard, obtain:
   - Merchant ID
   - API Key
   - Secret Key
   - Webhook Secret
3. **Configure Webhooks**: Set your webhook URL to:
   ```
   https://your-domain.com/api/payments-consolidated-full?action=stc-webhook
   ```

### 3. API Integration

The integration includes these new API endpoints:

#### Create STC Bank Payment Intent
```
POST /api/payments-consolidated-full?action=stc-create-payment

{
  "amount": 100.00,
  "currency": "SAR",
  "description": "ResearchHub Payment",
  "metadata": {
    "user_id": "123",
    "study_id": "456"
  }
}
```

#### Verify Payment Status
```
GET /api/payments-consolidated-full?action=stc-verify-payment&payment_id=PAYMENT_ID
```

#### Process Refund
```
POST /api/payments-consolidated-full?action=stc-refund

{
  "payment_id": "stc_payment_id",
  "amount": 50.00,
  "reason": "Customer request"
}
```

#### Webhook Handler
```
POST /api/payments-consolidated-full?action=stc-webhook
```

## 🎨 Frontend Components

### 1. STCBankPaymentFlow Component

Use the `STCBankPaymentFlow` component for handling payments:

```tsx
import STCBankPaymentFlow from './components/payments/STCBankPaymentFlow';

function PaymentPage() {
  return (
    <STCBankPaymentFlow
      amount={100.00}
      currency="SAR"
      description="Study Creation Payment"
      metadata={{ user_id: "123", study_id: "456" }}
      onSuccess={(paymentId) => {
        console.log('Payment successful:', paymentId);
        // Handle success
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
        // Handle error
      }}
      onCancel={() => {
        console.log('Payment cancelled');
        // Handle cancellation
      }}
    />
  );
}
```

### 2. PaymentResultPage Component

For handling payment results:

```tsx
import PaymentResultPage from './components/payments/PaymentResultPage';

function PaymentSuccess() {
  return (
    <PaymentResultPage
      type="success"
      paymentId="stc_payment_id"
      onContinue={() => router.push('/dashboard')}
    />
  );
}
```

## 💼 Service Integration

### Using the STC Bank Service

```typescript
import { stcBankService } from './services/payment.service';

// Create payment intent
const result = await stcBankService.createPaymentIntent(
  100.00,           // amount
  'SAR',           // currency
  'Study Payment', // description
  { user_id: '123' } // metadata
);

if (result.success && result.paymentIntent) {
  // Redirect to payment page
  stcBankService.redirectToPayment(result.paymentIntent);
}

// Verify payment
const verification = await stcBankService.verifyPayment('payment_id');

// Process refund
const refund = await stcBankService.processRefund('payment_id', 50.00, 'Partial refund');
```

## 🔐 Security Features

### 1. Webhook Signature Verification

All webhooks are verified using HMAC-SHA256 signatures:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

### 2. Request Signing

All API requests to STC Bank are signed with your secret key for authentication.

## 🌍 Multi-Currency Support

The integration supports multiple currencies:

- **SAR** (Saudi Riyal) - Primary currency
- **USD** (US Dollar)
- **EUR** (Euro)

Currency conversion happens automatically based on STC Bank's rates.

## 📊 Payment Flow

1. **Create Payment Intent**: Frontend calls API to create payment intent
2. **Redirect to STC Bank**: User is redirected to STC Bank's secure payment page
3. **User Completes Payment**: User enters payment details on STC Bank's page
4. **Webhook Notification**: STC Bank sends webhook to your server
5. **Payment Verification**: Your system verifies the payment status
6. **Success/Failure Handling**: User is redirected back with payment result

## 🧪 Testing

### Sandbox Mode

For testing, use the sandbox environment:

```bash
STC_BANK_ENVIRONMENT=sandbox
```

### Test Payment Scenarios

The integration includes simulation mode for development:

```javascript
// In development, payments are automatically simulated
const paymentIntent = await stcBankService.createPaymentIntent(100, 'SAR');
// Returns a simulated payment intent for testing
```

## 🚀 Production Deployment

### 1. Switch to Production

```bash
STC_BANK_ENVIRONMENT=production
```

### 2. Update Webhook URLs

Configure your production webhook URL in STC Bank dashboard:
```
https://your-production-domain.com/api/payments-consolidated-full?action=stc-webhook
```

### 3. SSL Certificate

Ensure your domain has a valid SSL certificate for secure webhook delivery.

## 📝 Event Handling

### Webhook Events

The integration handles these STC Bank webhook events:

- `payment.completed` / `payment.success`: Payment successfully processed
- `payment.failed` / `payment.declined`: Payment failed
- `refund.processed`: Refund successfully processed

### Example Webhook Handler

```javascript
switch (event_type) {
  case 'payment.completed':
    // Update database with successful payment
    await updatePaymentStatus(data.payment_id, 'completed');
    // Credit user account or unlock content
    break;
    
  case 'payment.failed':
    // Handle failed payment
    await updatePaymentStatus(data.payment_id, 'failed');
    // Notify user of failure
    break;
    
  case 'refund.processed':
    // Handle successful refund
    await processRefundInDatabase(data.refund_id);
    break;
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Invalid API Credentials**
   - Verify your STC_BANK_API_KEY and STC_BANK_SECRET_KEY
   - Ensure you're using the correct environment (sandbox vs production)

2. **Webhook Signature Verification Failed**
   - Check your STC_BANK_WEBHOOK_SECRET
   - Ensure payload is not modified before verification

3. **Payment Redirect Issues**
   - Verify FRONTEND_URL is correctly set
   - Check success/failure URLs in payment intent

4. **Currency Issues**
   - Ensure currency codes are uppercase (SAR, USD, EUR)
   - Verify amounts are in the correct format (decimal, not cents)

### Debug Mode

Enable debug logging by adding console.log statements in the STC Bank API wrapper.

## 📚 Additional Resources

- [STC Bank Merchant Portal](https://merchant.stcbank.com.sa)
- [STC Bank API Documentation](https://developer.stcbank.com.sa) (if available)
- [ResearchHub Payment System Documentation](./PAYMENT_SYSTEM_DOCS.md)

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Review server logs for API errors
3. Verify webhook delivery in STC Bank dashboard
4. Test with smaller amounts first
5. Contact STC Bank support for API-specific issues

## 🔄 Migration from DodoPayments

The integration is designed to work alongside DodoPayments. You can:

1. Keep both payment providers active
2. Set DEFAULT_PAYMENT_PROVIDER to choose the default
3. Allow users to select their preferred payment method
4. Gradually migrate users to STC Bank

Both systems share the same database structure and user interface patterns.
