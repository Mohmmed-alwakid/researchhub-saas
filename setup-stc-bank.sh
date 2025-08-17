#!/bin/bash

# STC Bank Integration Setup Script
# Run this after completing the integration

echo "🏦 STC Bank Payment Integration Setup"
echo "===================================="

# Check if required files exist
echo "✅ Checking integration files..."

files=(
    "api/stc-bank-integration.js"
    "src/client/components/payments/STCBankPaymentFlow.tsx"
    "src/client/components/payments/PaymentResultPage.tsx"
    "test-stc-bank-integration.html"
    "STC_BANK_INTEGRATION_GUIDE.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

echo ""
echo "📋 Next Steps:"
echo "1. Add STC Bank credentials to your .env file:"
echo "   - STC_BANK_MERCHANT_ID=your_merchant_id"
echo "   - STC_BANK_API_KEY=your_api_key"  
echo "   - STC_BANK_SECRET_KEY=your_secret_key"
echo "   - STC_BANK_WEBHOOK_SECRET=your_webhook_secret"
echo "   - STC_BANK_ENVIRONMENT=sandbox"
echo ""
echo "2. Test the integration:"
echo "   - Open test-stc-bank-integration.html in your browser"
echo "   - Run the API tests to verify connectivity"
echo ""
echo "3. Configure webhook URL in STC Bank dashboard:"
echo "   - Webhook URL: https://your-domain.com/api/payments-consolidated-full?action=stc-webhook"
echo ""
echo "4. Update your frontend components to use STC Bank:"
echo "   - Import STCBankPaymentFlow component"
echo "   - Use stcBankService for payment operations"
echo ""
echo "📖 Read STC_BANK_INTEGRATION_GUIDE.md for detailed instructions"
echo ""
echo "🚀 Ready to accept payments with STC Bank!"
