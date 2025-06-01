import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Key, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import toast from 'react-hot-toast';

// Form validation schema
const backupCodeSchema = z.object({
  code: z.string()
    .min(1, 'Please enter a backup code')
    .regex(/^[A-Z0-9]{8}$/, 'Backup code must be 8 characters'),
});

type BackupCodeFormData = z.infer<typeof backupCodeSchema>;

interface BackupCodeLoginProps {
  email: string;
  onSuccess: (token: string) => void;
  onCancel: () => void;
  onUseAuthenticator: () => void;
}

const BackupCodeLogin: React.FC<BackupCodeLoginProps> = ({
  email,
  onSuccess,
  onCancel,
  onUseAuthenticator,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BackupCodeFormData>({
    resolver: zodResolver(backupCodeSchema),
  });

  const code = watch('code');

  const onSubmit = async (data: BackupCodeFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call to verify backup code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification - in real app, verify with backend
      const validBackupCodes = ['ABCD1234', 'EFGH5678', 'IJKL9012'];
      
      if (validBackupCodes.includes(data.code.toUpperCase())) {
        toast.success('Backup code verified successfully!');
        toast.info('This backup code has been used and is no longer valid.');
        onSuccess('mock-jwt-token');
      } else {
        const newAttempts = remainingAttempts - 1;
        setRemainingAttempts(newAttempts);
        
        if (newAttempts === 0) {
          toast.error('Too many failed attempts. Please contact support.');
          onCancel();
        } else {
          toast.error(`Invalid backup code. ${newAttempts} attempts remaining.`);        }
        reset();
      }
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCode = (value: string) => {
    // Format as user types to make it easier to read
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
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
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Key className="h-8 w-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Use Backup Code</h2>
              <p className="text-gray-600">
                Enter one of your backup codes for{' '}
                <span className="font-medium">{maskEmail(email)}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Backup Code
                </label>
                <input
                  {...register('code', {
                    onChange: (e) => {
                      e.target.value = formatCode(e.target.value);
                    }
                  })}
                  type="text"
                  id="code"
                  maxLength={8}
                  className={`input-field text-center text-xl tracking-widest font-mono ${
                    errors.code 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                  }`}
                  placeholder="ABCD1234"
                  autoComplete="off"
                  autoFocus
                />
                {errors.code && (
                  <div className="mt-2 flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.code.message}
                  </div>
                )}
                {code && code.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Code length: {code.length}/8
                  </div>
                )}
              </div>

              {/* Remaining Attempts Warning */}
              {remainingAttempts < 5 && (
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
                {isLoading ? 'Verifying...' : 'Verify Backup Code'}
              </Button>
            </form>

            {/* Important Information */}
            <div className="mt-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Important:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Each backup code can only be used once</li>
                      <li>Keep your remaining codes secure</li>
                      <li>Generate new codes after using several</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Alternative Options */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={onUseAuthenticator}
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Use Authenticator App Instead
                </Button>
                
                <Button
                  variant="ghost"
                  onClick={onCancel}
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support and Help */}
        <div className="space-y-3 text-center text-sm text-gray-500">
          <p>
            Lost all your backup codes?{' '}
            <a href="/support" className="text-primary-600 hover:text-primary-500 font-medium">
              Contact Support
            </a>
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs">
              <strong>Demo codes for testing:</strong> ABCD1234, EFGH5678, IJKL9012
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupCodeLogin;
