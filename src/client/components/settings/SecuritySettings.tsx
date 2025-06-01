import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  Smartphone, 
  AlertTriangle, 
  CheckCircle,
  Download,
  Eye,
  EyeOff,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import TwoFactorSetup from '../../components/auth/TwoFactorSetup';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface SecuritySettingsProps {
  user?: {
    id: string;
    email: string;
    twoFactorEnabled?: boolean;
  };
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user }) => {
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const handle2FAEnable = () => {
    setShow2FASetup(true);
  };

  const handle2FASetupComplete = () => {
    setShow2FASetup(false);
    toast.success('Two-factor authentication enabled successfully!');
    // Refresh user data or update parent component
  };

  const handle2FADisable = async () => {
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    try {
      setIsDisabling2FA(true);
      const response = await authService.disable2FA(currentPassword);
      if (response.success) {
        toast.success('Two-factor authentication disabled');
        setCurrentPassword('');
        // Refresh user data or update parent component
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Failed to disable two-factor authentication');
    } finally {
      setIsDisabling2FA(false);
    }
  };

  const generateBackupCodes = async () => {
    try {
      setIsGeneratingCodes(true);
      const response = await authService.generateBackupCodes();
      if (response.success) {
        setBackupCodes(response.backupCodes);
        setShowBackupCodes(true);
        toast.success('New backup codes generated');
      }
    } catch (error) {
      console.error('Error generating backup codes:', error);
      toast.error('Failed to generate backup codes');
    } finally {
      setIsGeneratingCodes(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `ResearchHub Backup Codes
Generated: ${new Date().toLocaleString()}
Email: ${user?.email}

Important: Save these codes in a secure location. Each code can only be used once.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

Instructions:
- Keep these codes secure and accessible
- Use them to sign in if you don't have access to your authenticator app
- Generate new codes if you use all of these
- Never share these codes with anyone`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `researchhub-backup-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (show2FASetup) {
    return (
      <TwoFactorSetup 
        userEmail={user?.email || ''}
        onComplete={handle2FASetupComplete}
        onCancel={() => setShow2FASetup(false)}
      />
    );
  }
  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              user?.twoFactorEnabled 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!user?.twoFactorEnabled ? (
            <div>
              <p className="text-gray-600 mb-4">
                Secure your account with two-factor authentication. You'll need to enter a code from your authenticator app when signing in.
              </p>
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Works with Google Authenticator, Authy, and other TOTP apps
                </span>
              </div>
              <Button onClick={handle2FAEnable} className="mt-4">
                <Shield className="w-4 h-4 mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Two-factor authentication is enabled</span>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Backup Codes</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Generate backup codes to sign in if you don't have access to your authenticator app.
                </p>
                <Button 
                  onClick={generateBackupCodes}
                  variant="outline"
                  isLoading={isGeneratingCodes}
                  className="mr-3"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Generate New Codes
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Disable Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Removing 2FA will make your account less secure. Enter your password to confirm.
                </p>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1 max-w-xs">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button 
                    onClick={handle2FADisable}
                    variant="outline"
                    isLoading={isDisabling2FA}
                    className="text-red-600 hover:text-red-700"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Disable 2FA
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Codes Modal */}
      {showBackupCodes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Backup Codes</h3>
              <button
                onClick={() => setShowBackupCodes(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Save these codes in a secure location. Each can only be used once.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded border text-center">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex justify-between">
              <Button onClick={downloadBackupCodes} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => setShowBackupCodes(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Security Recommendations</h3>
              <p className="text-sm text-gray-600">
                Follow these best practices to keep your account secure
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className={`w-5 h-5 ${user?.twoFactorEnabled ? 'text-green-500' : 'text-gray-300'}`} />
              <span className={`text-sm ${user?.twoFactorEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                Enable two-factor authentication
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-gray-300" />
              <span className="text-sm text-gray-500">
                Use a strong, unique password
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-gray-300" />
              <span className="text-sm text-gray-500">
                Keep your browser up to date
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-gray-300" />
              <span className="text-sm text-gray-500">
                Don't share your account credentials
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
