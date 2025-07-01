import React, { useState } from 'react';
import { AlertCircle, Bug, Zap, Smartphone, Lightbulb, X, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePerformanceMonitor } from '../../services/performance.service';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface PerformanceReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'performance' | 'error' | 'ui_issue' | 'bug' | 'feature_request';
  initialDescription?: string;
}

const issueTypes = [
  {
    value: 'performance',
    label: 'Performance Issue',
    icon: Zap,
    description: 'Slow loading, lag, or performance problems'
  },
  {
    value: 'error',
    label: 'Error/Crash',
    icon: AlertCircle,
    description: 'Something broke or stopped working'
  },
  {
    value: 'ui_issue',
    label: 'UI/Design Issue',
    icon: Smartphone,
    description: 'Visual problems, layout issues, or confusing interface'
  },
  {
    value: 'bug',
    label: 'Bug/Unexpected Behavior',
    icon: Bug,
    description: 'Feature not working as expected'
  },
  {
    value: 'feature_request',
    label: 'Feature Request',
    icon: Lightbulb,
    description: 'Suggestion for new functionality or improvement'
  }
];

const severityLevels = [
  { value: 'low', label: 'Low', description: 'Minor inconvenience' },
  { value: 'medium', label: 'Medium', description: 'Affects usability' },
  { value: 'high', label: 'High', description: 'Blocks important functionality' },
  { value: 'critical', label: 'Critical', description: 'Prevents system use' }
];

export const PerformanceReportModal: React.FC<PerformanceReportModalProps> = ({
  isOpen,
  onClose,
  initialType = 'bug',
  initialDescription = ''
}) => {
  const [type, setType] = useState(initialType);
  const [description, setDescription] = useState(initialDescription);
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [includeSystemInfo, setIncludeSystemInfo] = useState(true);
  const { reportIssue, isReporting, getSystemInfo, getPerformanceData } = usePerformanceMonitor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please provide a description of the issue');
      return;
    }

    try {
      const systemInfo = includeSystemInfo ? getSystemInfo() : null;
      const performanceData = getPerformanceData();
      
      const success = await reportIssue({
        type,
        description: description.trim(),
        severity,
        performanceMetrics: performanceData.length > 0 ? {
          loadTime: performanceData[performanceData.length - 1]?.pageLoadTime || 0,
          renderTime: performanceData[performanceData.length - 1]?.firstContentfulPaint || 0,
          memoryUsage: performanceData[performanceData.length - 1]?.memoryUsage,
          networkRequests: performanceData[performanceData.length - 1]?.networkRequests
        } : undefined,
        // Include system info in description if enabled
        ...systemInfo && {
          description: `${description.trim()}\n\n--- System Info ---\n${JSON.stringify(systemInfo, null, 2)}`
        }
      });

      if (success) {
        toast.success('Issue reported successfully! Thank you for your feedback.');
        onClose();
        setDescription('');
        setType('bug');
        setSeverity('medium');
      } else {
        toast.error('Failed to report issue. Please try again.');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      toast.error('Failed to report issue. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Report an Issue</h2>
            <p className="text-sm text-gray-600 mt-1">
              Help us improve ResearchHub by reporting bugs, performance issues, or suggesting features
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Issue Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What type of issue are you experiencing?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {issueTypes.map((issueType) => {
                  const Icon = issueType.icon;
                  return (
                    <button
                      key={issueType.value}
                      type="button"
                      onClick={() => setType(issueType.value as typeof type)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        type === issueType.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${
                          type === issueType.value ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium text-sm">{issueType.label}</div>
                          <div className="text-xs text-gray-500">{issueType.description}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Severity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How severe is this issue?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {severityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setSeverity(level.value as typeof severity)}
                    className={`p-2 border rounded-lg text-center transition-colors ${
                      severity === level.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{level.label}</div>
                    <div className="text-xs text-gray-500">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Describe the issue *
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please provide as much detail as possible:
• What were you trying to do?
• What happened instead?
• Steps to reproduce the issue
• Any error messages you saw"
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/1000 characters
              </div>
            </div>

            {/* System Info Toggle */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="includeSystemInfo"
                checked={includeSystemInfo}
                onChange={(e) => setIncludeSystemInfo(e.target.checked)}
                className="mt-1"
              />
              <div>
                <label htmlFor="includeSystemInfo" className="text-sm font-medium text-gray-700">
                  Include system information
                </label>
                <p className="text-xs text-gray-500">
                  This helps us debug the issue faster (browser, screen size, performance data)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isReporting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isReporting || !description.trim()}
                className="flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>{isReporting ? 'Sending...' : 'Send Report'}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceReportModal;
