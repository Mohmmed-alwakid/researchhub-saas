import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

interface ConnectivityStatus {
  isOnline: boolean;
  apiHealthy: boolean;
  lastChecked: Date;
  message: string;
  severity: 'success' | 'warning' | 'error' | 'info';
}

export function ConnectivityStatusBanner() {
  const [status, setStatus] = useState<ConnectivityStatus>({
    isOnline: navigator.onLine,
    apiHealthy: true,
    lastChecked: new Date(),
    message: 'Checking connectivity...',
    severity: 'info'
  });
  
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const checkConnectivity = async () => {
    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        setStatus({
          isOnline: true,
          apiHealthy: true,
          lastChecked: new Date(),
          message: 'All systems operational',
          severity: 'success'
        });
        setVisible(false);
      } else {
        setStatus({
          isOnline: navigator.onLine,
          apiHealthy: false,
          lastChecked: new Date(),
          message: `API returned ${response.status}. Using fallback mode.`,
          severity: 'warning'
        });
        setVisible(true);
      }
    } catch (error) {
      const isNetworkError = error instanceof Error && 
        (error.name === 'TypeError' || error.message.includes('Failed to fetch'));
      
      setStatus({
        isOnline: navigator.onLine,
        apiHealthy: false,
        lastChecked: new Date(),
        message: isNetworkError 
          ? 'API connection blocked. Running in offline mode with local data.'
          : 'Connection timeout. Check your internet connection.',
        severity: navigator.onLine ? 'warning' : 'error'
      });
      setVisible(true);
    }
  };

  useEffect(() => {
    // Initial check
    checkConnectivity();

    // Periodic checks
    const interval = setInterval(checkConnectivity, 30000);

    // Listen for online/offline events
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      checkConnectivity();
    };
    
    const handleOffline = () => {
      setStatus(prev => ({ 
        ...prev, 
        isOnline: false, 
        apiHealthy: false,
        message: 'You are offline. Limited functionality available.',
        severity: 'error'
      }));
      setVisible(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!visible || dismissed) {
    return null;
  }

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getIcon = () => {
    if (!status.isOnline) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (!status.apiHealthy) {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className={`
      border-l-4 p-4 mb-4 rounded-r-md transition-all duration-300
      ${getSeverityStyles(status.severity)}
    `}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {status.message}
            </p>
            <button
              onClick={() => setDismissed(true)}
              className="text-xs opacity-70 hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
          <div className="mt-1 text-xs opacity-70">
            Last checked: {status.lastChecked.toLocaleTimeString()}
            {!status.isOnline && (
              <span className="ml-2 inline-flex items-center">
                <Wifi className="h-3 w-3 mr-1" />
                Check your internet connection
              </span>
            )}
          </div>
          {status.severity === 'warning' && (
            <div className="mt-2 text-xs">
              💡 <strong>Tip:</strong> The application is running in fallback mode. 
              Some features may have limited functionality, but core operations will continue to work.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConnectivityStatusBanner;
