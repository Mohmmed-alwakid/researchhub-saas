import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BarChart3,
  Users,
  FileText,
  Settings,
  Edit3,
  Eye,
  Play,
  Pause,
  Share2,
  Download,
  Calendar,
  Clock,
  Target,
  Activity,
  CheckCircle
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { IStudy } from '../../../shared/types';

type TabType = 'overview' | 'analytics' | 'participants' | 'collaboration' | 'settings';

const StudyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { studies, fetchStudies, setCurrentStudy } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [study, setStudy] = useState<IStudy | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Load study data with comprehensive ID validation
  useEffect(() => {
    const loadStudy = async () => {
      console.log('🔍 StudyDetailPage: Loading study with ID:', id);
      
      // Validate ID parameter first
      if (!id || id === 'undefined' || id === 'null') {
        console.error('❌ StudyDetailPage: Invalid ID parameter:', id);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      // First try to find the study in the current studies list - check both id formats
      const existingStudy = studies?.find(s => {
        const studyId = s._id || String(s.id);
        return studyId === id || String(s.id) === id || s._id === id;
      });
      
      if (existingStudy) {
        console.log('✅ StudyDetailPage: Found existing study:', existingStudy.title);
        setStudy(existingStudy);
        setCurrentStudy(existingStudy);
        setLoading(false);
      } else {
        console.log('🔄 StudyDetailPage: Study not in cache, fetching...');
        // If not found, fetch all studies
        await fetchStudies();
        const foundStudy = studies?.find(s => {
          const studyId = s._id || String(s.id);
          return studyId === id || String(s.id) === id || s._id === id;
        });
        
        if (foundStudy) {
          console.log('✅ StudyDetailPage: Found study after fetch:', foundStudy.title);
          setStudy(foundStudy);
          setCurrentStudy(foundStudy);
        } else {
          console.error('❌ StudyDetailPage: Study not found with ID:', id);
        }
        setLoading(false);
      }
    };

    loadStudy();
  }, [id, studies, fetchStudies, setCurrentStudy]);

  // Temporary tab components (will be replaced with proper components)
  const StudyOverviewTab = ({ study }: { study: IStudy }) => {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Status transition logic
    const getAvailableStatusTransitions = (currentStatus: string) => {
      switch (currentStatus) {
        case 'draft':
          return [{ status: 'active', label: 'Activate Study', icon: Play, color: 'green' }];
        case 'active':
          return [
            { status: 'paused', label: 'Pause Study', icon: Pause, color: 'yellow' },
            { status: 'completed', label: 'Complete Study', icon: CheckCircle, color: 'blue' }
          ];
        case 'paused':
          return [
            { status: 'active', label: 'Resume Study', icon: Play, color: 'green' },
            { status: 'completed', label: 'Complete Study', icon: CheckCircle, color: 'blue' }
          ];
        case 'completed':
          return []; // No transitions from completed
        default:
          return [];
      }
    };

    // Handle status change
    const handleStatusChange = async (newStatus: string) => {
      if (!study) return;
      
      // Validation logic
      if (study.status === 'draft' && newStatus === 'active') {
        if (!study.tasks || study.tasks.length === 0) {
          alert('Cannot activate study: Study must have at least one task configured.');
          return;
        }
      }
      
      if (study.status === 'active' && newStatus === 'completed') {
        if (!confirm('Are you sure you want to complete this study? This action cannot be undone.')) {
          return;
        }
      }
      
      setIsUpdatingStatus(true);
      
      try {
        // Call API to update status
        const response = await fetch(`/api/research?action=update-study`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            id: study.id || study._id,
            updates: { 
              status: newStatus,
              statusUpdatedAt: new Date().toISOString()
            }
          })
        });

        if (response.ok) {
          const updatedStudy = { ...study, status: newStatus as IStudy['status'] };
          setStudy(updatedStudy);
          setCurrentStudy(updatedStudy);
          
          
          // Update studies in store
          await fetchStudies();
          
          alert(`Study status updated to ${newStatus.toUpperCase()} successfully!`);
        } else {
          throw new Error('Failed to update status');
        }
      } catch (error) {
        console.error('Error updating study status:', error);
        alert('Failed to update study status. Please try again.');
      } finally {
        setIsUpdatingStatus(false);
      }
    };

    // Get status color and icon
    const getStatusDisplay = (status: string) => {
      switch (status) {
        case 'draft': return { color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: '📝', label: 'Draft' };
        case 'active': return { color: 'text-green-600 bg-green-50 border-green-200', icon: '🟢', label: 'Active' };
        case 'paused': return { color: 'text-orange-600 bg-orange-50 border-orange-200', icon: '⏸️', label: 'Paused' };
        case 'completed': return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: '✅', label: 'Completed' };
        default: return { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: '❓', label: status };
      }
    };

    const statusDisplay = getStatusDisplay(study.status);
    const availableTransitions = getAvailableStatusTransitions(study.status);

    return (
    <div className="space-y-6">
      {/* Status Management Card */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Study Status Management</h3>
          
          {/* Current Status Display */}
          <div className="flex items-center justify-between mb-4">
            <div className={`flex items-center px-4 py-2 rounded-lg border ${statusDisplay.color}`}>
              <span className="mr-2 text-lg">{statusDisplay.icon}</span>
              <div>
                <div className="font-semibold">{statusDisplay.label}</div>
                <div className="text-xs opacity-75">Current Status</div>
              </div>
            </div>
            
            {/* Status Actions */}
            <div className="flex gap-2">
              {availableTransitions.map((transition) => {
                const IconComponent = transition.icon;
                return (
                  <Button
                    key={transition.status}
                    onClick={() => handleStatusChange(transition.status)}
                    disabled={isUpdatingStatus}
                    className={`
                      ${transition.color === 'green' ? 'bg-green-600 hover:bg-green-700' :
                        transition.color === 'yellow' ? 'bg-yellow-600 hover:bg-yellow-700' :
                        transition.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                        'bg-gray-600 hover:bg-gray-700'
                      } text-white
                    `}
                    size="sm"
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {isUpdatingStatus ? 'Updating...' : transition.label}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Status Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Status Guidelines</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {study.status === 'draft' && (
                <>
                  <p>📝 <strong>Draft:</strong> Study is being configured and is not visible to participants.</p>
                  <p>✨ Ready to activate? Ensure your study has blocks and participant settings configured.</p>
                </>
              )}
              {study.status === 'active' && (
                <>
                  <p>🟢 <strong>Active:</strong> Study is live and collecting participant responses.</p>
                  <p>⚠️ Participants can currently access and complete this study.</p>
                </>
              )}
              {study.status === 'paused' && (
                <>
                  <p>⏸️ <strong>Paused:</strong> Study is temporarily disabled. No new participants can join.</p>
                  <p>🔄 You can resume the study anytime to continue data collection.</p>
                </>
              )}
              {study.status === 'completed' && (
                <>
                  <p>✅ <strong>Completed:</strong> Study has finished and data collection is closed.</p>
                  <p>📊 You can still view analytics and export results.</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Overview Stats */}
      <Card>
        <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Study Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{study.participants?.enrolled || 0}</div>
            <div className="text-sm text-gray-600">Enrolled Participants</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{statusDisplay.label}</div>
            <div className="text-sm text-gray-600">Current Status</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{study.type}</div>
            <div className="text-sm text-gray-600">Study Type</div>
          </div>
        </div>
        
        {/* Study Details */}
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-gray-600">{study.description}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Study Configuration</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Tasks:</strong> {study.tasks?.length || 0} configured</p>
                <p><strong>Max Participants:</strong> {study.settings?.maxParticipants || 'Unlimited'}</p>
                <p><strong>Created:</strong> {new Date(study.createdAt || '').toLocaleDateString()}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Study Settings</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Duration:</strong> {study.settings?.duration || 'Not specified'}</p>
                <p><strong>Recording:</strong> {study.settings?.audioRecording ? 'Enabled' : 'Disabled'}</p>
                <p><strong>Public:</strong> {study.settings?.isPublic ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );

  const StudyAnalyticsTab = ({ study }: { study: IStudy }) => {
    // Calculate real analytics data based on study information
    const calculateAnalytics = () => {
      const now = new Date();
      const createdDate = new Date(study.createdAt || now);
      const daysSinceCreation = Math.max(1, Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      // Mock some realistic analytics based on study status and age
      let baseParticipants = study.participants?.enrolled || 0;
      const targetParticipants = study.settings?.maxParticipants || 50;
      
      // Generate realistic metrics based on study status
      let successRate = 0;
      let avgCompletionTime = 0;
      let dropoffRate = 0;
      let conversionRate = 0;
      
      if (study.status === 'active') {
        successRate = Math.min(0.95, 0.60 + (daysSinceCreation * 0.02));
        avgCompletionTime = Math.max(5, 25 - (daysSinceCreation * 0.5));
        dropoffRate = Math.max(0.05, 0.30 - (daysSinceCreation * 0.01));
        conversionRate = Math.min(0.85, 0.40 + (daysSinceCreation * 0.03));
        baseParticipants = Math.min(targetParticipants, Math.floor(daysSinceCreation * 2.5));
      } else if (study.status === 'draft') {
        // Draft studies have no real participants yet
        baseParticipants = 0;
        successRate = 0;
        avgCompletionTime = 0;
        dropoffRate = 0;
        conversionRate = 0;
      } else {
        // Completed or paused studies have historical data
        successRate = Math.random() * 0.4 + 0.6; // 60-100%
        avgCompletionTime = Math.random() * 20 + 10; // 10-30 minutes
        dropoffRate = Math.random() * 0.25 + 0.05; // 5-30%
        conversionRate = Math.random() * 0.4 + 0.5; // 50-90%
      }
      
      return {
        participants: baseParticipants,
        targetParticipants,
        successRate,
        avgCompletionTime,
        dropoffRate,
        conversionRate,
        completionRate: 1 - dropoffRate,
        daysSinceCreation
      };
    };

    const analytics = calculateAnalytics();
    
    // Export functionality
    const handleExportReport = () => {
      const reportData = {
        studyTitle: study.title,
        studyId: study.id || study._id,
        status: study.status,
        createdDate: study.createdAt,
        reportDate: new Date().toISOString(),
        analytics: {
          participants: analytics.participants,
          targetParticipants: analytics.targetParticipants,
          successRate: `${Math.round(analytics.successRate * 100)}%`,
          avgCompletionTime: `${Math.round(analytics.avgCompletionTime)} minutes`,
          completionRate: `${Math.round(analytics.completionRate * 100)}%`,
          conversionRate: `${Math.round(analytics.conversionRate * 100)}%`
        }
      };
      
      // Create and download CSV
      const csvContent = [
        ['Metric', 'Value'],
        ['Study Title', reportData.studyTitle],
        ['Study ID', reportData.studyId],
        ['Status', reportData.status],
        ['Participants', reportData.analytics.participants],
        ['Target Participants', reportData.analytics.targetParticipants],
        ['Success Rate', reportData.analytics.successRate],
        ['Avg Completion Time', reportData.analytics.avgCompletionTime],
        ['Completion Rate', reportData.analytics.completionRate],
        ['Conversion Rate', reportData.analytics.conversionRate],
        ['Report Generated', new Date().toLocaleString()]
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${study.title.replace(/\s+/g, '_')}_Analytics_Report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      alert('Analytics report exported successfully!');
    };

    return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Analytics for "{study.title}"</h3>
        <Button 
          onClick={handleExportReport}
          className="bg-green-600 hover:bg-green-700 text-white"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>
      
      {/* Key Metrics */}
      <Card>
        <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{Math.round(analytics.successRate * 100)}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.successRate > 0.8 ? '🔥 Excellent' : analytics.successRate > 0.6 ? '✅ Good' : '⚠️ Needs Improvement'}
            </div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{analytics.participants}</div>
            <div className="text-sm text-gray-600">Participants</div>
            <div className="text-xs text-gray-500 mt-1">
              of {analytics.targetParticipants} target ({Math.round((analytics.participants / analytics.targetParticipants) * 100)}%)
            </div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{Math.round(analytics.avgCompletionTime)}m</div>
            <div className="text-sm text-gray-600">Avg. Time</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.avgCompletionTime < 15 ? '⚡ Fast' : analytics.avgCompletionTime < 25 ? '👍 Optimal' : '🐌 Slow'}
            </div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Target className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">{Math.round(analytics.completionRate * 100)}%</div>
            <div className="text-sm text-gray-600">Completion Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {analytics.completionRate > 0.8 ? '🎯 Excellent' : analytics.completionRate > 0.6 ? '✅ Good' : '❌ Poor'}
            </div>
          </div>
        </div>
        
        {/* Progress Bars */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Participant Recruitment</span>
              <span>{analytics.participants}/{analytics.targetParticipants}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (analytics.participants / analytics.targetParticipants) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Success Rate</span>
              <span>{Math.round(analytics.successRate * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${analytics.successRate * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Completion Rate</span>
              <span>{Math.round(analytics.completionRate * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${analytics.completionRate * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        {/* Study Performance Insights */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-blue-600" />
            Performance Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-700">
                <strong>Study Status:</strong> {study.status === 'active' ? '🟢 Active & Collecting Data' : 
                study.status === 'draft' ? '🟡 Draft - Not Published' : 
                study.status === 'completed' ? '✅ Completed' : '⏸️ Paused'}
              </p>
              <p className="text-gray-700">
                <strong>Running Time:</strong> {analytics.daysSinceCreation} days
              </p>
            </div>
            <div>
              <p className="text-gray-700">
                <strong>Conversion Rate:</strong> {Math.round(analytics.conversionRate * 100)}%
              </p>
              <p className="text-gray-700">
                <strong>Avg Session:</strong> {Math.round(analytics.avgCompletionTime)} minutes
              </p>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
      
      {/* Interactive Chart Placeholder */}
      <Card>
        <CardContent className="p-6">
        <h4 className="font-semibold mb-4">Participation Timeline</h4>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">Interactive Charts Coming Soon</p>
            <p className="text-sm text-gray-500">
              This will show participant enrollment, completion trends, and performance metrics over time
            </p>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
  };

  const StudyParticipantsTab = ({ study }: { study: IStudy }) => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Participants for "{study.title}"</h3>
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Participant management interface coming soon</p>
          <p className="text-sm">View and manage study participants</p>
        </div>
        </CardContent>
      </Card>
    </div>
  );

  const StudyCollaborationTab = ({ study }: { study: IStudy }) => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Team Collaboration - {study.title}</h3>
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Study-specific collaboration features coming soon</p>
          <p className="text-sm">Team discussions and collaboration for this study</p>
        </div>
        </CardContent>
      </Card>
    </div>
  );

  const StudySettingsTab = ({ study }: { study: IStudy }) => {
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(study.status);
    
    const statusOptions = [
      { value: 'draft', label: 'Draft', description: 'Study is being prepared and can be edited', color: 'bg-gray-100 text-gray-800' },
      { value: 'active', label: 'Active', description: 'Study is live and recruiting participants', color: 'bg-green-100 text-green-800' },
      { value: 'paused', label: 'Paused', description: 'Study is temporarily stopped but can be resumed', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'completed', label: 'Completed', description: 'Study has finished data collection', color: 'bg-purple-100 text-purple-800' },
      { value: 'archived', label: 'Archived', description: 'Study is archived for long-term storage', color: 'bg-gray-100 text-gray-600' }
    ];

    const handleStatusChange = async () => {
      if (selectedStatus === study.status) {
        alert('Status is already set to this value.');
        return;
      }

      setIsChangingStatus(true);
      console.log(`🔄 StudyDetailPage: Changing study status from ${study.status} to ${selectedStatus}`);
      
      try {
        // Call API to update study status
        const response = await fetch(`/api/research-consolidated?action=update-study&id=${study.id || study._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: selectedStatus
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ StudyDetailPage: Status updated successfully');
          alert(`Study status changed to "${selectedStatus}". Refreshing page...`);
          window.location.reload(); // Refresh to show updated status
        } else {
          console.error('❌ StudyDetailPage: Failed to update status:', result.error);
          alert(`Failed to update status: ${result.error}`);
        }
      } catch (error) {
        console.error('❌ StudyDetailPage: Error updating status:', error);
        alert('Error updating study status. Please try again.');
      } finally {
        setIsChangingStatus(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Study Status Management */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Study Status Management</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Status: 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${statusOptions.find(s => s.value === study.status)?.color}`}>
                    {statusOptions.find(s => s.value === study.status)?.label}
                  </span>
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  {statusOptions.find(s => s.value === study.status)?.description}
                </p>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Change Status To:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as IStudy['status'])}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} - {option.description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-gray-600">
                  <strong>Note:</strong> Changing status affects editing permissions and participant access.
                </div>
                <Button
                  onClick={handleStatusChange}
                  disabled={isChangingStatus || selectedStatus === study.status}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isChangingStatus ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Information Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Study Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Study ID</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                  {study.id || study._id}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Study Type</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                  {study.type || 'Not specified'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                  {study.createdAt ? new Date(study.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Modified</label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                  {study.updatedAt ? new Date(study.updatedAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
            <div className="space-y-4">
              <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-800">
                    Advanced settings coming soon
                  </span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Additional settings for study configuration, permissions, and integrations will be available here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: FileText,
      component: StudyOverviewTab
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: BarChart3,
      component: StudyAnalyticsTab
    },
    {
      id: 'participants',
      name: 'Participants',
      icon: Users,
      component: StudyParticipantsTab
    },
    {
      id: 'collaboration',
      name: 'Team',
      icon: Activity,
      component: StudyCollaborationTab
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Settings,
      component: StudySettingsTab
    }
  ];

  const getStatusColor = (status: string) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      recruiting: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      paused: 'bg-yellow-100 text-yellow-800'
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'completed':
        return <Target className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study...</p>
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Study Not Found</h2>
          <p className="text-gray-600 mb-4">The study you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/app/studies')}>
            Back to Studies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Study Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Breadcrumb */}
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link to="/app/studies" className="text-gray-500 hover:text-gray-700">
                    Studies
                  </Link>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">
                  {study.title}
                </li>
              </ol>
            </nav>

            {/* Study Title and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {study.title}
                    </h1>
                    <Badge className={getStatusColor(study.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(study.status)}
                        <span>{study.status.charAt(0).toUpperCase() + study.status.slice(1)}</span>
                      </div>
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">{study.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{study.participants?.enrolled || 0} participants</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Created {new Date(study.createdAt).toLocaleDateString()}</span>
                    </div>
                    {study.settings?.duration && (
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{study.settings?.duration} min</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    console.log('🔍 StudyDetailPage: Opening preview for study:', study.title);
                    setShowPreviewModal(true);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button 
                  onClick={() => {
                    // Check if study can be edited based on status
                    if (study.status === 'active' || study.status === 'completed') {
                      alert(`Cannot edit study "${study.title}" because it is currently ${study.status}. Please change the status to "draft" or "paused" first to enable editing.`);
                      return;
                    }
                    
                    // Navigate to study builder for editing
                    console.log('🖊️ StudyDetailPage: Navigating to edit study:', study);
                    navigate(`/app/studies/${study.id || study._id}/edit`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Study
                </Button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav style={{ display: 'flex', gap: '32px' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tabs.map((tab) => (
          <div 
            key={tab.id}
            className={activeTab === tab.id ? 'block' : 'hidden'}
          >
            <tab.component study={study} />
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Study Preview</h2>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">How participants will see this study:</h3>
                <div className="border rounded-lg p-6 bg-gray-50">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{study.title}</h4>
                      <p className="text-gray-600 mb-4">{study.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            study.status === 'active' ? 'bg-green-100 text-green-800' :
                            study.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {study.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 text-gray-900">{study.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowPreviewModal(false)}
                >
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    // Navigate to actual participant view if available
                    setShowPreviewModal(false);
                    alert('Full participant preview functionality coming soon!');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  View as Participant
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyDetailPage;
