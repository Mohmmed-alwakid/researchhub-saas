import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, AlertCircle, Sparkles, CheckCircle, TrendingUp } from 'lucide-react';
import { AfkarLogo } from '../../../assets/brand/AfkarLogo';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import TwoFactorLogin from '../../components/auth/TwoFactorLogin';
import BackupCodeLogin from '../../components/auth/BackupCodeLogin';
import GoogleOAuthButton from '../../components/auth/GoogleOAuthButton';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const EnhancedLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [authStep, setAuthStep] = useState<'login' | '2fa' | 'backup'>('login');
  const navigate = useNavigate();
  const { login, isLoading, tempToken, tempEmail, requiresTwoFactor, clearTempAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data.email, data.password);
      if (result.requiresTwoFactor) {
        setAuthStep('2fa');
      } else {
        navigate('/app'); // Let RoleBasedRedirect handle the proper routing
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handle2FASuccess = () => {
    navigate('/app'); // Let RoleBasedRedirect handle the proper routing
  };

  const handleBackupCodeLogin = () => {
    setAuthStep('backup');
  };

  const handleBackToLogin = () => {
    setAuthStep('login');
    clearTempAuth();
  };

  const handleBack2FA = () => {
    setAuthStep('2fa');
  };
  // Show 2FA component if required
  if (requiresTwoFactor && tempToken && tempEmail && authStep === '2fa') {
    return (
      <TwoFactorLogin
        email={tempEmail}
        onSuccess={handle2FASuccess}
        onUseBackupCode={handleBackupCodeLogin}
        onCancel={handleBackToLogin}
      />
    );
  }

  // Show backup code component
  if (requiresTwoFactor && tempToken && tempEmail && authStep === 'backup') {
    return (
      <BackupCodeLogin
        email={tempEmail}
        onSuccess={handle2FASuccess}
        onCancel={handleBack2FA}
        onUseAuthenticator={handleBackToLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-md lg:w-96">
          {/* Logo and Header */}
          <div className="animate-fade-in">            <div className="flex items-center mb-8">
              <AfkarLogo variant="full" className="h-10 w-auto" />
            </div>
            
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
              <p className="text-gray-600">
                Sign in to your account to continue your research journey.{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Form */}
          <Card variant="glass" className="animate-slide-up">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    id="email"
                    autoComplete="email"
                    className={`input-field ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.email.message}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      autoComplete="current-password"
                      className={`input-field pr-12 ${
                        errors.password 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                      }`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {errors.password.message}
                    </div>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      {...register('rememberMe')}
                      id="rememberMe"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors duration-200"
                    />
                    <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              {/* Divider */}
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">Or continue with</span>
                  </div>
                </div>

                {/* Social Login */}
                <div className="mt-6">
                  <GoogleOAuthButton />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <p className="text-center text-sm text-gray-600 mb-4">Trusted by researchers worldwide</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-xs text-gray-600">Secure</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full mb-2">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-xs text-gray-600">AI-Powered</span>
              </div>
              <div className="flex flex-col items-center">                <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
                <span className="text-xs text-gray-600">Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-md text-center text-white animate-fade-in">            <div className="mb-8">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AfkarLogo variant="icon" className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Join 10,000+ Researchers</h3>
              <p className="text-primary-100 leading-relaxed">
                Discover insights that drive product decisions. From startups to enterprises, 
                teams trust Afkar for user research.
              </p>
            </div>
            
            <div className="space-y-4 text-left">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-sm">SOC 2 compliant security</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-sm">GDPR ready data protection</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                <span className="text-sm">24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLoginPage;
