# Wallet Integration Documentation

## 📋 Overview

The wallet integration provides a complete financial management system for participants in the ResearchHub platform. Participants can view their earnings, track transactions, and request withdrawals through a user-friendly interface.

## 🏗️ Architecture

### Backend API (d:/MAMP/AfakarM/api/wallets.js)
- **Endpoint**: `/api/wallets`
- **Database**: Supabase with participant_wallets, wallet_transactions, and withdrawal_requests tables
- **Security**: Row Level Security (RLS) policies ensuring participants can only access their own data

### Frontend Components
```
src/client/
├── services/wallet.service.ts       # API client service
├── hooks/useWallet.ts              # React hook for wallet state
├── components/wallet/
│   ├── WalletOverview.tsx          # Balance and earnings display
│   ├── WithdrawalForm.tsx          # Withdrawal request form
│   ├── WithdrawalHistory.tsx       # Withdrawal status tracking
│   └── TransactionHistory.tsx      # Transaction log display
└── pages/studies/ParticipantDashboardPage.tsx  # Main integration point
```

## 🔌 API Endpoints

### GET /api/wallets?action=wallet
**Description**: Get participant's wallet information
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "participant_id": "uuid", 
    "balance": 125.50,
    "total_earned": 200.00,
    "total_withdrawn": 74.50,
    "currency": "USD",
    "created_at": "2025-07-06T10:30:00Z",
    "updated_at": "2025-07-06T10:30:00Z"
  }
}
```

### GET /api/wallets?action=transactions
**Description**: Get participant's transaction history
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "transaction_type": "earning",
      "amount": 25.00,
      "balance_before": 100.00,
      "balance_after": 125.00,
      "description": "Study completion reward",
      "reference_type": "study_completion",
      "reference_id": "study_uuid",
      "created_at": "2025-07-06T10:30:00Z"
    }
  ]
}
```

### GET /api/wallets?action=withdrawals
**Description**: Get participant's withdrawal history
**Authentication**: Required
**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 50.00,
      "status": "pending",
      "payment_method": "paypal",
      "payment_details": {"email": "user@example.com"},
      "requested_at": "2025-07-06T10:30:00Z",
      "admin_notes": null
    }
  ]
}
```

### POST /api/wallets?action=create-withdrawal
**Description**: Create a new withdrawal request
**Authentication**: Required
**Request Body**:
```json
{
  "amount": 50.00,
  "payment_method": "paypal",
  "payment_details": {
    "email": "user@example.com"
  }
}
```

## 🔧 Implementation Details

### Database Schema

#### participant_wallets
```sql
CREATE TABLE participant_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES auth.users(id),
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_earned DECIMAL(10,2) DEFAULT 0.00,
  total_withdrawn DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### wallet_transactions
```sql
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES participant_wallets(id),
  transaction_type VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_before DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  description TEXT,
  reference_type VARCHAR(50),
  reference_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);
```

#### withdrawal_requests
```sql
CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES auth.users(id),
  wallet_id UUID NOT NULL REFERENCES participant_wallets(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50) NOT NULL,
  payment_details JSONB NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT
);
```

### Row Level Security (RLS) Policies

All tables have RLS policies ensuring:
- Participants can only access their own wallet data
- Admin users can access all data for management purposes
- Researchers cannot access wallet data (separation of concerns)

## 🎨 UI Components

### WalletOverview Component
**Purpose**: Display wallet balance, earnings, and withdrawal status
**Features**:
- Real-time balance display
- Toggle balance visibility
- Withdrawal eligibility status
- Quick stats (total earned, total withdrawn)

### WithdrawalForm Component  
**Purpose**: Allow participants to request withdrawals
**Features**:
- Multiple payment methods (PayPal, Bank Transfer, Crypto)
- Form validation and error handling
- Minimum withdrawal amount enforcement
- Processing fee calculation

### TransactionHistory Component
**Purpose**: Display detailed transaction history
**Features**:
- Transaction filtering by type
- Formatted currency display
- Transaction type icons and colors
- Chronological ordering

### WithdrawalHistory Component
**Purpose**: Track withdrawal request status
**Features**:
- Status badges and icons
- Payment method display
- Admin notes visibility
- Date formatting

## 🔒 Security Features

### Authentication
- All API calls require valid JWT tokens
- Token validation on every request
- Automatic token refresh handling

### Authorization
- RLS policies prevent unauthorized data access
- Participant-specific data isolation
- Admin-only access for sensitive operations

### Data Validation
- Input sanitization on all forms
- Server-side validation for all requests
- Proper error handling and user feedback

## 🧪 Testing

### Test Interface
**File**: `wallet-integration-test.html`
**Purpose**: Manual testing of all wallet API endpoints
**Features**:
- Authentication testing
- API endpoint verification
- Response data validation
- Error handling verification

### Test Account
**Email**: abwanwr77+participant@gmail.com
**Password**: Testtest123
**Role**: participant

### Test Commands
```bash
# Start development server
npm run dev:fullstack

# Test API health
curl http://localhost:3003/api/health

# Open test interface
# Navigate to: file:///d:/MAMP/AfakarM/wallet-integration-test.html
```

## 🚀 Deployment

### Environment Variables
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Database Migrations
1. Run the participant wallets migration: `database/migrations/participant-wallets.sql`
2. Verify RLS policies are active
3. Test with participant accounts

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies active
- [ ] API endpoints responding
- [ ] Frontend components functional
- [ ] Payment methods configured
- [ ] Test transactions verified

## 🛠️ Development Guidelines

### Adding New Payment Methods
1. Update `CreateWithdrawalRequest` interface in `wallet.service.ts`
2. Add payment method to `WithdrawalForm` component
3. Update validation logic
4. Test with new payment method

### Adding New Transaction Types
1. Update `Transaction` interface in `wallet.service.ts`
2. Add transaction type to database enum
3. Update transaction display logic
4. Add appropriate icons and colors

### Modifying Wallet Logic
1. Update backend API in `api/wallets.js`
2. Update frontend service in `wallet.service.ts`
3. Update React hook in `useWallet.ts`
4. Update UI components as needed
5. Test end-to-end functionality

## 📊 Monitoring & Analytics

### Key Metrics
- Total wallet balance across all participants
- Transaction volume and frequency
- Withdrawal completion rates
- Payment method usage statistics

### Logging
- All wallet operations are logged
- Error tracking for failed transactions
- Audit trail for withdrawal processing

## 🔮 Future Enhancements

### Phase 1
- Real-time balance updates via WebSocket
- Email notifications for wallet events
- Advanced transaction filtering

### Phase 2
- Multi-currency support
- Integration with external payment processors
- Automated withdrawal processing

### Phase 3
- Mobile app wallet functionality
- Blockchain-based transactions
- Advanced analytics dashboard

## 📞 Support

### Common Issues
1. **Wallet not loading**: Check authentication token
2. **Withdrawal failed**: Verify minimum balance and payment details
3. **Transactions missing**: Check RLS policies and user permissions

### Debug Steps
1. Check browser console for errors
2. Verify API responses in Network tab
3. Test with wallet integration test interface
4. Check Supabase dashboard for data

### Contact
For technical issues or questions about the wallet integration, refer to the project documentation or create an issue in the project repository.

---

**Last Updated**: July 6, 2025
**Status**: Production Ready ✅
**Version**: 1.0.0