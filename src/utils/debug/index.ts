/**
 * �️ Debug Utils - Complete ResearchHub Debugging Toolkit
 * Phase 1: Foundation (Sentry, DevDebugConsole, SmartErrorBoundary)
 * Phase 2: Research Intelligence (ResearchFlowMonitor, BusinessLogicValidator, PerformanceIntelligence)
 */

// Phase 1: Professional Foundation
export { default as sentryIntegration } from './SentryIntegrationSimple';
export { default as devDebugConsole } from './DevDebugConsole';
export { default as SmartErrorBoundary } from './ErrorBoundary/SmartErrorBoundary';

// Phase 2: Research-Specific Intelligence  
export { default as researchFlowMonitor } from './ResearchFlowMonitor';
export { default as businessLogicValidator } from './BusinessLogicValidator';
export { default as performanceIntelligence } from './PerformanceIntelligence';

// Debug utility functions (enhanced with Phase 2 tools)
export const debugUtils = {
  /**
   * Log study-related events
   */
  logStudyEvent: (action: string, studyId: string, context?: Record<string, unknown>) => {
    import('./DevDebugConsole').then(({ default: console }) => {
      console.logStudyAction(action, studyId, context);
    });
    // Integrate with ResearchFlowMonitor for comprehensive tracking
    import('./ResearchFlowMonitor').then(({ default: monitor }) => {
      monitor.trackStudyStep(studyId, action, context);
    });
  },

  /**
   * Log participant journey events
   */
  logParticipantEvent: (step: string, context?: Record<string, unknown>) => {
    import('./DevDebugConsole').then(({ default: console }) => {
      console.logParticipantJourney(step, context);
    });
    // Integrate with ResearchFlowMonitor for journey tracking
    const participantId = context?.participantId as string || 'anonymous';
    const blockIndex = context?.blockIndex as number || 0;
    import('./ResearchFlowMonitor').then(({ default: monitor }) => {
      monitor.trackParticipantBlock(participantId, step, blockIndex, Date.now());
    });
  },

  /**
   * Log payment events
   */
  logPaymentEvent: (action: string, context?: Record<string, unknown>) => {
    import('./DevDebugConsole').then(({ default: console }) => {
      console.logPaymentEvent(action, context);
    });
    // Integrate with BusinessLogicValidator for transaction validation
    if (context && action.includes('transaction')) {
      import('./BusinessLogicValidator').then(({ default: validator }) => {
        const transaction = {
          id: context.transactionId as string || 'temp-' + Date.now(),
          type: context.type as 'earn' | 'spend' | 'transfer' | 'refund' || 'earn',
          amount: context.amount as number || 0,
          participantId: context.participantId as string,
          researcherId: context.researcherId as string,
          studyId: context.studyId as string,
          timestamp: Date.now(),
          metadata: context
        };
        validator.validatePointsTransaction(transaction);
      });
    }
  },

  /**
   * Validate business logic (NEW - Phase 2)
   */
  validateBusinessLogic: (type: 'points' | 'roles' | 'pricing', data: unknown) => {
    import('./BusinessLogicValidator').then(({ default: validator }) => {
      switch (type) {
        case 'points':
          return validator.validatePointsTransaction(data as {
            id: string; type: 'earn' | 'spend' | 'transfer' | 'refund'; amount: number;
            participantId?: string; researcherId?: string; studyId?: string; timestamp: number;
          });
        case 'roles':
          return validator.validateRoleAction(data as {
            userId: string; role: 'researcher' | 'participant' | 'admin';
            action: string; resource: string; timestamp: number; allowed: boolean;
          });
        case 'pricing':
          return validator.validateStudyPricing(data as {
            studyId: string; blocksCount: number; studyType: 'unmoderated' | 'moderated';
            participantReward: number; researcherCost: number; platformFee: number; calculatedAt: number;
          });
        default:
          console.warn('Unknown validation type:', type);
      }
    });
  },

  /**
   * Track performance metrics (NEW - Phase 2)
   */
  trackPerformance: (type: 'api' | 'component' | 'study-builder', data: unknown) => {
    import('./PerformanceIntelligence').then(({ default: performance }) => {
      switch (type) {
        case 'api':
          performance.trackAPIPerformance(data as {
            endpoint: string; method: string; responseTime: number; statusCode: number;
            payloadSize: number; cached: boolean; retries: number; error?: string;
          });
          break;
        case 'component':
          performance.trackComponentPerformance(data as {
            componentName: string; renderTime: number; mountTime: number;
            updateCount: number; errorCount: number; props?: Record<string, unknown>;
          });
          break;
        case 'study-builder':
          performance.trackStudyBuilderPerformance(data as {
            studyId: string; blocksCount: number; loadTime: number; saveTime: number;
            validationTime: number; previewTime: number; operationCounts: Record<string, number>;
            memoryUsage: number;
          });
          break;
        default:
          console.warn('Unknown performance tracking type:', type);
      }
    });
  },

  /**
   * Get comprehensive debug report (NEW - Phase 2)
   */
  getDebugReport: async () => {
    try {
      const [monitor, validator, performance] = await Promise.all([
        import('./ResearchFlowMonitor').then(m => m.default),
        import('./BusinessLogicValidator').then(m => m.default),
        import('./PerformanceIntelligence').then(m => m.default)
      ]);

      return {
        flows: monitor.getFlowAnalytics(),
        validation: validator.getValidationStats(),
        performance: performance.getPerformanceSummary(),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to generate debug report:', error);
      return { error: 'Failed to generate debug report', timestamp: Date.now() };
    }
  },

  /**
   * Take debug snapshot (enhanced)
   */
  takeSnapshot: () => {
    import('./DevDebugConsole').then(({ default: console }) => {
      console.takeDebugSnapshot();
    });
  },

  /**
   * Show performance metrics (enhanced)
   */
  showPerformance: () => {
    import('./PerformanceIntelligence').then(({ default: performance }) => {
      const summary = performance.getPerformanceSummary();
      import('./DevDebugConsole').then(({ default: console }) => {
        console.log('Performance Intelligence Summary', summary, 'info');
      });
    });
  },

  /**
   * Show error history
   */
  showErrors: () => {
    import('./DevDebugConsole').then(({ default: console }) => {
      console.showErrorHistory();
    });
  },

  /**
   * Toggle debug overlay
   */
  toggleOverlay: () => {
    import('./DevDebugConsole').then(({ default: console }) => {
      console.toggleDebugOverlay();
    });
  },

  /**
   * Show research flow analytics (NEW - Phase 2)
   */
  showFlowAnalytics: () => {
    import('./ResearchFlowMonitor').then(({ default: monitor }) => {
      const analytics = monitor.getFlowAnalytics();
      import('./DevDebugConsole').then(({ default: console }) => {
        console.log('Research Flow Analytics', analytics, 'info');
      });
    });
  },

  /**
   * Show validation statistics (NEW - Phase 2)
   */
  showValidationStats: () => {
    import('./BusinessLogicValidator').then(({ default: validator }) => {
      const stats = validator.getValidationStats();
      import('./DevDebugConsole').then(({ default: console }) => {
        console.log('Business Logic Validation Stats', stats, 'info');
      });
    });
  }
};

/**
 * 🚀 Quick Start Debug Setup
 * Call this in your main.tsx to initialize all debugging tools
 */
export const initializeDebugSuite = (): void => {
  if (import.meta.env.DEV) {
    console.log('🛠️ ResearchHub Debug Suite Initialized');
    console.log('📊 Available tools:');
    console.log('  • Sentry Error Tracking (Production)');
    console.log('  • Dev Debug Console (Ctrl+Shift+D)');
    console.log('  • Smart Error Boundaries (Automatic)');
    console.log('  • Research Flow Monitor (Study tracking)');
    console.log('  • Business Logic Validator (Points & roles)');
    console.log('  • Performance Intelligence (Speed monitoring)');
    console.log('🔧 Use npm run debug:* commands for advanced debugging');
    console.log('🌐 Global debug tools available at: window.ResearchHubDebugUtils');
  }
};

// Make debug utils globally available in development
if (import.meta.env.DEV) {
  (window as unknown as { ResearchHubDebugUtils: typeof debugUtils }).ResearchHubDebugUtils = debugUtils;
}

/**
 * 📋 Debug Command Reference
 * 
 * Development Commands:
 * npm run debug:console     - Show debug console
 * npm run debug:snapshot    - Take system snapshot
 * npm run debug:performance - Performance analysis
 * npm run debug:validation  - Business logic validation
 * npm run debug:flow        - Research flow analysis
 * npm run debug:errors      - Error tracking summary
 * npm run debug:all         - Complete debug report
 * 
 * Keyboard Shortcuts:
 * Ctrl+Shift+D     - Toggle debug console
 * Ctrl+Shift+E     - Take error snapshot  
 * Ctrl+Shift+P     - Performance snapshot
 * Ctrl+Shift+V     - Validation report
 * Ctrl+Shift+F     - Flow analysis
 * 
 * Global Debug Functions (window.ResearchHubDebugUtils):
 * - logStudyEvent(action, studyId, context)
 * - logParticipantEvent(step, context)
 * - validateBusinessLogic(type, data)
 * - trackPerformance(type, data)
 * - getDebugReport()
 * - showPerformance()
 * - showFlowAnalytics()
 * - showValidationStats()
 */
