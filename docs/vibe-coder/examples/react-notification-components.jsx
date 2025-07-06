/**
 * React integration examples for ResearchHub notification system
 * Shows how to use SSE notifications in React components
 * Based on Vibe-Coder-MCP architectural patterns
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NotificationIntegration, NotificationClient } from '../../../src/shared/notifications';

/**
 * Custom React hook for notifications
 */
export function useNotifications(userId, channels = ['user-notifications']) {
  const [client, setClient] = useState(null);
  const [state, setState] = useState({ status: 'disconnected', reconnectAttempts: 0 });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Create notification client
    const notificationClient = new NotificationClient({
      baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3003',
      userId,
      channels,
      autoReconnect: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      enablePersistence: true,
      maxStoredNotifications: 100
    });

    setClient(notificationClient);

    // Connect to notifications
    notificationClient.connect().catch(error => {
      console.error('Failed to connect to notifications:', error);
    });

    // Listen for state changes
    const handleStateChange = (event) => {
      setState(event.detail);
    };

    // Listen for notifications
    const handleNotification = (event) => {
      setNotifications(prev => [event.detail, ...prev.slice(0, 49)]); // Keep last 50
    };

    window.addEventListener('notification-state-change', handleStateChange);
    window.addEventListener('notification-received', handleNotification);

    return () => {
      window.removeEventListener('notification-state-change', handleStateChange);
      window.removeEventListener('notification-received', handleNotification);
      notificationClient.disconnect();
    };
  }, [userId, channels.join(',')]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    if (client) {
      client.clearStoredNotifications();
    }
  }, [client]);

  const markAsRead = useCallback((notificationId) => {
    if (client) {
      client.markAsRead(notificationId);
    }
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, [client]);

  return {
    client,
    state,
    notifications,
    clearNotifications,
    markAsRead,
    isConnected: state.status === 'connected'
  };
}

/**
 * Job progress notification component
 */
export function JobProgressNotifications({ userId }) {
  const [jobProgress, setJobProgress] = useState({});
  const { client, isConnected } = useNotifications(userId, ['job-progress', 'job-completed']);

  useEffect(() => {
    if (!client) return;

    // Listen for job progress
    const unsubscribeProgress = client.onJobProgress((data) => {
      setJobProgress(prev => ({
        ...prev,
        [data.jobId]: {
          ...data,
          lastUpdate: new Date()
        }
      }));
    });

    // Listen for job completion
    const unsubscribeCompletion = client.onJobCompletion((data) => {
      setJobProgress(prev => ({
        ...prev,
        [data.jobId]: {
          ...prev[data.jobId],
          ...data,
          completed: true,
          lastUpdate: new Date()
        }
      }));

      // Remove completed job after 5 seconds
      setTimeout(() => {
        setJobProgress(prev => {
          const updated = { ...prev };
          delete updated[data.jobId];
          return updated;
        });
      }, 5000);
    });

    return () => {
      unsubscribeProgress();
      unsubscribeCompletion();
    };
  }, [client]);

  if (!isConnected) {
    return (
      <div className="notification-status">
        <span className="status-indicator offline">⚫</span>
        Connecting to notifications...
      </div>
    );
  }

  const activeJobs = Object.values(jobProgress).filter(job => !job.completed);
  const completedJobs = Object.values(jobProgress).filter(job => job.completed);

  return (
    <div className="job-notifications">
      <div className="notification-status">
        <span className="status-indicator online">🟢</span>
        Connected to notifications
      </div>

      {activeJobs.length > 0 && (
        <div className="active-jobs">
          <h4>Active Jobs</h4>
          {activeJobs.map(job => (
            <div key={job.jobId} className="job-progress">
              <div className="job-info">
                <span className="job-id">{job.jobId}</span>
                <span className="job-status">{job.status}</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              <div className="progress-text">{job.progress}%</div>
              {job.message && <div className="job-message">{job.message}</div>}
            </div>
          ))}
        </div>
      )}

      {completedJobs.length > 0 && (
        <div className="completed-jobs">
          <h4>Recently Completed</h4>
          {completedJobs.map(job => (
            <div key={job.jobId} className={`job-result ${job.success ? 'success' : 'error'}`}>
              <span className="job-id">{job.jobId}</span>
              <span className="job-outcome">
                {job.success ? '✅ Completed' : '❌ Failed'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Study update notifications component
 */
export function StudyUpdateNotifications({ userId, studyId }) {
  const [studyUpdates, setStudyUpdates] = useState([]);
  const { client, isConnected } = useNotifications(userId, ['study-updates']);

  useEffect(() => {
    if (!client) return;

    const unsubscribe = client.onStudyUpdate((data) => {
      // Filter for specific study if provided
      if (studyId && data.studyId !== studyId) return;

      setStudyUpdates(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 updates
    });

    return unsubscribe;
  }, [client, studyId]);

  return (
    <div className="study-notifications">
      <h4>Study Updates</h4>
      {!isConnected && <div className="connecting">Connecting...</div>}
      
      {studyUpdates.length === 0 ? (
        <div className="no-updates">No recent updates</div>
      ) : (
        <div className="updates-list">
          {studyUpdates.map((update, index) => (
            <div key={index} className="study-update">
              <div className="update-type">{update.updateType}</div>
              <div className="study-id">Study: {update.studyId}</div>
              {update.data && (
                <div className="update-data">
                  {JSON.stringify(update.data, null, 2)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * System alerts component
 */
export function SystemAlerts({ userId }) {
  const [alerts, setAlerts] = useState([]);
  const { client, isConnected } = useNotifications(userId, ['system-alerts']);

  useEffect(() => {
    if (!client) return;

    const unsubscribe = client.onSystemAlert((data) => {
      const alert = {
        ...data,
        id: Date.now(),
        timestamp: new Date()
      };
      
      setAlerts(prev => [alert, ...prev.slice(0, 4)]); // Keep last 5 alerts

      // Auto-remove low priority alerts after 10 seconds
      if (data.priority === 'low') {
        setTimeout(() => {
          setAlerts(prev => prev.filter(a => a.id !== alert.id));
        }, 10000);
      }
    });

    return unsubscribe;
  }, [client]);

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  return (
    <div className="system-alerts">
      {alerts.map(alert => (
        <div 
          key={alert.id} 
          className={`alert alert-${alert.priority}`}
        >
          <div className="alert-header">
            <span className="alert-title">{alert.title}</span>
            <button 
              className="alert-close"
              onClick={() => removeAlert(alert.id)}
            >
              ×
            </button>
          </div>
          <div className="alert-message">{alert.message}</div>
          <div className="alert-time">
            {alert.timestamp.toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Notification dashboard component combining all notification types
 */
export function NotificationDashboard({ userId }) {
  const { state, notifications, clearNotifications } = useNotifications(userId, [
    'user-notifications',
    'job-progress',
    'job-completed',
    'study-updates',
    'system-alerts'
  ]);

  return (
    <div className="notification-dashboard">
      <div className="dashboard-header">
        <h3>Notifications</h3>
        <div className="dashboard-controls">
          <div className={`connection-status ${state.status}`}>
            {state.status === 'connected' ? '🟢' : state.status === 'connecting' ? '🟡' : '🔴'}
            {state.status}
          </div>
          <button onClick={clearNotifications}>Clear All</button>
        </div>
      </div>

      <div className="dashboard-sections">
        <section>
          <JobProgressNotifications userId={userId} />
        </section>
        
        <section>
          <StudyUpdateNotifications userId={userId} />
        </section>
        
        <section>
          <SystemAlerts userId={userId} />
        </section>
      </div>

      <div className="all-notifications">
        <h4>All Notifications ({notifications.length})</h4>
        <div className="notifications-list">
          {notifications.slice(0, 20).map(notification => (
            <div key={notification.id} className="notification-item">
              <div className="notification-header">
                <span className="notification-channel">{notification.channel}</span>
                <span className="notification-time">
                  {new Date(notification.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="notification-title">{notification.title}</div>
              {notification.message && (
                <div className="notification-message">{notification.message}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// CSS styles (would typically be in a separate file)
export const notificationStyles = `
.notification-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.dashboard-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.connection-status {
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
}

.connection-status.connected {
  background: #d4edda;
  color: #155724;
}

.connection-status.connecting {
  background: #fff3cd;
  color: #856404;
}

.connection-status.disconnected, .connection-status.error {
  background: #f8d7da;
  color: #721c24;
}

.job-progress {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 5px 0;
}

.progress-fill {
  height: 100%;
  background: #007bff;
  transition: width 0.3s ease;
}

.alert {
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  position: relative;
}

.alert-urgent {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.alert-high {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.alert-normal {
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  color: #0c5460;
}

.alert-low {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert-close {
  position: absolute;
  top: 5px;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.notification-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 5px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.notification-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.notification-message {
  color: #495057;
  font-size: 14px;
}
`;
