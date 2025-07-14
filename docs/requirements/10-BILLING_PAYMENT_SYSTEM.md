# 💳 BILLING & PAYMENT SYSTEM - COMPREHENSIVE REQUIREMENTS
## Enterprise Subscription Management & Payment Processing

**Created**: July 12, 2025  
**Status**: 🟢 GREENFIELD SPECIFICATION  
**Scope**: Complete billing infrastructure, subscription management, and payment processing  
**Dependencies**: User Management (03-USER_MANAGEMENT_SYSTEM.md), Platform Foundation (01-PLATFORM_FOUNDATION.md)

---

## 📋 EXECUTIVE SUMMARY

The Billing & Payment System provides comprehensive subscription management, flexible pricing models, automated billing cycles, and enterprise-grade payment processing to support ResearchHub's business growth and customer success.

### **🎯 Core Value Proposition**
> "Seamless subscription experience with transparent billing, flexible payment options, and enterprise-grade financial management that scales with research organizations"

### **🏆 Success Metrics**
- **Payment Success Rate**: >99.5% successful transactions
- **Billing Accuracy**: >99.9% accurate billing calculations
- **Customer Satisfaction**: >4.9/5 billing experience rating
- **Revenue Growth**: >25% annual recurring revenue increase

---

## 🗄️ DATABASE SCHEMA

### **Subscription Management Tables**
```sql
-- Subscription plans and pricing tiers
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Plan identification
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(200) NOT NULL,
  
  -- Plan configuration
  plan_type plan_type NOT NULL,
  billing_cycle billing_cycle NOT NULL,
  trial_period_days INTEGER DEFAULT 0,
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Limits and features
  max_studies INTEGER,
  max_participants INTEGER,
  max_team_members INTEGER,
  max_storage_gb INTEGER,
  
  -- Feature flags
  features JSONB DEFAULT '{}',
  integrations_included TEXT[] DEFAULT '{}',
  
  -- Plan status
  is_active BOOLEAN DEFAULT TRUE,
  is_public BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  description TEXT,
  highlights TEXT[] DEFAULT '{}',
  
  -- Stripe integration
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Subscription identification
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Subscription status
  status subscription_status NOT NULL DEFAULT 'trialing',
  
  -- Billing information
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Payment method
  payment_method_id UUID REFERENCES payment_methods(id),
  
  -- Billing configuration
  billing_cycle billing_cycle NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  prorate_charges BOOLEAN DEFAULT TRUE,
  
  -- Usage tracking
  current_studies_count INTEGER DEFAULT 0,
  current_participants_count INTEGER DEFAULT 0,
  current_team_members_count INTEGER DEFAULT 0,
  current_storage_used_gb DECIMAL(10,2) DEFAULT 0,
  
  -- Stripe integration
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason cancellation_reason,
  cancellation_feedback TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id)
);

-- Payment methods storage
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Ownership
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Payment method details
  type payment_method_type NOT NULL,
  
  -- Card details (if applicable)
  card_brand VARCHAR(50),
  card_last_four VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- Bank details (if applicable)
  bank_name VARCHAR(200),
  account_last_four VARCHAR(4),
  
  -- Status
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Stripe integration
  stripe_payment_method_id VARCHAR(255) UNIQUE,
  
  -- Billing address
  billing_address JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice management
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Invoice identification
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  
  -- Invoice details
  status invoice_status NOT NULL DEFAULT 'draft',
  
  -- Amounts
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  amount_due DECIMAL(10,2) NOT NULL,
  
  -- Currency
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Billing period
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  
  -- Payment information
  payment_method_id UUID REFERENCES payment_methods(id),
  
  -- Due dates
  invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_date TIMESTAMP WITH TIME ZONE,
  
  -- Stripe integration
  stripe_invoice_id VARCHAR(255) UNIQUE,
  
  -- Documents
  pdf_url TEXT,
  receipt_url TEXT,
  
  -- Metadata
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Line item details
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  -- Type and period
  item_type line_item_type NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  
  -- Proration
  is_proration BOOLEAN DEFAULT FALSE,
  proration_details JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Transaction identification
  transaction_id VARCHAR(255) NOT NULL UNIQUE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  
  -- Transaction details
  type transaction_type NOT NULL,
  status transaction_status NOT NULL,
  
  -- Amounts
  amount DECIMAL(10,2) NOT NULL,
  fee DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Payment method
  payment_method_id UUID REFERENCES payment_methods(id),
  
  -- Stripe integration
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  
  -- Failure information
  failure_code VARCHAR(100),
  failure_message TEXT,
  
  -- Timestamps
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settled_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Created timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking for billing
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Usage identification
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  
  -- Usage details
  metric_name usage_metric NOT NULL,
  quantity INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Billing period
  billing_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  billing_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Processing status
  is_processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Created timestamp
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(organization_id, metric_name, timestamp)
);

-- Billing alerts and notifications
CREATE TABLE billing_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Alert identification
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  alert_type billing_alert_type NOT NULL,
  
  -- Alert details
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  
  -- Status
  status alert_status NOT NULL DEFAULT 'active',
  acknowledged_by UUID REFERENCES users(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  
  -- Action required
  requires_action BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  
  -- Related entities
  related_invoice_id UUID REFERENCES invoices(id),
  related_subscription_id UUID REFERENCES subscriptions(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Discount and coupon management
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Coupon identification
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  
  -- Coupon type and value
  type coupon_type NOT NULL,
  amount_off DECIMAL(10,2),
  percent_off DECIMAL(5,2),
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Usage limits
  max_redemptions INTEGER,
  times_redeemed INTEGER DEFAULT 0,
  duration coupon_duration NOT NULL,
  duration_in_months INTEGER,
  
  -- Validity
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Applicable plans
  applicable_plans UUID[] DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Stripe integration
  stripe_coupon_id VARCHAR(255),
  
  -- Metadata
  description TEXT,
  created_by UUID REFERENCES users(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription coupon applications
CREATE TABLE subscription_coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Relationship
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id),
  
  -- Application details
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_by UUID NOT NULL REFERENCES users(id),
  
  -- Validity
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  UNIQUE(subscription_id, coupon_id)
);

-- Tax configuration
CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Tax identification
  name VARCHAR(200) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  
  -- Tax details
  percentage DECIMAL(5,4) NOT NULL,
  jurisdiction VARCHAR(200) NOT NULL,
  
  -- Applicability
  country VARCHAR(2) NOT NULL,
  state VARCHAR(100),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Stripe integration
  stripe_tax_rate_id VARCHAR(255),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ENUMs for billing system
CREATE TYPE plan_type AS ENUM ('freemium', 'starter', 'professional', 'enterprise', 'custom');

CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'annually', 'one_time');

CREATE TYPE subscription_status AS ENUM (
  'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused', 'incomplete'
);

CREATE TYPE cancellation_reason AS ENUM (
  'too_expensive', 'missing_features', 'switched_to_competitor', 
  'no_longer_needed', 'poor_support', 'technical_issues', 'other'
);

CREATE TYPE payment_method_type AS ENUM ('card', 'bank_account', 'paypal', 'wire_transfer');

CREATE TYPE invoice_status AS ENUM (
  'draft', 'open', 'paid', 'past_due', 'canceled', 'uncollectible'
);

CREATE TYPE line_item_type AS ENUM (
  'subscription', 'usage', 'setup_fee', 'discount', 'tax', 'credit'
);

CREATE TYPE transaction_type AS ENUM (
  'payment', 'refund', 'chargeback', 'adjustment', 'credit'
);

CREATE TYPE transaction_status AS ENUM (
  'pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'
);

CREATE TYPE usage_metric AS ENUM (
  'studies_created', 'participants_enrolled', 'storage_used_gb', 
  'api_requests', 'team_members', 'integrations_active'
);

CREATE TYPE billing_alert_type AS ENUM (
  'payment_failed', 'invoice_due', 'trial_ending', 'usage_limit', 
  'payment_method_expiring', 'subscription_canceled', 'overage_charges'
);

CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'error', 'critical');

CREATE TYPE alert_status AS ENUM ('active', 'acknowledged', 'resolved', 'expired');

CREATE TYPE coupon_type AS ENUM ('amount_off', 'percent_off');

CREATE TYPE coupon_duration AS ENUM ('once', 'repeating', 'forever');

-- Performance indexes for billing queries
CREATE INDEX idx_subscriptions_organization ON subscriptions(organization_id, status);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_invoices_organization ON invoices(organization_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date, status);
CREATE INDEX idx_payment_methods_organization ON payment_methods(organization_id, is_active);
CREATE INDEX idx_payment_transactions_organization ON payment_transactions(organization_id, processed_at);
CREATE INDEX idx_usage_records_subscription ON usage_records(subscription_id, billing_period_start);
CREATE INDEX idx_billing_alerts_organization ON billing_alerts(organization_id, status, created_at);
CREATE INDEX idx_coupons_code ON coupons(code, is_active);
CREATE INDEX idx_tax_rates_jurisdiction ON tax_rates(country, state, is_active);

-- RLS policies for billing security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Organizations can only see their own billing data
CREATE POLICY billing_org_isolation ON subscriptions
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY invoice_org_isolation ON invoices
  FOR ALL USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Function to calculate subscription charges
CREATE OR REPLACE FUNCTION calculate_subscription_charges(
  subscription_id_param UUID,
  period_start_param TIMESTAMP WITH TIME ZONE,
  period_end_param TIMESTAMP WITH TIME ZONE
) RETURNS JSONB AS $$
DECLARE
  subscription_record subscriptions%ROWTYPE;
  plan_record subscription_plans%ROWTYPE;
  usage_charges DECIMAL(10,2) := 0;
  base_charges DECIMAL(10,2) := 0;
  total_charges DECIMAL(10,2) := 0;
  result JSONB;
BEGIN
  -- Get subscription and plan details
  SELECT * INTO subscription_record 
  FROM subscriptions 
  WHERE id = subscription_id_param;
  
  SELECT * INTO plan_record 
  FROM subscription_plans 
  WHERE id = subscription_record.plan_id;
  
  -- Calculate base charges
  base_charges := subscription_record.unit_price * subscription_record.quantity;
  
  -- Calculate usage charges (if applicable)
  SELECT COALESCE(SUM(
    CASE 
      WHEN ur.metric_name = 'studies_created' AND ur.quantity > plan_record.max_studies THEN
        (ur.quantity - plan_record.max_studies) * 5.00 -- $5 per overage study
      WHEN ur.metric_name = 'participants_enrolled' AND ur.quantity > plan_record.max_participants THEN
        (ur.quantity - plan_record.max_participants) * 0.50 -- $0.50 per overage participant
      WHEN ur.metric_name = 'storage_used_gb' AND ur.quantity > plan_record.max_storage_gb THEN
        (ur.quantity - plan_record.max_storage_gb) * 1.00 -- $1 per GB overage
      ELSE 0
    END
  ), 0) INTO usage_charges
  FROM usage_records ur
  WHERE ur.subscription_id = subscription_id_param
    AND ur.billing_period_start = period_start_param
    AND ur.billing_period_end = period_end_param
    AND ur.is_processed = FALSE;
  
  -- Apply subscription-level discounts
  IF subscription_record.discount_percentage > 0 THEN
    base_charges := base_charges * (1 - subscription_record.discount_percentage / 100);
  END IF;
  
  -- Apply active coupons
  FOR coupon_record IN 
    SELECT c.type, c.amount_off, c.percent_off, c.currency
    FROM subscription_coupons sc
    JOIN coupons c ON c.id = sc.coupon_id
    WHERE sc.subscription_id = subscription_id_param
      AND sc.is_active = TRUE
      AND (sc.ends_at IS NULL OR sc.ends_at > NOW())
  LOOP
    IF coupon_record.type = 'amount_off' THEN
      base_charges := GREATEST(0, base_charges - coupon_record.amount_off);
    ELSIF coupon_record.type = 'percent_off' THEN
      base_charges := base_charges * (1 - coupon_record.percent_off / 100);
    END IF;
  END LOOP;
  
  total_charges := base_charges + usage_charges;
  
  -- Calculate tax if applicable
  DECLARE
    tax_amount DECIMAL(10,2) := 0;
    tax_rate DECIMAL(5,4);
  BEGIN
    SELECT percentage INTO tax_rate
    FROM tax_rates tr
    JOIN organizations o ON o.country = tr.country 
      AND (tr.state IS NULL OR o.state = tr.state)
    WHERE o.id = subscription_record.organization_id
      AND tr.is_active = TRUE
    LIMIT 1;
    
    IF FOUND THEN
      tax_amount := total_charges * tax_rate;
      total_charges := total_charges + tax_amount;
    END IF;
  END;
  
  result := jsonb_build_object(
    'subscription_id', subscription_id_param,
    'base_charges', base_charges,
    'usage_charges', usage_charges,
    'tax_amount', tax_amount,
    'total_charges', total_charges,
    'period_start', period_start_param,
    'period_end', period_end_param,
    'calculation_date', NOW()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to process billing cycle
CREATE OR REPLACE FUNCTION process_billing_cycle(
  subscription_id_param UUID
) RETURNS JSONB AS $$
DECLARE
  subscription_record subscriptions%ROWTYPE;
  invoice_id UUID;
  charges_result JSONB;
  total_amount DECIMAL(10,2);
  line_items JSONB[];
  result JSONB;
BEGIN
  -- Get subscription details
  SELECT * INTO subscription_record 
  FROM subscriptions 
  WHERE id = subscription_id_param
    AND status = 'active';
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Subscription not found or not active');
  END IF;
  
  -- Calculate charges for current period
  charges_result := calculate_subscription_charges(
    subscription_id_param,
    subscription_record.current_period_start,
    subscription_record.current_period_end
  );
  
  total_amount := (charges_result->>'total_charges')::DECIMAL(10,2);
  
  -- Create invoice
  INSERT INTO invoices (
    invoice_number,
    organization_id,
    subscription_id,
    status,
    subtotal,
    tax_amount,
    total_amount,
    amount_due,
    currency,
    period_start,
    period_end,
    payment_method_id,
    invoice_date,
    due_date
  ) VALUES (
    'INV-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('invoice_sequence')::text, 6, '0'),
    subscription_record.organization_id,
    subscription_id_param,
    'open',
    (charges_result->>'base_charges')::DECIMAL(10,2) + (charges_result->>'usage_charges')::DECIMAL(10,2),
    (charges_result->>'tax_amount')::DECIMAL(10,2),
    total_amount,
    total_amount,
    'USD',
    subscription_record.current_period_start,
    subscription_record.current_period_end,
    subscription_record.payment_method_id,
    NOW(),
    NOW() + INTERVAL '30 days'
  ) RETURNING id INTO invoice_id;
  
  -- Create base subscription line item
  INSERT INTO invoice_line_items (
    invoice_id,
    description,
    quantity,
    unit_price,
    amount,
    item_type,
    period_start,
    period_end
  ) VALUES (
    invoice_id,
    'Subscription: ' || (SELECT display_name FROM subscription_plans WHERE id = subscription_record.plan_id),
    subscription_record.quantity,
    subscription_record.unit_price,
    (charges_result->>'base_charges')::DECIMAL(10,2),
    'subscription',
    subscription_record.current_period_start,
    subscription_record.current_period_end
  );
  
  -- Create usage overage line items if applicable
  IF (charges_result->>'usage_charges')::DECIMAL(10,2) > 0 THEN
    INSERT INTO invoice_line_items (
      invoice_id,
      description,
      quantity,
      unit_price,
      amount,
      item_type,
      period_start,
      period_end
    ) VALUES (
      invoice_id,
      'Usage Overages',
      1,
      (charges_result->>'usage_charges')::DECIMAL(10,2),
      (charges_result->>'usage_charges')::DECIMAL(10,2),
      'usage',
      subscription_record.current_period_start,
      subscription_record.current_period_end
    );
  END IF;
  
  -- Create tax line item if applicable
  IF (charges_result->>'tax_amount')::DECIMAL(10,2) > 0 THEN
    INSERT INTO invoice_line_items (
      invoice_id,
      description,
      quantity,
      unit_price,
      amount,
      item_type
    ) VALUES (
      invoice_id,
      'Tax',
      1,
      (charges_result->>'tax_amount')::DECIMAL(10,2),
      (charges_result->>'tax_amount')::DECIMAL(10,2),
      'tax'
    );
  END IF;
  
  -- Update subscription for next period
  UPDATE subscriptions 
  SET 
    current_period_start = current_period_end,
    current_period_end = CASE billing_cycle
      WHEN 'monthly' THEN current_period_end + INTERVAL '1 month'
      WHEN 'quarterly' THEN current_period_end + INTERVAL '3 months'
      WHEN 'annually' THEN current_period_end + INTERVAL '1 year'
      ELSE current_period_end + INTERVAL '1 month'
    END,
    updated_at = NOW()
  WHERE id = subscription_id_param;
  
  -- Mark usage records as processed
  UPDATE usage_records
  SET is_processed = TRUE, processed_at = NOW()
  WHERE subscription_id = subscription_id_param
    AND billing_period_start = subscription_record.current_period_start
    AND billing_period_end = subscription_record.current_period_end;
  
  result := jsonb_build_object(
    'success', true,
    'invoice_id', invoice_id,
    'total_amount', total_amount,
    'charges_breakdown', charges_result
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to handle failed payments
CREATE OR REPLACE FUNCTION handle_failed_payment(
  payment_transaction_id UUID,
  failure_reason TEXT
) RETURNS VOID AS $$
DECLARE
  transaction_record payment_transactions%ROWTYPE;
  invoice_record invoices%ROWTYPE;
  subscription_record subscriptions%ROWTYPE;
  retry_count INTEGER;
BEGIN
  -- Get transaction details
  SELECT * INTO transaction_record
  FROM payment_transactions
  WHERE id = payment_transaction_id;
  
  -- Get related invoice and subscription
  SELECT * INTO invoice_record
  FROM invoices
  WHERE id = transaction_record.invoice_id;
  
  SELECT * INTO subscription_record
  FROM subscriptions
  WHERE id = invoice_record.subscription_id;
  
  -- Update transaction status
  UPDATE payment_transactions
  SET 
    status = 'failed',
    failure_message = failure_reason,
    updated_at = NOW()
  WHERE id = payment_transaction_id;
  
  -- Count retry attempts
  SELECT COUNT(*) INTO retry_count
  FROM payment_transactions
  WHERE invoice_id = transaction_record.invoice_id
    AND status = 'failed';
  
  -- Update invoice status
  IF retry_count >= 3 THEN
    UPDATE invoices
    SET status = 'past_due'
    WHERE id = transaction_record.invoice_id;
    
    -- Update subscription status
    UPDATE subscriptions
    SET status = 'past_due'
    WHERE id = invoice_record.subscription_id;
    
    -- Create billing alert
    INSERT INTO billing_alerts (
      organization_id,
      alert_type,
      title,
      message,
      severity,
      requires_action,
      related_invoice_id,
      related_subscription_id
    ) VALUES (
      subscription_record.organization_id,
      'payment_failed',
      'Payment Failed - Action Required',
      'Multiple payment attempts have failed. Please update your payment method.',
      'critical',
      TRUE,
      transaction_record.invoice_id,
      subscription_record.id
    );
  ELSE
    -- Schedule retry
    INSERT INTO billing_alerts (
      organization_id,
      alert_type,
      title,
      message,
      severity,
      related_invoice_id
    ) VALUES (
      subscription_record.organization_id,
      'payment_failed',
      'Payment Retry Scheduled',
      'Payment failed. We will retry automatically in 3 days.',
      'warning',
      transaction_record.invoice_id
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_sequence START 1;
```

---

## 🎨 UI COMPONENTS ARCHITECTURE

### **BillingDashboard Component**
```typescript
// src/components/billing/BillingDashboard.tsx
interface BillingDashboardProps {
  organization: Organization;
  user: User;
}

interface BillingDashboardState {
  subscription: Subscription | null;
  currentInvoice: Invoice | null;
  recentInvoices: Invoice[];
  paymentMethods: PaymentMethod[];
  usageMetrics: UsageMetrics;
  billingAlerts: BillingAlert[];
  loading: boolean;
  error: string | null;
}

interface UsageMetrics {
  currentPeriod: {
    studiesCreated: number;
    participantsEnrolled: number;
    storageUsedGB: number;
    teamMembers: number;
  };
  limits: {
    maxStudies: number;
    maxParticipants: number;
    maxStorageGB: number;
    maxTeamMembers: number;
  };
  utilizationPercentages: {
    studies: number;
    participants: number;
    storage: number;
    teamMembers: number;
  };
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  organization,
  user
}) => {
  const [state, setState] = useState<BillingDashboardState>({
    subscription: null,
    currentInvoice: null,
    recentInvoices: [],
    paymentMethods: [],
    usageMetrics: {
      currentPeriod: {
        studiesCreated: 0,
        participantsEnrolled: 0,
        storageUsedGB: 0,
        teamMembers: 0
      },
      limits: {
        maxStudies: 0,
        maxParticipants: 0,
        maxStorageGB: 0,
        maxTeamMembers: 0
      },
      utilizationPercentages: {
        studies: 0,
        participants: 0,
        storage: 0,
        teamMembers: 0
      }
    },
    billingAlerts: [],
    loading: true,
    error: null
  });

  const { trackEvent } = useAnalytics();

  useEffect(() => {
    loadBillingData();
  }, [organization.id]);

  const loadBillingData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const [
        subscriptionResponse,
        invoicesResponse,
        paymentMethodsResponse,
        usageResponse,
        alertsResponse
      ] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/billing/invoices?limit=5'),
        fetch('/api/billing/payment-methods'),
        fetch('/api/billing/usage'),
        fetch('/api/billing/alerts?status=active')
      ]);

      const [
        subscriptionData,
        invoicesData,
        paymentMethodsData,
        usageData,
        alertsData
      ] = await Promise.all([
        subscriptionResponse.json(),
        invoicesResponse.json(),
        paymentMethodsResponse.json(),
        usageResponse.json(),
        alertsResponse.json()
      ]);

      setState(prev => ({
        ...prev,
        subscription: subscriptionData.subscription,
        currentInvoice: invoicesData.invoices[0],
        recentInvoices: invoicesData.invoices,
        paymentMethods: paymentMethodsData.paymentMethods,
        usageMetrics: usageData.metrics,
        billingAlerts: alertsData.alerts
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load billing data'
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      const response = await fetch('/api/billing/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      if (!response.ok) throw new Error('Failed to upgrade plan');

      const result = await response.json();
      
      // Handle payment confirmation if needed
      if (result.requiresPayment) {
        // Redirect to payment confirmation
        window.location.href = result.paymentUrl;
        return;
      }

      // Reload billing data
      await loadBillingData();
      
      trackEvent('subscription_upgraded', {
        new_plan_id: planId,
        organization_id: organization.id
      });

    } catch (error) {
      console.error('Plan upgrade failed:', error);
    }
  };

  const handleUpdatePaymentMethod = async (paymentMethodData: any) => {
    try {
      const response = await fetch('/api/billing/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentMethodData)
      });

      if (!response.ok) throw new Error('Failed to update payment method');

      await loadBillingData();
      
      trackEvent('payment_method_updated', {
        organization_id: organization.id
      });

    } catch (error) {
      console.error('Payment method update failed:', error);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/billing/invoices/${invoiceId}/pdf`);
      if (!response.ok) throw new Error('Failed to download invoice');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      trackEvent('invoice_downloaded', { invoice_id: invoiceId });

    } catch (error) {
      console.error('Invoice download failed:', error);
    }
  };

  if (state.loading) {
    return <BillingDashboardSkeleton />;
  }

  if (state.error) {
    return <BillingErrorState error={state.error} onRetry={loadBillingData} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-8">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="mt-2 text-lg text-gray-600">
              Manage your subscription, usage, and billing preferences
            </p>
          </div>
          
          {state.subscription && (
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => handleUpgradePlan('pro')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Upgrade Plan
              </button>
              
              <button
                onClick={() => setState(prev => ({ ...prev, showPaymentModal: true }))}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Methods
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Billing Alerts */}
      {state.billingAlerts.length > 0 && (
        <div className="mb-8">
          <BillingAlerts
            alerts={state.billingAlerts}
            onAcknowledge={async (alertId) => {
              await fetch(`/api/billing/alerts/${alertId}/acknowledge`, { method: 'POST' });
              loadBillingData();
            }}
          />
        </div>
      )}

      {/* Subscription Overview */}
      {state.subscription ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Current Plan */}
          <div className="lg:col-span-2">
            <SubscriptionOverview
              subscription={state.subscription}
              onUpgrade={() => setState(prev => ({ ...prev, showUpgradeModal: true }))}
              onCancel={() => setState(prev => ({ ...prev, showCancelModal: true }))}
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <QuickActions
              subscription={state.subscription}
              onUpdatePayment={() => setState(prev => ({ ...prev, showPaymentModal: true }))}
              onDownloadInvoice={() => state.currentInvoice && handleDownloadInvoice(state.currentInvoice.id)}
              onViewUsage={() => setState(prev => ({ ...prev, showUsageModal: true }))}
            />
          </div>
        </div>
      ) : (
        <SubscriptionSetup
          organization={organization}
          onPlanSelected={handleUpgradePlan}
        />
      )}

      {/* Usage Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <UsageMetricsCard
          metrics={state.usageMetrics}
          subscription={state.subscription}
        />
        
        <UsageHistory
          organization={organization}
          timeRange={{ period: 'month', value: 6 }}
        />
      </div>

      {/* Recent Invoices */}
      <div className="mb-8">
        <RecentInvoices
          invoices={state.recentInvoices}
          onDownload={handleDownloadInvoice}
          onViewAll={() => setState(prev => ({ ...prev, showInvoicesModal: true }))}
        />
      </div>

      {/* Payment Methods */}
      <div className="mb-8">
        <PaymentMethodsSection
          paymentMethods={state.paymentMethods}
          onAdd={() => setState(prev => ({ ...prev, showPaymentModal: true }))}
          onSetDefault={async (paymentMethodId) => {
            await fetch(`/api/billing/payment-methods/${paymentMethodId}/default`, { method: 'POST' });
            loadBillingData();
          }}
          onRemove={async (paymentMethodId) => {
            await fetch(`/api/billing/payment-methods/${paymentMethodId}`, { method: 'DELETE' });
            loadBillingData();
          }}
        />
      </div>

      {/* Modals */}
      {state.showUpgradeModal && (
        <PlanUpgradeModal
          currentSubscription={state.subscription}
          onClose={() => setState(prev => ({ ...prev, showUpgradeModal: false }))}
          onUpgrade={(planId) => {
            handleUpgradePlan(planId);
            setState(prev => ({ ...prev, showUpgradeModal: false }));
          }}
        />
      )}

      {state.showPaymentModal && (
        <PaymentMethodModal
          paymentMethods={state.paymentMethods}
          onClose={() => setState(prev => ({ ...prev, showPaymentModal: false }))}
          onSave={(paymentMethodData) => {
            handleUpdatePaymentMethod(paymentMethodData);
            setState(prev => ({ ...prev, showPaymentModal: false }));
          }}
        />
      )}

      {state.showCancelModal && state.subscription && (
        <SubscriptionCancelModal
          subscription={state.subscription}
          onClose={() => setState(prev => ({ ...prev, showCancelModal: false }))}
          onCancel={async (reason, feedback) => {
            await fetch('/api/billing/subscription/cancel', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reason, feedback })
            });
            loadBillingData();
            setState(prev => ({ ...prev, showCancelModal: false }));
          }}
        />
      )}
    </div>
  );
};
```

### **SubscriptionOverview Component**
```typescript
// src/components/billing/SubscriptionOverview.tsx
interface SubscriptionOverviewProps {
  subscription: Subscription;
  onUpgrade: () => void;
  onCancel: () => void;
}

export const SubscriptionOverview: React.FC<SubscriptionOverviewProps> = ({
  subscription,
  onUpgrade,
  onCancel
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
          {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Plan Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{subscription.plan.displayName}</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Price</span>
              <span className="font-medium">
                {formatCurrency(subscription.unitPrice)} / {subscription.billingCycle}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Billing Cycle</span>
              <span className="font-medium capitalize">{subscription.billingCycle}</span>
            </div>
            
            {subscription.discountPercentage > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-600">
                  -{subscription.discountPercentage}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Billing Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Current Period</span>
              <span className="font-medium">
                {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Next Billing</span>
              <span className="font-medium">
                {formatDate(subscription.currentPeriodEnd)}
              </span>
            </div>
            
            {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
              <div className="flex justify-between">
                <span className="text-gray-600">Trial Ends</span>
                <span className="font-medium text-blue-600">
                  {formatDate(subscription.trialEnd)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Plan Features */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Plan Features</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {subscription.plan.maxStudies === -1 ? '∞' : subscription.plan.maxStudies}
            </div>
            <div className="text-xs text-gray-600">Studies</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {subscription.plan.maxParticipants === -1 ? '∞' : subscription.plan.maxParticipants}
            </div>
            <div className="text-xs text-gray-600">Participants</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {subscription.plan.maxTeamMembers === -1 ? '∞' : subscription.plan.maxTeamMembers}
            </div>
            <div className="text-xs text-gray-600">Team Members</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {subscription.plan.maxStorageGB === -1 ? '∞' : `${subscription.plan.maxStorageGB}GB`}
            </div>
            <div className="text-xs text-gray-600">Storage</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel Subscription
        </button>
        
        <button
          onClick={onUpgrade}
          className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Upgrade Plan
        </button>
      </div>
    </div>
  );
};
```

---

## 🔧 API IMPLEMENTATION

### **Subscription Management API**
```typescript
// api/billing/subscription/index.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createServerSupabaseClient({ req, res });
  
  // Verify authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return handleGetSubscription(req, res, supabase, user);
    case 'POST':
      return handleCreateSubscription(req, res, supabase, user);
    case 'PATCH':
      return handleUpdateSubscription(req, res, supabase, user);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetSubscription(req: any, res: any, supabase: any, user: any) {
  try {
    // Get user's organization
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.organization_id) {
      return res.status(400).json({ error: 'User must belong to an organization' });
    }

    // Get current subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:subscription_plans(*),
        payment_method:payment_methods(*)
      `)
      .eq('organization_id', userProfile.organization_id)
      .single();

    if (error && error.code !== 'PGRST116') { // Not found is ok
      throw error;
    }

    // Get current usage
    let currentUsage = null;
    if (subscription) {
      const { data: usage } = await supabase
        .from('usage_records')
        .select('metric_name, quantity')
        .eq('subscription_id', subscription.id)
        .eq('billing_period_start', subscription.current_period_start);

      currentUsage = usage?.reduce((acc, record) => {
        acc[record.metric_name] = record.quantity;
        return acc;
      }, {});
    }

    return res.status(200).json({
      subscription: subscription ? {
        ...subscription,
        currentUsage
      } : null
    });

  } catch (error) {
    console.error('Get subscription error:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}

async function handleCreateSubscription(req: any, res: any, supabase: any, user: any) {
  try {
    const {
      planId,
      paymentMethodId,
      billingCycle,
      couponCode
    } = req.body;

    // Validate required fields
    if (!planId || !paymentMethodId) {
      return res.status(400).json({ error: 'Plan ID and payment method are required' });
    }

    // Get user's organization
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single();

    if (!userProfile?.organization_id) {
      return res.status(400).json({ error: 'User must belong to an organization' });
    }

    // Check if user has permission to create subscription
    if (!['admin', 'billing_admin'].includes(userProfile.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Get plan details
    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single();

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create Stripe subscription
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    
    const subscriptionData: any = {
      customer: userProfile.organization_id, // Assuming Stripe customer exists
      items: [{
        price: plan.stripe_price_id,
        quantity: 1
      }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        organization_id: userProfile.organization_id,
        plan_id: planId
      }
    };

    // Apply coupon if provided
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode)
        .eq('is_active', true)
        .single();

      if (coupon && coupon.stripe_coupon_id) {
        subscriptionData.coupon = coupon.stripe_coupon_id;
      }
    }

    const stripeSubscription = await stripe.subscriptions.create(subscriptionData);

    // Create subscription record
    const { data: newSubscription, error } = await supabase
      .from('subscriptions')
      .insert({
        organization_id: userProfile.organization_id,
        plan_id: planId,
        status: stripeSubscription.status,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000),
        unit_price: plan.base_price,
        quantity: 1,
        billing_cycle: billingCycle || plan.billing_cycle,
        payment_method_id: paymentMethodId,
        stripe_subscription_id: stripeSubscription.id,
        stripe_customer_id: stripeSubscription.customer
      })
      .select()
      .single();

    if (error) throw error;

    // Apply coupon if used
    if (couponCode) {
      await supabase
        .from('subscription_coupons')
        .insert({
          subscription_id: newSubscription.id,
          coupon_id: coupon.id,
          applied_by: user.id,
          starts_at: new Date(),
          ends_at: coupon.duration === 'once' ? 
            new Date(stripeSubscription.current_period_end * 1000) : null
        });
    }

    // Log subscription creation
    await logBillingActivity(supabase, {
      organizationId: userProfile.organization_id,
      action: 'subscription_created',
      userId: user.id,
      details: { planId, subscriptionId: newSubscription.id }
    });

    return res.status(201).json({
      subscription: newSubscription,
      paymentIntent: stripeSubscription.latest_invoice.payment_intent
    });

  } catch (error) {
    console.error('Create subscription error:', error);
    return res.status(500).json({ error: 'Failed to create subscription' });
  }
}
```

### **Invoice Management API**
```typescript
// api/billing/invoices/index.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { limit = '10', offset = '0', status = '', date_from = '', date_to = '' } = req.query;

    const supabase = createServerSupabaseClient({ req, res });
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's organization
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (!userProfile?.organization_id) {
      return res.status(400).json({ error: 'User must belong to an organization' });
    }

    // Build query
    let query = supabase
      .from('invoices')
      .select(`
        *,
        line_items:invoice_line_items(*),
        payment_method:payment_methods(*)
      `)
      .eq('organization_id', userProfile.organization_id)
      .range(parseInt(offset as string), parseInt(offset as string) + parseInt(limit as string) - 1)
      .order('invoice_date', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (date_from) {
      query = query.gte('invoice_date', date_from);
    }

    if (date_to) {
      query = query.lte('invoice_date', date_to);
    }

    const { data: invoices, error } = await query;

    if (error) throw error;

    // Calculate totals
    const { data: totals } = await supabase
      .from('invoices')
      .select('total_amount, amount_paid, status')
      .eq('organization_id', userProfile.organization_id);

    const summary = totals?.reduce((acc, invoice) => {
      acc.totalInvoiced += invoice.total_amount;
      acc.totalPaid += invoice.amount_paid;
      if (invoice.status === 'open') acc.totalOutstanding += (invoice.total_amount - invoice.amount_paid);
      return acc;
    }, { totalInvoiced: 0, totalPaid: 0, totalOutstanding: 0 });

    return res.status(200).json({
      invoices: invoices || [],
      summary,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        hasMore: (invoices?.length || 0) === parseInt(limit as string)
      }
    });

  } catch (error) {
    console.error('Get invoices error:', error);
    return res.status(500).json({ error: 'Failed to fetch invoices' });
  }
}
```

---

## 🧪 TESTING SPECIFICATIONS

### **Billing Dashboard Testing**
```typescript
// tests/billing/billing-dashboard.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BillingDashboard } from '@/components/billing/BillingDashboard';
import { mockUser, mockOrganization, mockSubscription } from '@/test-utils/mocks';

describe('BillingDashboard', () => {
  beforeEach(() => {
    fetchMock.mockImplementation((url) => {
      if (url.includes('/api/billing/subscription')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ subscription: mockSubscription })
        });
      }
      if (url.includes('/api/billing/invoices')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ invoices: [] })
        });
      }
      return Promise.reject(new Error('Not mocked'));
    });
  });

  it('should display subscription overview', async () => {
    render(
      <BillingDashboard 
        user={mockUser} 
        organization={mockOrganization} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Billing & Subscription')).toBeInTheDocument();
    });

    expect(screen.getByText(mockSubscription.plan.displayName)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should handle plan upgrade', async () => {
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true })
      })
    );

    render(
      <BillingDashboard 
        user={mockUser} 
        organization={mockOrganization} 
      />
    );

    const upgradeButton = await screen.findByText('Upgrade Plan');
    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/billing/subscription/upgrade',
        expect.objectContaining({
          method: 'POST'
        })
      );
    });
  });

  it('should display usage metrics', async () => {
    const mockUsage = {
      currentPeriod: {
        studiesCreated: 5,
        participantsEnrolled: 150,
        storageUsedGB: 2.5,
        teamMembers: 3
      },
      limits: {
        maxStudies: 10,
        maxParticipants: 500,
        maxStorageGB: 10,
        maxTeamMembers: 5
      }
    };

    fetchMock.mockImplementation((url) => {
      if (url.includes('/api/billing/usage')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ metrics: mockUsage })
        });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });

    render(
      <BillingDashboard 
        user={mockUser} 
        organization={mockOrganization} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('5 / 10')).toBeInTheDocument(); // Studies usage
      expect(screen.getByText('150 / 500')).toBeInTheDocument(); // Participants usage
    });
  });
});
```

### **Subscription API Testing**
```typescript
// tests/billing/subscription-api.test.ts
describe('Subscription API', () => {
  it('should create a new subscription', async () => {
    const mockPlan = {
      id: 'plan-1',
      stripe_price_id: 'price_123',
      base_price: 29.99
    };

    const mockStripeSubscription = {
      id: 'sub_123',
      status: 'active',
      current_period_start: Math.floor(Date.now() / 1000),
      current_period_end: Math.floor(Date.now() / 1000) + 2592000, // 30 days
      customer: 'cus_123'
    };

    // Mock Supabase calls
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'subscription_plans') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: mockPlan })
              })
            })
          })
        };
      }
      if (table === 'subscriptions') {
        return {
          insert: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: { id: 'sub-1', ...mockStripeSubscription } })
            })
          })
        };
      }
    });

    // Mock Stripe
    const mockStripe = {
      subscriptions: {
        create: jest.fn().mockResolvedValue(mockStripeSubscription)
      }
    };

    const response = await request(app)
      .post('/api/billing/subscription')
      .send({
        planId: 'plan-1',
        paymentMethodId: 'pm-1',
        billingCycle: 'monthly'
      })
      .expect(201);

    expect(response.body.subscription).toBeDefined();
    expect(mockStripe.subscriptions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ price: 'price_123', quantity: 1 }]
      })
    );
  });

  it('should handle subscription upgrade', async () => {
    const response = await request(app)
      .post('/api/billing/subscription/upgrade')
      .send({
        planId: 'plan-pro'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('should calculate prorated charges correctly', async () => {
    const charges = await calculateSubscriptionCharges(
      'sub-1',
      new Date(),
      new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days
    );

    expect(charges.base_charges).toBeGreaterThan(0);
    expect(charges.total_charges).toEqual(charges.base_charges + charges.usage_charges);
  });
});
```

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### **Billing System KPIs**
```typescript
interface BillingSystemKPIs {
  reliability: {
    paymentSuccessRate: number; // Target: >99.5%
    billingAccuracy: number; // Target: >99.9%
    invoiceDeliveryRate: number; // Target: >99.8%
    systemUptime: number; // Target: >99.99%
  };
  
  customerExperience: {
    billingExperienceRating: number; // Target: >4.9/5
    timeToFirstPayment: number; // Target: <5 minutes
    supportTicketVolume: number; // Target: <2% of customers
    churnRateReduction: number; // Target: <5% annually
  };
  
  businessMetrics: {
    revenueGrowth: number; // Target: >25% annually
    customerLifetimeValue: number; // Target: >$2,000
    paymentRecoveryRate: number; // Target: >70%
    subscriptionRetention: number; // Target: >90% annually
  };
  
  operationalEfficiency: {
    automatedBillingPercentage: number; // Target: >95%
    manualInterventionRate: number; // Target: <1%
    reconciliationAccuracy: number; // Target: >99.9%
    billingCycleTime: number; // Target: <24 hours
  };
}
```

### **Financial Performance Targets**
```typescript
const BILLING_PERFORMANCE_TARGETS = {
  paymentProcessing: {
    target: '<3 seconds',
    measurement: 'Average payment processing time',
    acceptance: '95th percentile under target'
  },
  
  billingAccuracy: {
    target: '>99.9%',
    measurement: 'Accurate billing calculations',
    acceptance: 'Monthly accuracy above target'
  },
  
  customerSupport: {
    target: '<2% tickets',
    measurement: 'Billing-related support volume',
    acceptance: 'Monthly support volume under target'
  },
  
  revenueRecognition: {
    target: '<24 hours',
    measurement: 'Time to revenue recognition',
    acceptance: 'Daily processing under target'
  }
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Core Billing Infrastructure (Week 1)**
- [ ] Subscription management system
- [ ] Payment method handling
- [ ] Basic invoice generation
- [ ] Stripe integration
- [ ] Usage tracking foundation

### **Phase 2: Advanced Billing Features (Week 2)**
- [ ] Prorated billing calculations
- [ ] Coupon and discount system
- [ ] Tax calculation engine
- [ ] Payment retry logic
- [ ] Billing alerts system

### **Phase 3: Customer Experience (Week 3)**
- [ ] Billing dashboard UI
- [ ] Self-service plan changes
- [ ] Invoice download/email
- [ ] Payment method management
- [ ] Usage analytics

### **Phase 4: Enterprise Features (Week 4)**
- [ ] Multi-currency support
- [ ] Enterprise billing workflows
- [ ] Advanced reporting
- [ ] Revenue analytics
- [ ] Compliance features

---

**💳 BILLING & PAYMENT SYSTEM: Powering sustainable growth with seamless subscription management, transparent billing, and enterprise-grade payment processing that delights customers and drives business success.**
