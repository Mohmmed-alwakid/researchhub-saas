import React, { useState, useRef } from 'react';
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Palette,
  Download,
  Trash2,
  Upload,
  Loader2,
  UserCheck
} from 'lucide-react';
import { SecuritySettings } from '../../components/settings/SecuritySettings';
import { PointsManager } from '../../components/subscription/PointsManager';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/api.service';

type SettingsTab = 'profile' | 'demographics' | 'security' | 'billing' | 'notifications' | 'preferences';

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateProfile } = useAuthStore();

  // Handle avatar upload
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiService.upload<{
        success: boolean;
        message: string;
        data: { url: string };
      }>('/api/upload/avatar', formData, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success) {
        // Update user profile with new avatar URL
        await updateProfile({ avatar: response.data.url });
        alert('Profile picture updated successfully!');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle avatar removal
  const handleAvatarRemove = async () => {
    if (!user?.avatar) return;

    try {
      await updateProfile({ avatar: '' });
      alert('Profile picture removed successfully!');
    } catch (error) {
      console.error('Failed to remove avatar:', error);
      alert('Failed to remove profile picture. Please try again.');
    }
  };

  // Handle demographics update
  // Form handlers
  const handleProfileUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    try {
      await updateProfile({
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleDemographicsUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const demographics = {
      ageRange: formData.get('ageRange') as string,
      gender: formData.get('gender') as string,
      country: formData.get('country') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      specialization: formData.get('specialization') as string,
    };

    try {
      await updateProfile({ demographics });
      alert('Demographics updated successfully!');
    } catch (error) {
      console.error('Failed to update demographics:', error);
      alert('Failed to update demographics. Please try again.');
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    ...(user?.role === 'participant' ? [{ id: 'demographics' as SettingsTab, label: 'Demographics', icon: UserCheck }] : []),
    { id: 'security' as SettingsTab, label: 'Security', icon: Shield },
    { id: 'billing' as SettingsTab, label: 'Billing', icon: CreditCard },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'preferences' as SettingsTab, label: 'Preferences', icon: Palette },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Personal Information</h3>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        defaultValue={user?.firstName || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        defaultValue={user?.lastName || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        disabled
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={user?.role || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </CardContent>
            </Card>            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Profile Picture</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar.startsWith('/') ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${user.avatar}` : user.avatar}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to user icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                    {user?.avatar && (
                      <User className="w-8 h-8 text-gray-400 hidden" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Upload a new profile picture. Recommended size: 400x400px.
                    </p>
                    {isUploading && (
                      <div className="mb-3">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-gray-600">Uploading... {uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    <div className="flex space-x-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload New
                      </Button>
                      {user?.avatar && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600"
                          onClick={handleAvatarRemove}
                          disabled={isUploading}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'demographics':
        return user?.role === 'participant' ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Demographics Information</h3>
                <p className="text-sm text-gray-600">
                  Help us match you with relevant studies by providing some basic information.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDemographicsUpdate}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email cannot be changed. Contact support if needed.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age Range
                      </label>
                      <select 
                        name="ageRange"
                        defaultValue={user?.demographics?.ageRange || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select age range</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45-54">45-54</option>
                        <option value="55-64">55-64</option>
                        <option value="65+">65+</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select 
                        name="gender"
                        defaultValue={user?.demographics?.gender || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <select 
                        name="country"
                        defaultValue={user?.demographics?.country || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select country</option>
                        <option value="SA">Saudi Arabia</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Currently only available in Saudi Arabia. More countries coming soon.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        defaultValue={user?.demographics?.phoneNumber || ''}
                        placeholder="+966 XX XXX XXXX"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization/Expertise
                      </label>
                      <select 
                        name="specialization"
                        defaultValue={user?.demographics?.specialization || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">Select your specialization</option>
                        <option value="Technology & Software">Technology & Software</option>
                        <option value="Design & User Experience">Design & User Experience</option>
                        <option value="Marketing & Advertising">Marketing & Advertising</option>
                        <option value="Healthcare & Medical">Healthcare & Medical</option>
                        <option value="Education & Training">Education & Training</option>
                        <option value="Finance & Banking">Finance & Banking</option>
                        <option value="Retail & E-commerce">Retail & E-commerce</option>
                        <option value="Business & Management">Business & Management</option>
                        <option value="Engineering & Manufacturing">Engineering & Manufacturing</option>
                        <option value="Media & Communications">Media & Communications</option>
                        <option value="Legal & Consulting">Legal & Consulting</option>
                        <option value="Transportation & Logistics">Transportation & Logistics</option>
                        <option value="Student">Student</option>
                        <option value="Other">Other</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        This helps us match you with studies in your field of expertise.
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <Button type="submit">Save Demographics</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Demographics settings are only available for participants.</p>
          </div>
        );

      case 'security':
        return <SecuritySettings user={user ? {
          id: user.id || user._id || '',
          email: user.email,
          twoFactorEnabled: false // This would come from user profile or settings
        } : undefined} />;

      case 'billing':
        return <PointsManager />;

      case 'notifications':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Email Notifications</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Study Updates</h4>
                      <p className="text-sm text-gray-600">
                        Get notified about study progress and completion
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Participant Activity</h4>
                      <p className="text-sm text-gray-600">
                        Notifications when participants join or complete studies
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Security Alerts</h4>
                      <p className="text-sm text-gray-600">
                        Important security updates and login notifications
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Marketing Updates</h4>
                      <p className="text-sm text-gray-600">
                        Product updates and research tips
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">General Preferences</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option>UTC (GMT+0)</option>
                      <option>Eastern Time (GMT-5)</option>
                      <option>Central Time (GMT-6)</option>
                      <option>Mountain Time (GMT-7)</option>
                      <option>Pacific Time (GMT-8)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Portuguese</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Format
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Data & Privacy</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Button variant="outline" className="mr-3">
                      <Download className="w-4 h-4 mr-2" />
                      Export My Data
                    </Button>
                    <span className="text-sm text-gray-600">
                      Download all your account data
                    </span>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-red-600 mb-2">Danger Zone</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
        {/* Settings Navigation */}
        <aside className="lg:col-span-3">
          <nav className="space-y-2" style={{ gap: '8px', display: 'flex', flexDirection: 'column' }}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={{ margin: '4px 0', padding: '12px 16px' }}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content */}
        <div className="mt-8 lg:mt-0 lg:col-span-9">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
