import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import toast from 'react-hot-toast';

// Form validation schema
const twoFactorSchema = z.object({
  code: z.string().min(1, 'Please enter a code'),
});

type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

interface TwoFactorLoginProps {
  email: string;
  onSuccess: (token: string) => void;
  onCancel: () => void;
  onUseBackupCode: () => void;
}

const TwoFactorLogin: React.FC<TwoFactorLoginProps> = ({
  email,
  onSuccess,
  onCancel,
  onUseBackupCode,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onSubmit = async (data: TwoFactorFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call to verify 2FA code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification - in real app, verify with backend
      if (data.code === '123456' || data.code.length === 6) {
        toast.success('Two-factor authentication successful!');
        onSuccess('mock-jwt-token');
      } else {
        const newAttempts = remainingAttempts - 1;
        setRemainingAttempts(newAttempts);
        
        if (newAttempts === 0) {
          toast.error('Too many failed attempts. Please try again later.');
          onCancel();
        } else {
          toast.error(`Invalid code. ${newAttempts} attempts remaining.`);        }
        reset();
      }
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${maskedUsername}@${domain}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card variant="glass" className="animate-slide-up">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
              <p className="text-gray-600">
                Enter the 6-digit code from your authenticator app for{' '}
                <span className="font-medium">{maskEmail(email)}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Authentication Code
                </label>
                <input
                  {...register('code')}
                  type="text"
                  id="code"
                  maxLength={8}
                  className={`input-field text-center text-2xl tracking-widest ${
                    errors.code 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                  placeholder="000000"
                  autoComplete="off"
                  autoFocus
                />
                {errors.code && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.code.message}
                  </div>
                )}
              </div>

              {/* Remaining Attempts Warning */}
              {remainingAttempts < 3 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-800">
                      {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
            </form>

            {/* Help Section */}
            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Having trouble?</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Make sure your device's time is correct</p>
                  <p>• Try refreshing your authenticator app</p>
                  <p>• Enter the latest code displayed</p>
                </div>
              </div>

              {/* Alternative Options */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={onUseBackupCode}
                  className="w-full"
                >
                  Use Backup Code Instead
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    variant="ghost"
                    onClick={onCancel}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Login
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => reset()}
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear Code
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Link */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Still having trouble?{' '}
            <a href="/support" className="text-primary-600 hover:text-primary-500 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorLogin;
