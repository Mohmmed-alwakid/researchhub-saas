// User Interaction Tracking System
// Captures mouse movements, clicks, scrolls, and other user interactions
// during screen recording sessions

export class UserInteractionTracker {
  constructor(sessionId, options = {}) {
    this.sessionId = sessionId;
    this.isTracking = false;
    this.interactions = [];
    this.startTime = null;
    
    // Configuration options
    this.options = {
      captureMouseMove: options.captureMouseMove !== false, // true by default
      captureClicks: options.captureClicks !== false,
      captureScrolls: options.captureScrolls !== false,
      captureKeypress: options.captureKeypress || false, // false by default for privacy
      captureFormInputs: options.captureFormInputs || false,
      mouseMoveThrottle: options.mouseMoveThrottle || 100, // ms
      uploadInterval: options.uploadInterval || 5000, // ms
      apiEndpoint: options.apiEndpoint || '/api/interactions',
      ...options
    };
    
    // Bind methods to preserve context
    this.handleMouseMove = this.throttle(this.handleMouseMove.bind(this), this.options.mouseMoveThrottle);
    this.handleClick = this.handleClick.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleKeypress = this.handleKeypress.bind(this);
    this.handleFormInput = this.handleFormInput.bind(this);
    
    console.log(`🎯 UserInteractionTracker initialized for session: ${sessionId}`);
  }
  
  /**
   * Start tracking user interactions
   */
  startTracking() {
    if (this.isTracking) {
      console.warn('⚠️ Tracking already started');
      return;
    }
    
    this.isTracking = true;
    this.startTime = Date.now();
    this.interactions = [];
    
    console.log('🎯 Starting user interaction tracking...');
    
    // Add event listeners
    if (this.options.captureMouseMove) {
      document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    }
    
    if (this.options.captureClicks) {
      document.addEventListener('click', this.handleClick, { passive: true });
      document.addEventListener('contextmenu', this.handleClick, { passive: true });
    }
    
    if (this.options.captureScrolls) {
      document.addEventListener('scroll', this.handleScroll, { passive: true });
      window.addEventListener('scroll', this.handleScroll, { passive: true });
    }
    
    if (this.options.captureKeypress) {
      document.addEventListener('keydown', this.handleKeypress, { passive: true });
    }
    
    if (this.options.captureFormInputs) {
      document.addEventListener('input', this.handleFormInput, { passive: true });
      document.addEventListener('change', this.handleFormInput, { passive: true });
    }
    
    // Start periodic upload
    this.uploadInterval = setInterval(() => {
      this.uploadInteractions();
    }, this.options.uploadInterval);
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.recordInteraction('visibility_change', {
        visible: !document.hidden,
        timestamp: this.getRelativeTimestamp()
      });
    });
    
    console.log('✅ User interaction tracking started');
  }
  
  /**
   * Stop tracking user interactions
   */
  stopTracking() {
    if (!this.isTracking) {
      console.warn('⚠️ Tracking not started');
      return;
    }
    
    console.log('🛑 Stopping user interaction tracking...');
    
    this.isTracking = false;
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('contextmenu', this.handleClick);
    document.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('scroll', this.handleScroll);
    document.removeEventListener('keydown', this.handleKeypress);
    document.removeEventListener('input', this.handleFormInput);
    document.removeEventListener('change', this.handleFormInput);
    
    // Clear upload interval
    if (this.uploadInterval) {
      clearInterval(this.uploadInterval);
    }
    
    // Upload any remaining interactions
    this.uploadInteractions(true);
    
    console.log('✅ User interaction tracking stopped');
  }
  
  /**
   * Handle mouse movement events
   */
  handleMouseMove(event) {
    if (!this.isTracking) return;
    
    this.recordInteraction('mouse_move', {
      x: event.clientX,
      y: event.clientY,
      screenX: event.screenX,
      screenY: event.screenY,
      timestamp: this.getRelativeTimestamp(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }
  
  /**
   * Handle click events
   */
  handleClick(event) {
    if (!this.isTracking) return;
    
    const targetInfo = this.getElementInfo(event.target);
    
    this.recordInteraction('click', {
      x: event.clientX,
      y: event.clientY,
      button: event.button, // 0: left, 1: middle, 2: right
      type: event.type, // 'click' or 'contextmenu'
      timestamp: this.getRelativeTimestamp(),
      target: targetInfo,
      modifiers: {
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        meta: event.metaKey
      }
    });
  }
  
  /**
   * Handle scroll events
   */
  handleScroll(event) {
    if (!this.isTracking) return;
    
    this.recordInteraction('scroll', {
      scrollX: window.scrollX || document.documentElement.scrollLeft,
      scrollY: window.scrollY || document.documentElement.scrollTop,
      timestamp: this.getRelativeTimestamp(),
      target: event.target === document ? 'document' : this.getElementInfo(event.target)
    });
  }
  
  /**
   * Handle keypress events (if enabled)
   */
  handleKeypress(event) {
    if (!this.isTracking) return;
    
    // Only capture non-sensitive keys for privacy
    const allowedKeys = ['Enter', 'Tab', 'Escape', 'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    
    if (allowedKeys.includes(event.key) || event.key.startsWith('F')) {
      this.recordInteraction('keypress', {
        key: event.key,
        code: event.code,
        timestamp: this.getRelativeTimestamp(),
        target: this.getElementInfo(event.target),
        modifiers: {
          ctrl: event.ctrlKey,
          shift: event.shiftKey,
          alt: event.altKey,
          meta: event.metaKey
        }
      });
    }
  }
  
  /**
   * Handle form input events (if enabled)
   */
  handleFormInput(event) {
    if (!this.isTracking) return;
    
    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
      this.recordInteraction('form_input', {
        inputType: target.type,
        tagName: target.tagName,
        timestamp: this.getRelativeTimestamp(),
        target: this.getElementInfo(target),
        // Don't capture actual values for privacy
        valueLength: target.value ? target.value.length : 0,
        hasValue: !!target.value
      });
    }
  }
  
  /**
   * Record an interaction event
   */
  recordInteraction(type, data) {
    const interaction = {
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.sessionId,
      type: type,
      timestamp: data.timestamp || this.getRelativeTimestamp(),
      data: data,
      url: window.location.href,
      userAgent: navigator.userAgent,
      recordedAt: new Date().toISOString()
    };
    
    this.interactions.push(interaction);
    
    // Limit memory usage by keeping only recent interactions
    if (this.interactions.length > 1000) {
      this.interactions = this.interactions.slice(-1000);
    }
  }
  
  /**
   * Get element information for tracking
   */
  getElementInfo(element) {
    if (!element) return null;
    
    return {
      tagName: element.tagName,
      id: element.id || null,
      className: element.className || null,
      textContent: element.textContent ? element.textContent.substring(0, 100) : null,
      href: element.href || null,
      src: element.src || null,
      type: element.type || null,
      name: element.name || null,
      role: element.getAttribute('role') || null,
      ariaLabel: element.getAttribute('aria-label') || null,
      dataTestId: element.getAttribute('data-testid') || null,
      boundingRect: {
        x: element.getBoundingClientRect().x,
        y: element.getBoundingClientRect().y,
        width: element.getBoundingClientRect().width,
        height: element.getBoundingClientRect().height
      }
    };
  }
  
  /**
   * Get timestamp relative to tracking start
   */
  getRelativeTimestamp() {
    return this.startTime ? Date.now() - this.startTime : 0;
  }
  
  /**
   * Throttle function to limit event frequency
   */
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }
  
  /**
   * Upload interactions to server
   */
  async uploadInteractions(isFinal = false) {
    if (this.interactions.length === 0) {
      return;
    }
    
    const interactionsToUpload = [...this.interactions];
    this.interactions = []; // Clear the buffer
    
    try {
      console.log(`📤 Uploading ${interactionsToUpload.length} interactions...`);
      
      const response = await fetch(this.options.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: this.sessionId,
          interactions: interactionsToUpload,
          isFinal: isFinal,
          uploadedAt: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Interactions uploaded successfully');
      
    } catch (error) {
      console.error('❌ Failed to upload interactions:', error);
      // Put interactions back in buffer for retry
      this.interactions.unshift(...interactionsToUpload);
    }
  }
  
  /**
   * Get current tracking statistics
   */
  getStats() {
    return {
      sessionId: this.sessionId,
      isTracking: this.isTracking,
      startTime: this.startTime,
      duration: this.startTime ? Date.now() - this.startTime : 0,
      interactionsCount: this.interactions.length,
      trackingOptions: this.options
    };
  }
  
  /**
   * Export all tracked interactions
   */
  exportInteractions() {
    return {
      sessionId: this.sessionId,
      interactions: [...this.interactions],
      stats: this.getStats()
    };
  }
}

// Export for use in other modules
export default UserInteractionTracker;
