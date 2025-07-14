# 🔐 AUTHENTICATION SYSTEM - COMPREHENSIVE REQUIREMENTS
## Security-First User Authentication & Authorization

**Created**: July 12, 2025  
**Status**: 🟢 GREENFIELD SPECIFICATION  
**Scope**: Complete authentication, authorization, and user security  
**Dependencies**: Platform Foundation (01-PLATFORM_FOUNDATION.md)

---

## 📋 EXECUTIVE SUMMARY

The Authentication System provides enterprise-grade security with consumer-grade simplicity, enabling secure access to ResearchHub while maintaining excellent user experience across all devices and use cases.

### **🎯 Core Value Proposition**
> "Seamless, secure authentication that users trust and admins can rely on"

### **🏆 Success Metrics**
- **Login Success Rate**: >99% first-attempt login success
- **Security Score**: Zero critical vulnerabilities
- **User Experience**: <5 seconds from login to dashboard
- **Account Recovery**: >95% successful password resets

---

## 🗄️ DATABASE SCHEMA

### **Authentication Tables**
```sql
-- Enhanced users table for authentication
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'participant',
  status user_status NOT NULL DEFAULT 'pending_verification',
  
  -- Security fields
  password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  
  -- 2FA settings
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  backup_codes TEXT[],
  
  -- Security preferences
  security_preferences JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP WITH TIME ZONE
);

-- Login sessions tracking
CREATE TABLE login_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT,
  
  -- Session metadata
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  location_data JSONB,
  
  -- Session timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  terminated_at TIMESTAMP WITH TIME ZONE,
  termination_reason VARCHAR(100)
);

-- Password reset tokens
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email verification tokens
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security events logging
CREATE TYPE security_event_type AS ENUM (
  'login_success',
  'login_failure',
  'password_reset_requested',
  'password_changed',
  'email_verified',
  'two_factor_enabled',
  'two_factor_disabled',
  'account_locked',
  'suspicious_activity'
);

CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type security_event_type NOT NULL,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  risk_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OAuth connections
CREATE TABLE oauth_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE,
  UNIQUE(provider, provider_user_id)
);

-- Indexes for performance and security
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_last_login ON users(last_login);
CREATE INDEX idx_login_sessions_user ON login_sessions(user_id);
CREATE INDEX idx_login_sessions_token ON login_sessions(session_token);
CREATE INDEX idx_login_sessions_active ON login_sessions(is_active, expires_at);
CREATE INDEX idx_security_events_user ON security_events(user_id, created_at);
CREATE INDEX idx_security_events_type ON security_events(event_type, created_at);
CREATE INDEX idx_oauth_connections_user ON oauth_connections(user_id);
```

---

## 🎨 UI COMPONENTS ARCHITECTURE

### **LoginForm Component**
```typescript
// src/components/auth/LoginForm.tsx
interface LoginFormProps {
  onSuccess: (user: User) => void;
  onError: (error: string) => void;
  redirectTo?: string;
  showSignupLink?: boolean;
}

interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
  isLoading: boolean;
  errors: Record<string, string>;
  showPassword: boolean;
  captchaToken?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  redirectTo = '/dashboard',
  showSignupLink = true
}) => {
  const [state, setState] = useState<LoginFormState>({
    email: '',
    password: '',
    rememberMe: false,
    isLoading: false,
    errors: {},
    showPassword: false
  });

  const { login } = useAuth();
  const captcha = useRecaptcha();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!state.email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(state.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!state.password) {
      errors.password = 'Password is required';
    } else if (state.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setState(prev => ({ ...prev, isLoading: true, errors: {} }));
    
    try {
      // Get reCAPTCHA token for suspicious activity protection
      const captchaToken = await captcha.getToken();
      
      const result = await login({
        email: state.email,
        password: state.password,
        rememberMe: state.rememberMe,
        captchaToken
      });
      
      if (result.success) {
        // Log successful login
        await logSecurityEvent('login_success', {
          email: state.email,
          rememberMe: state.rememberMe
        });
        
        onSuccess(result.user);
      } else {
        throw new Error(result.error);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Log failed login attempt
      await logSecurityEvent('login_failure', {
        email: state.email,
        error: errorMessage
      });
      
      setState(prev => ({ 
        ...prev, 
        errors: { general: errorMessage }
      }));
      onError(errorMessage);
      
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      
      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email address
        </label>
        <div className="mt-1 relative">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={state.email}
            onChange={(e) => setState(prev => ({ 
              ...prev, 
              email: e.target.value,
              errors: { ...prev.errors, email: '', general: '' }
            }))}
            className={`
              appearance-none block w-full px-3 py-2 border rounded-md shadow-sm
              placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${state.errors.email 
                ? 'border-red-300 text-red-900 placeholder-red-300' 
                : 'border-gray-300'
              }
            `}
            placeholder="Enter your email"
            aria-describedby={state.errors.email ? 'email-error' : undefined}
          />
          {state.errors.email && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {state.errors.email && (
          <p id="email-error" className="mt-2 text-sm text-red-600" role="alert">
            {state.errors.email}
          </p>
        )}
      </div>

      {/* Password field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <div className="mt-1 relative">
          <input
            id="password"
            name="password"
            type={state.showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={state.password}
            onChange={(e) => setState(prev => ({ 
              ...prev, 
              password: e.target.value,
              errors: { ...prev.errors, password: '', general: '' }
            }))}
            className={`
              appearance-none block w-full px-3 py-2 pr-10 border rounded-md shadow-sm
              placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500
              ${state.errors.password 
                ? 'border-red-300 text-red-900 placeholder-red-300' 
                : 'border-gray-300'
              }
            `}
            placeholder="Enter your password"
            aria-describedby={state.errors.password ? 'password-error' : undefined}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setState(prev => ({ ...prev, showPassword: !prev.showPassword }))}
            aria-label={state.showPassword ? 'Hide password' : 'Show password'}
          >
            {state.showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
        {state.errors.password && (
          <p id="password-error" className="mt-2 text-sm text-red-600" role="alert">
            {state.errors.password}
          </p>
        )}
      </div>

      {/* Remember me and forgot password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={state.rememberMe}
            onChange={(e) => setState(prev => ({ ...prev, rememberMe: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <Link 
            href="/auth/forgot-password" 
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot your password?
          </Link>
        </div>
      </div>

      {/* General error message */}
      {state.errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Unable to sign in
              </h3>
              <div className="mt-1 text-sm text-red-700">
                {state.errors.general}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit button */}
      <div>
        <button
          type="submit"
          disabled={state.isLoading}
          className={`
            group relative w-full flex justify-center py-2 px-4 border border-transparent
            text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-blue-500
            ${state.isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
            }
          `}
        >
          {state.isLoading ? (
            <>
              <Spinner className="w-4 h-4 mr-2" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </div>

      {/* OAuth providers */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <OAuthButton provider="google" />
          <OAuthButton provider="github" />
        </div>
      </div>

      {/* Sign up link */}
      {showSignupLink && (
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              href="/auth/register" 
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </span>
        </div>
      )}
    </form>
  );
};
```

### **TwoFactorSetup Component**
```typescript
// src/components/auth/TwoFactorSetup.tsx
interface TwoFactorSetupProps {
  user: User;
  onComplete: () => void;
  onCancel: () => void;
}

export const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({
  user,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateTwoFactorSecret();
  }, []);

  const generateTwoFactorSecret = async () => {
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      
    } catch (error) {
      console.error('Failed to generate 2FA secret:', error);
    }
  };

  const verifyAndEnable = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: verificationCode,
          secret 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBackupCodes(data.backupCodes);
        setStep('backup');
      } else {
        throw new Error(data.error);
      }
      
    } catch (error) {
      console.error('2FA verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        Set up Two-Factor Authentication
      </h2>
      
      {step === 'setup' && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Scan this QR code with your authenticator app:
          </p>
          
          <div className="flex justify-center">
            <img src={qrCode} alt="2FA QR Code" className="border rounded" />
          </div>
          
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-xs text-gray-600 mb-1">
              Can't scan? Enter this code manually:
            </p>
            <code className="text-sm font-mono">{secret}</code>
          </div>
          
          <button
            onClick={() => setStep('verify')}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      )}
      
      {step === 'verify' && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Enter the 6-digit code from your authenticator app:
          </p>
          
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="000000"
            className="w-full px-3 py-2 border rounded text-center text-lg font-mono"
            maxLength={6}
          />
          
          <div className="flex space-x-3">
            <button
              onClick={() => setStep('setup')}
              className="flex-1 py-2 px-4 border border-gray-300 rounded hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={verifyAndEnable}
              disabled={verificationCode.length !== 6 || isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>
      )}
      
      {step === 'backup' && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Save these backup codes in a safe place:
          </p>
          
          <div className="bg-gray-50 p-4 rounded">
            {backupCodes.map((code, index) => (
              <div key={index} className="font-mono text-sm py-1">
                {code}
              </div>
            ))}
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Each backup code can only be used once.
              Store them securely as they can be used to access your account if
              you lose your authenticator device.
            </p>
          </div>
          
          <button
            onClick={onComplete}
            className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Complete Setup
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 🔧 API IMPLEMENTATION

### **Authentication Endpoints**
```typescript
// api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@/utils/supabase-server';
import { rateLimit } from '@/utils/rate-limit';
import { verifyRecaptcha } from '@/utils/recaptcha';
import { loginSchema } from '@/schemas/auth';

const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Limit each IP to 500 requests per windowMs
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Rate limiting
    await limiter.check(res, 5, req.ip); // 5 attempts per 15 minutes per IP
    
    // Validate input
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.error.errors
      });
    }

    const { email, password, rememberMe, captchaToken } = validation.data;
    
    // Verify reCAPTCHA for suspicious activity
    if (captchaToken) {
      const captchaValid = await verifyRecaptcha(captchaToken);
      if (!captchaValid) {
        return res.status(400).json({ error: 'Invalid captcha' });
      }
    }

    const supabase = createServerSupabaseClient({ req, res });
    
    // Check if user account is locked
    const { data: user } = await supabase
      .from('users')
      .select('id, email, status, login_attempts, locked_until')
      .eq('email', email)
      .single();

    if (user?.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(429).json({
        error: 'Account temporarily locked due to too many failed attempts'
      });
    }

    // Attempt login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      // Increment failed login attempts
      if (user) {
        const newAttempts = (user.login_attempts || 0) + 1;
        const shouldLock = newAttempts >= 5;
        
        await supabase
          .from('users')
          .update({
            login_attempts: newAttempts,
            locked_until: shouldLock 
              ? new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
              : null
          })
          .eq('id', user.id);
      }

      // Log security event
      await supabase.from('security_events').insert({
        user_id: user?.id,
        event_type: 'login_failure',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        metadata: { email, error: authError.message }
      });

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts on successful login
    await supabase
      .from('users')
      .update({
        login_attempts: 0,
        locked_until: null,
        last_login: new Date().toISOString()
      })
      .eq('id', authData.user.id);

    // Create login session
    const sessionDuration = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 7 days or 1 day
    
    await supabase.from('login_sessions').insert({
      user_id: authData.user.id,
      session_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      expires_at: new Date(Date.now() + sessionDuration).toISOString()
    });

    // Log successful login
    await supabase.from('security_events').insert({
      user_id: authData.user.id,
      event_type: 'login_success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      metadata: { rememberMe }
    });

    return res.status(200).json({
      success: true,
      user: authData.user,
      session: authData.session
    });

  } catch (error) {
    console.error('Login error:', error);
    
    if (error.status === 429) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// api/auth/register.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await limiter.check(res, 3, req.ip); // 3 registrations per 15 minutes per IP
    
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.error.errors
      });
    }

    const { email, password, firstName, lastName, organizationName } = validation.data;
    
    const supabase = createServerSupabaseClient({ req, res });
    
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName
        }
      }
    });

    if (authError) {
      throw authError;
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authData.user.id,
        first_name: firstName,
        last_name: lastName
      });

    if (profileError) {
      throw profileError;
    }

    // Create organization if provided
    if (organizationName) {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          slug: generateSlug(organizationName),
          type: 'individual',
          created_by: authData.user.id
        })
        .select()
        .single();

      if (!orgError) {
        await supabase.from('organization_members').insert({
          organization_id: org.id,
          user_id: authData.user.id,
          role: 'owner',
          status: 'active'
        });
      }
    }

    return res.status(201).json({
      success: true,
      user: authData.user,
      message: 'Registration successful. Please check your email to verify your account.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
```

---

## 🧪 TESTING SPECIFICATIONS

### **Authentication Flow Testing**
```typescript
// tests/auth/authentication.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';

describe('Authentication Flow', () => {
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle successful login', async () => {
    const mockLogin = jest.fn().mockResolvedValue({
      success: true,
      user: { id: '1', email: 'test@example.com' }
    });

    render(
      <AuthProvider value={{ login: mockLogin }}>
        <LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        rememberMe: false,
        captchaToken: undefined
      });
    });

    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should handle login failure', async () => {
    const mockLogin = jest.fn().mockRejectedValue(new Error('Invalid credentials'));

    render(
      <AuthProvider value={{ login: mockLogin }}>
        <LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/unable to sign in/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    expect(mockOnError).toHaveBeenCalledWith('Invalid credentials');
  });

  it('should validate required fields', async () => {
    render(
      <AuthProvider>
        <LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should show/hide password', () => {
    render(
      <AuthProvider>
        <LoginForm onSuccess={mockOnSuccess} onError={mockOnError} />
      </AuthProvider>
    );

    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = screen.getByLabelText(/show password/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
```

### **Security Testing**
```typescript
// tests/security/authentication-security.test.ts
describe('Authentication Security', () => {
  it('should rate limit login attempts', async () => {
    const email = 'test@example.com';
    const password = 'wrongpassword';

    // Make 5 failed attempts
    for (let i = 0; i < 5; i++) {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      expect(response.status).toBe(401);
    }

    // 6th attempt should be rate limited
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toContain('too many');
  });

  it('should lock account after failed attempts', async () => {
    const testUser = await createTestUser();
    
    // Make 5 failed login attempts
    for (let i = 0; i < 5; i++) {
      await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'wrongpassword'
        })
      });
    }

    // Account should be locked now
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password // Correct password
      })
    });

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toContain('locked');
  });

  it('should validate password strength', async () => {
    const weakPasswords = [
      'weak',
      '12345678',
      'password',
      'abc123',
      'nouppercaseorspecial'
    ];

    for (const password of weakPasswords) {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password,
          firstName: 'Test',
          lastName: 'User'
        })
      });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('password');
    }
  });
});
```

---

## 🎯 SUCCESS CRITERIA & VALIDATION

### **Security Compliance Checklist**
```typescript
interface SecurityCompliance {
  authentication: {
    passwordPolicy: boolean; // ✅ 8+ chars, uppercase, numbers, special
    accountLockout: boolean; // ✅ 5 failed attempts = 30min lock
    sessionManagement: boolean; // ✅ Secure session tokens
    twoFactorAuth: boolean; // ✅ TOTP implementation
  };
  
  authorization: {
    roleBasedAccess: boolean; // ✅ Admin/Researcher/Participant roles
    resourceProtection: boolean; // ✅ RLS policies active
    apiAuthorization: boolean; // ✅ JWT validation on all endpoints
    privilegeEscalation: boolean; // ✅ Prevention measures active
  };
  
  dataProtection: {
    encryptionAtRest: boolean; // ✅ Database encryption
    encryptionInTransit: boolean; // ✅ TLS 1.3 everywhere
    tokenSecurity: boolean; // ✅ Secure token generation
    dataLeakage: boolean; // ✅ No sensitive data in logs
  };
  
  monitoring: {
    securityEvents: boolean; // ✅ All auth events logged
    suspiciousActivity: boolean; // ✅ Anomaly detection
    auditTrail: boolean; // ✅ Complete audit log
    alerting: boolean; // ✅ Real-time security alerts
  };
}
```

### **Performance Benchmarks**
```typescript
const AUTH_PERFORMANCE_TARGETS = {
  loginResponse: {
    target: '<1 second',
    measurement: 'API response time for login',
    acceptance: '95th percentile under target'
  },
  
  registrationFlow: {
    target: '<3 seconds',
    measurement: 'Complete registration process',
    acceptance: '95th percentile under target'
  },
  
  sessionValidation: {
    target: '<100ms',
    measurement: 'Token validation time',
    acceptance: 'All validations under target'
  },
  
  passwordReset: {
    target: '<2 seconds',
    measurement: 'Password reset email send',
    acceptance: '99% emails sent within target'
  }
};
```

---

## 🚀 IMPLEMENTATION ROADMAP

### **Phase 1: Core Authentication (Week 1)**
- [ ] Basic login/register forms
- [ ] JWT token management
- [ ] Password validation
- [ ] Email verification
- [ ] Session management

### **Phase 2: Security Hardening (Week 2)**
- [ ] Rate limiting implementation
- [ ] Account lockout mechanism
- [ ] Security event logging
- [ ] Input validation hardening
- [ ] CSRF protection

### **Phase 3: Advanced Features (Week 3)**
- [ ] Two-factor authentication
- [ ] OAuth provider integration
- [ ] Account recovery flow
- [ ] Security monitoring
- [ ] Admin security tools

### **Phase 4: Production Optimization (Week 4)**
- [ ] Performance optimization
- [ ] Security audit compliance
- [ ] Monitoring dashboard
- [ ] Automated security testing
- [ ] Documentation completion

---

**🔐 AUTHENTICATION SYSTEM: Providing enterprise-grade security with consumer-grade simplicity, ensuring users can access ResearchHub safely and seamlessly.**
