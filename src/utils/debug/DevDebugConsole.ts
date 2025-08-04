/**
 * 🔧 Development Debug Console for ResearchHub
 * Enhanced local debugging with ResearchHub-specific features
 */

interface DebugLogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error' | 'study' | 'journey' | 'payment';
  context: Record<string, unknown>;
  stack?: string;
  component?: string;
  route: string;
  user?: string;
}

class DevDebugConsole {
  private isEnabled: boolean;
  private debugHistory: DebugLogEntry[] = [];
  private researchContext: Map<string, unknown> = new Map();
  private overlayVisible: boolean = false;

  constructor() {
    this.isEnabled = import.meta.env.DEV;
    this.loadFromStorage(); // Load previous debug history
    this.initializeHotkeys();
    this.addToWindow();
  }

  /**
   * Enhanced logging with context
   */
  log(message: string, context: Record<string, unknown> = {}, level: DebugLogEntry['level'] = 'info'): void {
    if (!this.isEnabled) return;

    const logEntry: DebugLogEntry = {
      timestamp: new Date().toISOString(),
      message,
      level,
      context,
      stack: new Error().stack,
      component: this.getCurrentComponent(),
      route: window.location.pathname,
      user: this.getCurrentUser()
    };

    this.debugHistory.push(logEntry);
    
    // Keep only last 100 entries
    if (this.debugHistory.length > 100) {
      this.debugHistory = this.debugHistory.slice(-100);
    }

    this.renderToConsole(logEntry);
    
    // Store in localStorage for persistence
    this.saveToStorage();
  }

  /**
   * Research-specific logging methods
   */
  logStudyAction(action: string, studyId: string, context: Record<string, unknown> = {}): void {
    if (!this.isEnabled) return;
    
    this.log(`STUDY_${action.toUpperCase()}`, {
      studyId,
      timestamp: Date.now(),
      userRole: this.getCurrentUserRole(),
      ...context
    }, 'study');
  }

  logParticipantJourney(step: string, context: Record<string, unknown> = {}): void {
    if (!this.isEnabled) return;
    
    this.log(`PARTICIPANT_${step.toUpperCase()}`, context, 'journey');
  }

  logPaymentEvent(action: string, context: Record<string, unknown> = {}): void {
    if (!this.isEnabled) return;
    
    this.log(`PAYMENT_${action.toUpperCase()}`, context, 'payment');
  }

  /**
   * Visual debug overlay
   */
  showDebugOverlay(): void {
    if (!this.isEnabled || this.overlayVisible) return;

    this.overlayVisible = true;
    const overlay = document.createElement('div');
    overlay.id = 'researchhub-debug-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 450px;
      height: 100vh;
      background: rgba(0, 0, 0, 0.95);
      color: #00ff00;
      z-index: 9999;
      overflow-y: auto;
      padding: 20px;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      border-left: 2px solid #00ff00;
    `;

    overlay.innerHTML = this.generateOverlayHTML();
    document.body.appendChild(overlay);

    // Auto-refresh every 2 seconds
    const refreshInterval = setInterval(() => {
      const existingOverlay = document.getElementById('researchhub-debug-overlay');
      if (existingOverlay) {
        const content = existingOverlay.querySelector('#debug-content');
        if (content) {
          content.innerHTML = this.generateDebugContent();
        }
      } else {
        clearInterval(refreshInterval);
      }
    }, 2000);
  }

  /**
   * Hide debug overlay
   */
  hideDebugOverlay(): void {
    const overlay = document.getElementById('researchhub-debug-overlay');
    if (overlay) {
      overlay.remove();
      this.overlayVisible = false;
    }
  }

  /**
   * Toggle debug overlay
   */
  toggleDebugOverlay(): void {
    if (this.overlayVisible) {
      this.hideDebugOverlay();
    } else {
      this.showDebugOverlay();
    }
  }

  /**
   * Take debug snapshot
   */
  takeDebugSnapshot(): void {
    if (!this.isEnabled) return;

    const snapshot = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      user: this.getCurrentUser(),
      researchContext: Object.fromEntries(this.researchContext),
      recentLogs: this.debugHistory.slice(-20),
      localStorage: this.getLocalStorageSnapshot(),
      performance: this.getPerformanceSnapshot()
    };

    console.log('🔍 ResearchHub Debug Snapshot:', snapshot);
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2))
      .then(() => console.log('📋 Debug snapshot copied to clipboard'))
      .catch(() => console.log('❌ Failed to copy snapshot to clipboard'));

    this.log('Debug snapshot taken', { snapshotId: snapshot.timestamp }, 'info');
  }

  /**
   * Show performance metrics
   */
  showPerformanceMetrics(): void {
    if (!this.isEnabled) return;

    const metrics = this.getPerformanceSnapshot();
    console.group('⚡ ResearchHub Performance Metrics');
    console.table(metrics);
    console.groupEnd();
    
    this.log('Performance metrics displayed', metrics, 'info');
  }

  /**
   * Show error history
   */
  showErrorHistory(): void {
    if (!this.isEnabled) return;

    const errors = this.debugHistory.filter(entry => entry.level === 'error');
    console.group('🚨 ResearchHub Error History');
    errors.forEach(error => {
      console.error(`[${error.timestamp}] ${error.message}`, error.context);
    });
    console.groupEnd();
    
    this.log('Error history displayed', { errorCount: errors.length }, 'info');
  }

  /**
   * Trigger test error for debugging
   */
  triggerTestError(): void {
    if (!this.isEnabled) return;

    try {
      throw new Error('🧪 Test error from ResearchHub Debug Console');
    } catch (error) {
      this.log('Test error triggered', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }, 'error');
      console.error('🧪 Test Error:', error);
    }
  }

  /**
   * Initialize keyboard shortcuts
   */
  private initializeHotkeys(): void {
    if (!this.isEnabled) return;

    const shortcuts = {
      'ctrl+shift+d': () => this.toggleDebugOverlay(),
      'ctrl+shift+p': () => this.showPerformanceMetrics(),
      'ctrl+shift+e': () => this.showErrorHistory(),
      'ctrl+shift+s': () => this.takeDebugSnapshot(),
      'ctrl+shift+t': () => this.triggerTestError(),
    };

    document.addEventListener('keydown', (event) => {
      const key = `${event.ctrlKey ? 'ctrl+' : ''}${event.shiftKey ? 'shift+' : ''}${event.altKey ? 'alt+' : ''}${event.key?.toLowerCase() || ''}`;
      
      if (shortcuts[key as keyof typeof shortcuts]) {
        event.preventDefault();
        shortcuts[key as keyof typeof shortcuts]();
      }
    });

    // Log available shortcuts
    console.log('🔧 ResearchHub Debug Shortcuts:', Object.keys(shortcuts));
  }

  /**
   * Add debug console to window for global access
   */
  private addToWindow(): void {
    if (!this.isEnabled) return;

    (window as unknown as { ResearchHubDebug: DevDebugConsole }).ResearchHubDebug = this;
    console.log('🔧 ResearchHub Debug Console available at window.ResearchHubDebug');
  }

  /**
   * Generate overlay HTML
   */
  private generateOverlayHTML(): string {
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0; color: #00ff00;">🔧 ResearchHub Debug</h3>
        <button onclick="window.ResearchHubDebug.hideDebugOverlay()" 
                style="background: #ff0000; color: white; border: none; padding: 5px 10px; cursor: pointer;">
          ✕ Close
        </button>
      </div>
      <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap;">
        <button onclick="window.ResearchHubDebug.takeDebugSnapshot()" 
                style="background: #0066ff; color: white; border: none; padding: 5px 10px; cursor: pointer; font-size: 11px;">
          📸 Snapshot
        </button>
        <button onclick="window.ResearchHubDebug.showPerformanceMetrics()" 
                style="background: #ff6600; color: white; border: none; padding: 5px 10px; cursor: pointer; font-size: 11px;">
          ⚡ Performance
        </button>
        <button onclick="window.ResearchHubDebug.showErrorHistory()" 
                style="background: #ff0066; color: white; border: none; padding: 5px 10px; cursor: pointer; font-size: 11px;">
          🚨 Errors
        </button>
        <button onclick="window.ResearchHubDebug.triggerTestError()" 
                style="background: #660066; color: white; border: none; padding: 5px 10px; cursor: pointer; font-size: 11px;">
          🧪 Test Error
        </button>
      </div>
      <div id="debug-content" style="border-top: 1px solid #333; padding-top: 15px;">
        ${this.generateDebugContent()}
      </div>
    `;
  }

  /**
   * Generate debug content
   */
  private generateDebugContent(): string {
    const recentLogs = this.debugHistory.slice(-10);
    
    return `
      <div>
        <div style="color: #ffff00; margin-bottom: 10px;">
          <strong>📊 Current Context</strong><br>
          Route: ${window.location.pathname}<br>
          User: ${this.getCurrentUser()}<br>
          Role: ${this.getCurrentUserRole()}<br>
          Time: ${new Date().toLocaleTimeString()}
        </div>
        
        <div style="color: #00ffff; margin-bottom: 10px;">
          <strong>📋 Recent Logs (${recentLogs.length}/100)</strong>
        </div>
        
        <div style="max-height: 300px; overflow-y: auto;">
          ${recentLogs.map(log => `
            <div style="margin-bottom: 8px; padding: 5px; background: rgba(255,255,255,0.05); border-left: 3px solid ${this.getLevelColor(log.level)};">
              <div style="color: ${this.getLevelColor(log.level)}; font-size: 10px;">
                [${new Date(log.timestamp).toLocaleTimeString()}] ${log.level.toUpperCase()}
              </div>
              <div style="color: white; font-size: 11px; margin: 2px 0;">
                ${log.message}
              </div>
              ${Object.keys(log.context).length > 0 ? `
                <div style="color: #aaa; font-size: 10px;">
                  ${JSON.stringify(log.context, null, 2).slice(0, 100)}${JSON.stringify(log.context).length > 100 ? '...' : ''}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
        
        <div style="margin-top: 15px; color: #888; font-size: 10px;">
          Shortcuts: Ctrl+Shift+D (toggle), Ctrl+Shift+S (snapshot), Ctrl+Shift+P (performance)
        </div>
      </div>
    `;
  }

  /**
   * Get color for log level
   */
  private getLevelColor(level: DebugLogEntry['level']): string {
    const colors = {
      info: '#00ff00',
      warn: '#ffff00',
      error: '#ff0000',
      study: '#0066ff',
      journey: '#ff6600',
      payment: '#66ff00'
    };
    return colors[level] || '#00ff00';
  }

  /**
   * Render to browser console
   */
  private renderToConsole(logEntry: DebugLogEntry): void {
    const style = `color: ${this.getLevelColor(logEntry.level)}; font-weight: bold;`;
    console.log(`%c[ResearchHub ${logEntry.level.toUpperCase()}] ${logEntry.message}`, style, logEntry.context);
  }

  /**
   * Get current component (simplified)
   */
  private getCurrentComponent(): string {
    const path = window.location.pathname;
    if (path.includes('study')) return 'Study';
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('admin')) return 'Admin';
    return 'Unknown';
  }

  /**
   * Get current user
   */
  private getCurrentUser(): string {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.email || user.id || 'Anonymous';
    } catch {
      return 'Anonymous';
    }
  }

  /**
   * Get current user role
   */
  private getCurrentUserRole(): string {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Save debug history to localStorage
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem('researchhub_debug_history', JSON.stringify(this.debugHistory.slice(-50)));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Load debug history from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('researchhub_debug_history');
      if (stored) {
        this.debugHistory = JSON.parse(stored);
      }
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Get localStorage snapshot
   */
  private getLocalStorageSnapshot(): Record<string, unknown> {
    const snapshot: Record<string, unknown> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('researchhub_')) {
          snapshot[key] = localStorage.getItem(key);
        }
      }
    } catch {
      // Ignore errors
    }
    return snapshot;
  }

  /**
   * Get performance snapshot
   */
  private getPerformanceSnapshot(): Record<string, unknown> {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const memory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    
    return {
      pageLoadTime: navigation ? Math.round(navigation.loadEventEnd - navigation.fetchStart) : 0,
      domContentLoaded: navigation ? Math.round(navigation.domContentLoadedEventEnd - navigation.fetchStart) : 0,
      memoryUsed: memory ? Math.round(memory.usedJSHeapSize / 1024 / 1024) : 0,
      memoryTotal: memory ? Math.round(memory.totalJSHeapSize / 1024 / 1024) : 0,
      timestamp: Date.now()
    };
  }
}

// Create singleton instance
const devDebugConsole = new DevDebugConsole();

export default devDebugConsole;
