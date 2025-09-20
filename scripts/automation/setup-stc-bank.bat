@echo off
echo 🏦 STC Bank Payment Integration Setup
echo ====================================

echo ✅ Checking integration files...

if exist "api\stc-bank-integration.js" (
    echo ✅ api\stc-bank-integration.js exists
) else (
    echo ❌ api\stc-bank-integration.js missing
)

if exist "src\client\components\payments\STCBankPaymentFlow.tsx" (
    echo ✅ STCBankPaymentFlow.tsx exists
) else (
    echo ❌ STCBankPaymentFlow.tsx missing
)

if exist "src\client\components\payments\PaymentResultPage.tsx" (
    echo ✅ PaymentResultPage.tsx exists
) else (
    echo ❌ PaymentResultPage.tsx missing
)

if exist "test-stc-bank-integration.html" (
    echo ✅ test-stc-bank-integration.html exists
) else (
    echo ❌ test-stc-bank-integration.html missing
)

if exist "STC_BANK_INTEGRATION_GUIDE.md" (
    echo ✅ STC_BANK_INTEGRATION_GUIDE.md exists
) else (
    echo ❌ STC_BANK_INTEGRATION_GUIDE.md missing
)

echo.
echo 📋 Next Steps:
echo 1. Add STC Bank credentials to your .env file:
echo    - STC_BANK_MERCHANT_ID=your_merchant_id
echo    - STC_BANK_API_KEY=your_api_key
echo    - STC_BANK_SECRET_KEY=your_secret_key
echo    - STC_BANK_WEBHOOK_SECRET=your_webhook_secret
echo    - STC_BANK_ENVIRONMENT=sandbox
echo.
echo 2. Test the integration:
echo    - Open test-stc-bank-integration.html in your browser
echo    - Run the API tests to verify connectivity
echo.
echo 3. Configure webhook URL in STC Bank dashboard:
echo    - Webhook URL: https://your-domain.com/api/payments-consolidated-full?action=stc-webhook
echo.
echo 4. Update your frontend components to use STC Bank:
echo    - Import STCBankPaymentFlow component
echo    - Use stcBankService for payment operations
echo.
echo 📖 Read STC_BANK_INTEGRATION_GUIDE.md for detailed instructions
echo.
echo 🚀 Ready to accept payments with STC Bank!
pause
