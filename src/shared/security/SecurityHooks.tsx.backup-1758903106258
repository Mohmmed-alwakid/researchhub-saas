/**
 * SecurityHooks - React hooks for security management in ResearchHub
 * Based on Vibe-Coder-MCP architectural patterns
 * 
 * Provides React hooks for:
 * - Authentication state management
 * - Authorization checks
 * - Security event monitoring
 * - Input validation
 * - Session management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getSecurityManager, 
  SecurityEvent, 
  SecurityEventType, 
  SecuritySeverity,
  UserSecurityContext,
  SecurityMetrics
} from './SecurityManager';

/**
 * Hook for managing authentication state
 */
export function useAuthentication(userId?: string) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [context, setContext] = useState<UserSecurityContext | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<string[]>([]);

  const securityManager = getSecurityManager();

  const validateAuth = useCallback(async (token?: string) => {
    if (!userId || !token) {
      setIsAuthenticated(false);
      setContext(null);
      setLoading(false);
      return;
    }

    try {
      const result = securityManager.validateAuthentication(token, userId);
      setIsAuthenticated(result.isValid);
      setContext(result.context || null);
      setErrors(result.errors);
      
      if (!result.isValid) {
        securityManager.recordEvent(
          'authentication_failure',
          'medium',
          { userId, errors: result.errors }
        );
      }
    } catch (error: unknown) {
      console.error('Authentication validation failed:', error);
      setIsAuthenticated(false);
      setContext(null);
      setErrors(['Authentication validation failed']);
    } finally {
      setLoading(false);
    }
  }, [userId, securityManager]);

  const logout = useCallback(() => {
    if (userId) {
      securityManager.invalidateUserSession(userId);
    }
    setIsAuthenticated(false);
    setContext(null);
    setErrors([]);
  }, [userId, securityManager]);

  useEffect(() => {
    // Get token from localStorage or context
    const token = localStorage.getItem('auth_token');
    validateAuth(token || undefined);
  }, [validateAuth]);

  return {
    isAuthenticated,
    context,
    loading,
    errors,
    validateAuth,
    logout
  };
}

/**
 * Hook for checking user authorization
 */
export function useAuthorization(userId?: string) {
  const securityManager = getSecurityManager();

  const checkPermission = useCallback((
    action: string,
    resource?: string,
    resourceData?: Record<string, unknown>
  ) => {
    if (!userId) {
      return { authorized: false, reason: 'User not authenticated' };
    }

    return securityManager.checkAuthorization(userId, action, resource, resourceData);
  }, [userId, securityManager]);

  const hasPermission = useCallback((action: string, resource?: string) => {
    return checkPermission(action, resource).authorized;
  }, [checkPermission]);

  const requirePermission = useCallback((action: string, resource?: string) => {
    const result = checkPermission(action, resource);
    if (!result.authorized) {
      throw new Error(`Access denied: ${result.reason}`);
    }
    return true;
  }, [checkPermission]);

  return {
    checkPermission,
    hasPermission,
    requirePermission
  };
}

/**
 * Hook for monitoring security events
 */
export function useSecurityEvents(eventTypes?: SecurityEventType[], autoRefresh = true) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const securityManager = getSecurityManager();

  const refreshEvents = useCallback(() => {
    try {
      const allEvents = securityManager['events'] || []; // Access private property for demo
      
      let filteredEvents = allEvents;
      if (eventTypes && eventTypes.length > 0) {
        filteredEvents = allEvents.filter(event => eventTypes.includes(event.type));
      }

      setEvents([...filteredEvents].reverse()); // Latest first
      setMetrics(securityManager.getMetrics());
    } catch (error) {
      console.error('Failed to refresh security events:', error);
    } finally {
      setLoading(false);
    }
  }, [eventTypes, securityManager]);

  useEffect(() => {
    // Initial load
    refreshEvents();

    // Set up event listeners
    const listeners = new Map<SecurityEventType, (event: SecurityEvent) => void>();
    
    if (autoRefresh) {
      const typesToListen = eventTypes || [
        'authentication_failure',
        'authorization_denied',
        'suspicious_activity',
        'xss_attempt',
        'csrf_attempt',
        'sql_injection_attempt'
      ];

      typesToListen.forEach(type => {
        const listener = (event: SecurityEvent) => {
          setEvents(prev => [event, ...prev]);
          // Update metrics after new event
          setTimeout(() => {
            setMetrics(securityManager.getMetrics());
          }, 100);
        };

        securityManager.addEventListener(type, listener);
        listeners.set(type, listener);
      });
    }

    // Auto-refresh metrics every 30 seconds
    let intervalId: NodeJS.Timeout | undefined;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        setMetrics(securityManager.getMetrics());
      }, 30000);
    }

    return () => {
      // Cleanup listeners
      listeners.forEach((listener, type) => {
        securityManager.removeEventListener(type, listener);
      });

      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, eventTypes, refreshEvents, securityManager]);

  const recordEvent = useCallback((
    type: SecurityEventType,
    severity: SecuritySeverity,
    details: Record<string, unknown>,
    userId?: string
  ) => {
    return securityManager.recordEvent(type, severity, details, userId);
  }, [securityManager]);

  return {
    events,
    metrics,
    loading,
    refreshEvents,
    recordEvent
  };
}

/**
 * Hook for input validation and sanitization
 */
export function useInputValidation() {
  const [validationResults, setValidationResults] = useState<Map<string, {
    isValid: boolean;
    threats: string[];
    sanitized: string;
  }>>(new Map());

  const securityManager = getSecurityManager();

  const validateInput = useCallback((
    input: string,
    context: string = 'general',
    fieldName?: string
  ) => {
    const result = securityManager.validateInput(input, context);
    
    if (fieldName) {
      setValidationResults(prev => new Map(prev.set(fieldName, result)));
    }

    return result;
  }, [securityManager]);

  const getValidationResult = useCallback((fieldName: string) => {
    return validationResults.get(fieldName);
  }, [validationResults]);

  const clearValidation = useCallback((fieldName?: string) => {
    if (fieldName) {
      setValidationResults(prev => {
        const newMap = new Map(prev);
        newMap.delete(fieldName);
        return newMap;
      });
    } else {
      setValidationResults(new Map());
    }
  }, []);

  return {
    validateInput,
    getValidationResult,
    clearValidation,
    validationResults: Object.fromEntries(validationResults)
  };
}

/**
 * Hook for session management
 */
export function useSession(userId?: string) {
  const [sessionActive, setSessionActive] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<Date | null>(null);
  const [warningShown, setWarningShown] = useState<boolean>(false);

  const securityManager = getSecurityManager();
  const activityTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const warningTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const updateActivity = useCallback(() => {
    const now = new Date();
    setLastActivity(now);
    setWarningShown(false);

    // Reset warning timer
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    // Set warning timer (5 minutes before session expires)
    const sessionTimeout = securityManager['configuration'].sessionTimeout;
    const warningTime = sessionTimeout - (5 * 60 * 1000); // 5 minutes before

    if (warningTime > 0) {
      warningTimerRef.current = setTimeout(() => {
        setWarningShown(true);
      }, warningTime);
    }

    // Reset activity timer
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    activityTimerRef.current = setTimeout(() => {
      setSessionActive(false);
      if (userId) {
        securityManager.invalidateUserSession(userId);
      }
    }, sessionTimeout);
  }, [userId, securityManager]);

  const extendSession = useCallback(() => {
    updateActivity();
  }, [updateActivity]);

  const endSession = useCallback(() => {
    setSessionActive(false);
    setLastActivity(null);
    setWarningShown(false);

    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    if (userId) {
      securityManager.invalidateUserSession(userId);
    }
  }, [userId, securityManager]);

  useEffect(() => {
    if (userId) {
      setSessionActive(true);
      updateActivity();

      // Listen for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      const activityHandler = () => updateActivity();

      events.forEach(event => {
        document.addEventListener(event, activityHandler, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, activityHandler, true);
        });

        if (activityTimerRef.current) {
          clearTimeout(activityTimerRef.current);
        }
        if (warningTimerRef.current) {
          clearTimeout(warningTimerRef.current);
        }
      };
    }
  }, [userId, updateActivity]);

  return {
    sessionActive,
    lastActivity,
    warningShown,
    extendSession,
    endSession,
    updateActivity
  };
}

/**
 * Hook for trust score monitoring
 */
export function useTrustScore(userId?: string) {
  const [trustScore, setTrustScore] = useState<number>(1.0);
  const [trustHistory, setTrustHistory] = useState<{ score: number; timestamp: Date; reason: string }[]>([]);

  const securityManager = getSecurityManager();

  const updateTrustScore = useCallback((delta: number, reason: string) => {
    if (!userId) return;

    securityManager.updateTrustScore(userId, delta, reason);
    
    // Get updated context
    const context = securityManager['userContexts'].get(userId);
    if (context) {
      setTrustScore(context.trustScore);
      setTrustHistory(prev => [...prev, {
        score: context.trustScore,
        timestamp: new Date(),
        reason
      }]);
    }
  }, [userId, securityManager]);

  const getTrustLevel = useCallback((score: number = trustScore): string => {
    if (score >= 0.9) return 'excellent';
    if (score >= 0.7) return 'good';
    if (score >= 0.5) return 'moderate';
    if (score >= 0.3) return 'low';
    return 'critical';
  }, [trustScore]);

  useEffect(() => {
    if (userId) {
      const context = securityManager['userContexts'].get(userId);
      if (context) {
        setTrustScore(context.trustScore);
      }
    }
  }, [userId, securityManager]);

  return {
    trustScore,
    trustHistory,
    updateTrustScore,
    getTrustLevel,
    trustLevel: getTrustLevel()
  };
}

/**
 * Hook for security alerts
 */
export function useSecurityAlerts(autoRefresh = true) {
  const [alerts, setAlerts] = useState<SecurityEvent[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const securityManager = getSecurityManager();

  const refreshAlerts = useCallback(() => {
    // Get high and critical severity events as alerts
    const allEvents = securityManager['events'] || [];
    const alertEvents = allEvents.filter(event => 
      (event.severity === 'high' || event.severity === 'critical') && !event.resolved
    );

    setAlerts(alertEvents);
    setUnreadCount(alertEvents.length);
  }, [securityManager]);

  const markAsRead = useCallback((eventId: string) => {
    securityManager.resolveEvent(eventId, 'marked_as_read');
    refreshAlerts();
  }, [securityManager, refreshAlerts]);

  const markAllAsRead = useCallback(() => {
    alerts.forEach(alert => {
      securityManager.resolveEvent(alert.id, 'marked_as_read');
    });
    refreshAlerts();
  }, [alerts, securityManager, refreshAlerts]);

  useEffect(() => {
    refreshAlerts();

    if (autoRefresh) {
      const interval = setInterval(refreshAlerts, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshAlerts]);

  return {
    alerts,
    unreadCount,
    refreshAlerts,
    markAsRead,
    markAllAsRead
  };
}

/**
 * Hook for ResearchHub-specific security features
 */
export function useResearchHubSecurity(userId?: string, role?: string) {
  const securityManager = getSecurityManager();
  const { hasPermission } = useAuthorization(userId);
  const { recordEvent } = useSecurityEvents([], false);

  const validateStudyAccess = useCallback((studyId: string, action: 'read' | 'write' | 'delete') => {
    if (!userId) return { allowed: false, reason: 'Not authenticated' };

    const permission = `studies:${action}`;
    if (!hasPermission(permission)) {
      recordEvent('authorization_denied', 'medium', {
        userId,
        studyId,
        action,
        reason: 'insufficient_permissions'
      });
      return { allowed: false, reason: 'Insufficient permissions' };
    }

    return { allowed: true };
  }, [userId, hasPermission, recordEvent]);

  const validateParticipantData = useCallback((data: Record<string, unknown>) => {
    const violations: string[] = [];

    // Check for personally identifiable information
    const piiFields = ['email', 'phone', 'address', 'ssn', 'credit_card'];
    const dataString = JSON.stringify(data).toLowerCase();

    piiFields.forEach(field => {
      if (dataString.includes(field)) {
        violations.push(`Potential PII detected: ${field}`);
      }
    });

    // Check for suspicious patterns
    if (dataString.includes('script') || dataString.includes('javascript')) {
      violations.push('Potential XSS content detected');
    }

    if (violations.length > 0) {
      recordEvent('data_breach_attempt', 'high', {
        userId,
        violations,
        dataPreview: JSON.stringify(data).substring(0, 100)
      });
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }, [userId, recordEvent]);

  const trackStudyInteraction = useCallback((studyId: string, action: string, details?: Record<string, unknown>) => {
    recordEvent('suspicious_activity', 'low', {
      userId,
      studyId,
      action,
      ...details
    });
  }, [userId, recordEvent]);

  const validateResearcherActions = useCallback((action: string, targetUserId?: string) => {
    if (role !== 'researcher' && role !== 'admin') {
      recordEvent('privilege_escalation', 'high', {
        userId,
        role,
        attemptedAction: action,
        targetUserId
      });
      return { allowed: false, reason: 'Invalid role for action' };
    }

    // Additional validation for sensitive researcher actions
    if (action === 'approve_application' || action === 'reject_application') {
      const context = securityManager['userContexts'].get(userId || '');
      if (context && context.trustScore < 0.8) {
        recordEvent('suspicious_activity', 'medium', {
          userId,
          action,
          trustScore: context.trustScore,
          reason: 'low_trust_score_for_sensitive_action'
        });
        return { allowed: false, reason: 'Trust score too low for this action' };
      }
    }

    return { allowed: true };
  }, [role, userId, recordEvent, securityManager]);

  return {
    validateStudyAccess,
    validateParticipantData,
    trackStudyInteraction,
    validateResearcherActions
  };
}
