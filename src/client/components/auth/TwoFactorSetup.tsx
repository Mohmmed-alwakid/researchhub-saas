import { useState } from 'react';
import { QrCode, Copy, Shield, CheckCircle, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

// Generate random backup codes
const generateBackupCodes = (): string[] => {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    codes.push(code);
  }
  return codes;
};

// Form validation schema
const verificationSchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
});

type VerificationFormData = z.infer<typeof verificationSchema>;

interface TwoFactorSetupProps {
  userEmail: string;
  onComplete: () => void;
  onCancel: () => void;
}

const TwoFactorSetup: React.FC<TwoFactorSetupProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [isLoading, setIsLoading] = useState(false);  const [secret] = useState('JBSWY3DPEHPK3PXP'); // In real app, this comes from backend
  const [backupCodes] = useState(generateBackupCodes());
  const [showSecret, setShowSecret] = useState(false);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const onVerify = async (data: VerificationFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call to verify 2FA code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock verification - in real app, verify with backend
      if (data.code === '123456') {
        toast.success('Two-factor authentication verified!');
        setCurrentStep('backup');      } else {
        toast.error('Invalid verification code. Please try again.');
      }
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const completeSetup = () => {
    if (!backupCodesSaved) {
      toast.error('Please save your backup codes before continuing');
      return;
    }
    onComplete();
  };

  const downloadBackupCodes = () => {
    const content = `Afkar - Two-Factor Authentication Backup Codes
Generated: ${new Date().toLocaleString()}

Your backup codes (use only once each):
${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Important:
- Each code can only be used once
- Store these codes in a safe place
- These codes can be used to access your account if you lose your authenticator device
- Keep them secure and don't share them with anyone`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'afkar-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setBackupCodesSaved(true);
    toast.success('Backup codes saved successfully');
  };

  if (currentStep === 'setup') {
    return (
      <Card variant="glass">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set up Two-Factor Authentication</h2>
            <p className="text-gray-600">
              Add an extra layer of security to your account with 2FA
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Download Authenticator App */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Step 1: Download an Authenticator App</h3>
              <p className="text-sm text-gray-600 mb-3">
                Install one of these authenticator apps on your mobile device:
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center p-2 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-blue-500 rounded mr-3"></div>
                  <span>Google Authenticator</span>
                </div>
                <div className="flex items-center p-2 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-purple-500 rounded mr-3"></div>
                  <span>Microsoft Authenticator</span>
                </div>
                <div className="flex items-center p-2 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-green-500 rounded mr-3"></div>
                  <span>Authy</span>
                </div>
                <div className="flex items-center p-2 bg-gray-50 rounded">
                  <div className="w-8 h-8 bg-red-500 rounded mr-3"></div>
                  <span>1Password</span>
                </div>
              </div>
            </div>

            {/* Step 2: Scan QR Code */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Step 2: Scan QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Open your authenticator app and scan this QR code:
              </p>
              
              <div className="text-center mb-4">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <QrCode className="h-32 w-32 text-gray-400" />
                  <p className="text-xs text-gray-500 mt-2">QR Code placeholder</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
                <div className="flex items-center justify-center space-x-2">
                  <code className="px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                    {showSecret ? secret : '••••••••••••••••'}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={() => setCurrentStep('verify')} className="flex-1">
                Next: Verify Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'verify') {
    return (
      <Card variant="glass">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Setup</h2>
            <p className="text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <form onSubmit={handleSubmit(onVerify)} className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <input
                {...register('code')}
                type="text"
                id="code"
                maxLength={6}
                className={`input-field text-center text-2xl tracking-widest ${
                  errors.code 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                }`}
                placeholder="000000"
                autoComplete="off"
              />
              {errors.code && (
                <div className="mt-2 flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.code.message}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Code not working?</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Make sure your device's time is correct</li>
                    <li>Try refreshing your authenticator app</li>
                    <li>Enter the latest code displayed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('setup')} 
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button 
                type="submit" 
                isLoading={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 'backup') {
    return (
      <Card variant="glass">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Save Your Backup Codes</h2>
            <p className="text-gray-600">
              These codes can be used to access your account if you lose your authenticator device
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Important:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Each code can only be used once</li>
                    <li>Store them in a secure location</li>
                    <li>Don't share them with anyone</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Backup Codes</h3>
              <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-white border border-gray-200 rounded px-3 py-2"
                  >
                    <span>{code}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={downloadBackupCodes}
                className="flex-1"
              >
                Download Codes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="saved"
                checked={backupCodesSaved}
                onChange={(e) => setBackupCodesSaved(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="saved" className="ml-2 text-sm text-gray-700">
                I have saved these backup codes in a secure location
              </label>
            </div>

            <Button 
              onClick={completeSetup}
              disabled={!backupCodesSaved}
              className="w-full"
            >
              Complete Setup
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default TwoFactorSetup;
