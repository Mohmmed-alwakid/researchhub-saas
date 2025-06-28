/**
 * Analytics Service for Study Creation Flow
 * Comprehensive tracking and measurement system
 */

import { v4 as uuidv4 } from 'uuid';

// Analytics event types for type safety
export interface StudyCreationAnalyticsEvents {
  'study_creation_started': {
    source: 'dashboard' | 'studies_page' | 'template_gallery';
    user_type: 'new' | 'returning' | 'enterprise';
    device_type: 'mobile' | 'tablet' | 'desktop';
    template_used?: string;
    session_id: string;
    timestamp: number;
    user_agent: string;
    screen_size: string;
    connection_type?: string;
  };
  
  'study_creation_step_completed': {
    session_id: string;
    step_number: number;
    step_name: string;
    time_spent_seconds: number;
    validation_errors?: string[];
    form_completion_percentage: number;
    data_quality_score: number;
    auto_save_triggered: boolean;
  };
  
  'study_creation_abandoned': {
    session_id: string;
    step_number: number;
    time_spent_total_seconds: number;
    abandonment_reason?: 'error' | 'timeout' | 'navigation' | 'unknown';
    form_data_saved: boolean;
    completion_percentage: number;
  };
  
  'study_creation_completed': {
    session_id: string;
    total_time_seconds: number;
    template_used?: string;
    study_type: string;
    participant_count: number;
    blocks_count: number;
    quality_score: number;
    device_type: 'mobile' | 'tablet' | 'desktop';
  };
  
  'template_selected': {
    session_id: string;
    template_id: string;
    template_name: string;
    category: string;
    time_to_select_seconds: number;
    position_in_list: number;
  };
  
  'auto_save_triggered': {
    session_id: string;
    step_number: number;
    data_size_bytes: number;
    success: boolean;
    latency_ms: number;
  };
  
  'mobile_gesture_used': {
    session_id: string;
    gesture_type: 'swipe' | 'pinch' | 'tap' | 'scroll';
    context: string;
    success: boolean;
    step_number: number;
  };
  
  'validation_error_occurred': {
    session_id: string;
    step_number: number;
    field_name: string;
    error_type: string;
    error_message: string;
    user_action: 'ignored' | 'fixed' | 'abandoned';
  };
  
  'help_content_viewed': {
    session_id: string;
    content_type: 'tips' | 'tooltip' | 'examples' | 'documentation';
    content_id: string;
    step_number: number;
    time_spent_seconds: number;
  };
}

// Device detection utility
export const detectDevice = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
};

// User type detection
export const detectUserType = (): 'new' | 'returning' | 'enterprise' => {
  const lastVisit = localStorage.getItem('last_visit');
  const studyCount = parseInt(localStorage.getItem('study_count') || '0');
  
  if (!lastVisit) return 'new';
  if (studyCount >= 10) return 'enterprise';
  return 'returning';
};

// Connection type detection
export const detectConnectionType = (): string | undefined => {
  const connection = (navigator as any).connection;
  return connection?.effectiveType;
};

/**
 * Study Creation Flow Tracker
 * Manages session-based tracking for the entire creation flow
 */
export class StudyCreationFlowTracker {
  private sessionId: string;
  private startTime: number;
  private stepTimes: Record<number, number> = {};
  private formData: any = {};
  private validationErrors: Record<number, string[]> = {};
  private autoSaveCount = 0;
  
  constructor() {
    this.sessionId = uuidv4();
    this.startTime = Date.now();
  }
  
  /**
   * Initialize tracking session
   */
  startSession(source: 'dashboard' | 'studies_page' | 'template_gallery', templateUsed?: string) {
    const event: StudyCreationAnalyticsEvents['study_creation_started'] = {
      source,
      user_type: detectUserType(),
      device_type: detectDevice(),
      template_used: templateUsed,
      session_id: this.sessionId,
      timestamp: this.startTime,
      user_agent: navigator.userAgent,
      screen_size: `${window.innerWidth}x${window.innerHeight}`,
      connection_type: detectConnectionType()
    };
    
    this.trackEvent('study_creation_started', event);
    
    // Store session data for recovery
    this.saveSessionData();
  }
  
  /**
   * Track step completion
   */
  completeStep(stepNumber: number, stepName: string, formData: any) {
    const stepTime = Date.now();
    const timeSpent = this.stepTimes[stepNumber - 1] 
      ? stepTime - this.stepTimes[stepNumber - 1]
      : stepTime - this.startTime;
    
    this.stepTimes[stepNumber] = stepTime;
    this.formData = { ...this.formData, ...formData };
    
    const event: StudyCreationAnalyticsEvents['study_creation_step_completed'] = {
      session_id: this.sessionId,
      step_number: stepNumber,
      step_name: stepName,
      time_spent_seconds: Math.round(timeSpent / 1000),
      validation_errors: this.validationErrors[stepNumber],
      form_completion_percentage: this.calculateCompletionPercentage(formData, stepNumber),
      data_quality_score: this.calculateQualityScore(formData, stepNumber),
      auto_save_triggered: this.autoSaveCount > 0
    };
    
    this.trackEvent('study_creation_step_completed', event);
    this.saveSessionData();
  }
  
  /**
   * Track abandonment
   */
  trackAbandonment(stepNumber: number, reason?: 'error' | 'timeout' | 'navigation' | 'unknown') {
    const totalTime = Date.now() - this.startTime;
    
    const event: StudyCreationAnalyticsEvents['study_creation_abandoned'] = {
      session_id: this.sessionId,
      step_number: stepNumber,
      time_spent_total_seconds: Math.round(totalTime / 1000),
      abandonment_reason: reason,
      form_data_saved: this.autoSaveCount > 0,
      completion_percentage: this.calculateOverallCompletion()
    };
    
    this.trackEvent('study_creation_abandoned', event);
    this.clearSessionData();
  }
  
  /**
   * Track successful completion
   */
  trackCompletion(studyData: any) {
    const totalTime = Date.now() - this.startTime;
    
    const event: StudyCreationAnalyticsEvents['study_creation_completed'] = {
      session_id: this.sessionId,
      total_time_seconds: Math.round(totalTime / 1000),
      template_used: studyData.templateUsed,
      study_type: studyData.studyType || studyData.type,
      participant_count: studyData.recruitmentSettings?.maxParticipants || 0,
      blocks_count: studyData.studyBlocks?.length || 0,
      quality_score: this.calculateFinalQualityScore(studyData),
      device_type: detectDevice()
    };
    
    this.trackEvent('study_creation_completed', event);
    this.clearSessionData();
    
    // Update user statistics
    this.updateUserStats();
  }
  
  /**
   * Track template selection
   */
  trackTemplateSelection(templateId: string, templateName: string, category: string, position: number, selectionTime: number) {
    const event: StudyCreationAnalyticsEvents['template_selected'] = {
      session_id: this.sessionId,
      template_id: templateId,
      template_name: templateName,
      category,
      time_to_select_seconds: Math.round(selectionTime / 1000),
      position_in_list: position
    };
    
    this.trackEvent('template_selected', event);
  }
  
  /**
   * Track auto-save events
   */
  trackAutoSave(stepNumber: number, dataSize: number, success: boolean, latency: number) {
    this.autoSaveCount++;
    
    const event: StudyCreationAnalyticsEvents['auto_save_triggered'] = {
      session_id: this.sessionId,
      step_number: stepNumber,
      data_size_bytes: dataSize,
      success,
      latency_ms: latency
    };
    
    this.trackEvent('auto_save_triggered', event);
  }
  
  /**
   * Track mobile gestures
   */
  trackMobileGesture(gestureType: 'swipe' | 'pinch' | 'tap' | 'scroll', context: string, success: boolean, stepNumber: number) {
    const event: StudyCreationAnalyticsEvents['mobile_gesture_used'] = {
      session_id: this.sessionId,
      gesture_type: gestureType,
      context,
      success,
      step_number: stepNumber
    };
    
    this.trackEvent('mobile_gesture_used', event);
  }
  
  /**
   * Track validation errors
   */
  trackValidationError(stepNumber: number, fieldName: string, errorType: string, errorMessage: string, userAction: 'ignored' | 'fixed' | 'abandoned') {
    if (!this.validationErrors[stepNumber]) {
      this.validationErrors[stepNumber] = [];
    }
    this.validationErrors[stepNumber].push(`${fieldName}: ${errorType}`);
    
    const event: StudyCreationAnalyticsEvents['validation_error_occurred'] = {
      session_id: this.sessionId,
      step_number: stepNumber,
      field_name: fieldName,
      error_type: errorType,
      error_message: errorMessage,
      user_action: userAction
    };
    
    this.trackEvent('validation_error_occurred', event);
  }
  
  /**
   * Track help content usage
   */
  trackHelpContentView(contentType: 'tips' | 'tooltip' | 'examples' | 'documentation', contentId: string, stepNumber: number, timeSpent: number) {
    const event: StudyCreationAnalyticsEvents['help_content_viewed'] = {
      session_id: this.sessionId,
      content_type: contentType,
      content_id: contentId,
      step_number: stepNumber,
      time_spent_seconds: Math.round(timeSpent / 1000)
    };
    
    this.trackEvent('help_content_viewed', event);
  }
  
  /**
   * Calculate form completion percentage for a specific step
   */
  private calculateCompletionPercentage(formData: any, stepNumber: number): number {
    const requiredFields = this.getRequiredFieldsForStep(stepNumber);
    const completedFields = this.getCompletedFields(formData, requiredFields);
    return Math.round((completedFields / requiredFields.length) * 100);
  }
  
  /**
   * Calculate data quality score for a specific step
   */
  private calculateQualityScore(formData: any, stepNumber: number): number {
    let score = 0;
    const maxScore = 10;
    
    switch (stepNumber) {
      case 1: // Overview
        if (formData.title?.length >= 10) score += 3;
        if (formData.title?.length >= 20) score += 2;
        if (formData.description?.length >= 50) score += 2;
        if (formData.estimatedDuration >= 5 && formData.estimatedDuration <= 60) score += 2;
        if (formData.deviceRequirements?.length > 0) score += 1;
        break;
        
      case 2: // Session (if applicable)
        if (formData.schedulingDetails?.availableDates?.length > 0) score += 3;
        if (formData.schedulingDetails?.availableTimes?.length > 0) score += 3;
        if (formData.schedulingDetails?.participantInstructions?.length > 0) score += 2;
        if (formData.schedulingDetails?.maxParticipants > 0) score += 2;
        break;
        
      case 3: // Participants
        if (formData.targetAudience?.countries?.length > 0) score += 3;
        if (formData.targetAudience?.professions?.length > 0) score += 2;
        if (formData.recruitmentSettings?.maxParticipants > 0) score += 2;
        if (formData.recruitmentSettings?.maxParticipants >= 5 && formData.recruitmentSettings?.maxParticipants <= 15) score += 2;
        if (formData.screeningQuestions?.length > 0) score += 1;
        break;
        
      case 4: // Tasks
        if (formData.studyBlocks?.length > 0) score += 4;
        if (formData.studyBlocks?.length >= 3) score += 2;
        if (formData.studyBlocks?.some((block: any) => block.estimatedTime > 0)) score += 2;
        if (formData.studyBlocks?.every((block: any) => block.title && block.description)) score += 2;
        break;
    }
    
    return Math.min(score, maxScore);
  }
  
  /**
   * Calculate overall completion percentage
   */
  private calculateOverallCompletion(): number {
    const totalSteps = 4;
    const completedSteps = Object.keys(this.stepTimes).length;
    return Math.round((completedSteps / totalSteps) * 100);
  }
  
  /**
   * Calculate final quality score for completed study
   */
  private calculateFinalQualityScore(studyData: any): number {
    let score = 0;
    
    // Title and description quality
    if (studyData.title?.length >= 20) score += 1;
    if (studyData.description?.length >= 100) score += 1;
    
    // Study configuration quality
    if (studyData.estimatedDuration >= 15 && studyData.estimatedDuration <= 45) score += 1;
    if (studyData.targetAudience?.countries?.length > 0) score += 1;
    if (studyData.recruitmentSettings?.maxParticipants >= 5) score += 1;
    
    // Study blocks quality
    if (studyData.studyBlocks?.length >= 3) score += 1;
    if (studyData.studyBlocks?.length <= 8) score += 1; // Not too many blocks
    
    // Template usage (indicates thoughtful planning)
    if (studyData.templateUsed) score += 1;
    
    // Screening questions (indicates quality control)
    if (studyData.screeningQuestions?.length > 0) score += 1;
    
    // Realistic participant expectations
    if (studyData.recruitmentSettings?.maxParticipants <= 20) score += 1;
    
    return Math.min(score, 10);
  }
  
  /**
   * Get required fields for a specific step
   */
  private getRequiredFieldsForStep(stepNumber: number): string[] {
    const fieldsByStep: Record<number, string[]> = {
      1: ['title', 'studyType', 'estimatedDuration'],
      2: ['schedulingDetails.availableDates', 'schedulingDetails.availableTimes'],
      3: ['targetAudience.countries', 'recruitmentSettings.maxParticipants'],
      4: ['studyBlocks']
    };
    
    return fieldsByStep[stepNumber] || [];
  }
  
  /**
   * Count completed fields in form data
   */
  private getCompletedFields(formData: any, requiredFields: string[]): number {
    return requiredFields.filter(field => {
      const value = this.getNestedValue(formData, field);
      return value !== undefined && value !== null && value !== '' && 
             (Array.isArray(value) ? value.length > 0 : true);
    }).length;
  }
  
  /**
   * Get nested object value by dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  /**
   * Save session data for recovery
   */
  private saveSessionData() {
    const sessionData = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      stepTimes: this.stepTimes,
      formData: this.formData,
      autoSaveCount: this.autoSaveCount
    };
    
    localStorage.setItem('study_creation_session', JSON.stringify(sessionData));
  }
  
  /**
   * Clear session data
   */
  private clearSessionData() {
    localStorage.removeItem('study_creation_session');
  }
  
  /**
   * Update user statistics
   */
  private updateUserStats() {
    const currentCount = parseInt(localStorage.getItem('study_count') || '0');
    localStorage.setItem('study_count', (currentCount + 1).toString());
    localStorage.setItem('last_study_creation', Date.now().toString());
  }
  
  /**
   * Generic event tracking method
   */
  private trackEvent<T extends keyof StudyCreationAnalyticsEvents>(
    eventName: T, 
    eventData: StudyCreationAnalyticsEvents[T]
  ) {
    // In a real implementation, this would send to your analytics service
    console.log(`Analytics Event: ${eventName}`, eventData);
    
    // Example integrations:
    // Google Analytics 4
    if ((window as any).gtag) {
      (window as any).gtag('event', eventName, eventData);
    }
    
    // Mixpanel
    if ((window as any).mixpanel) {
      (window as any).mixpanel.track(eventName, eventData);
    }
    
    // Custom analytics endpoint
    this.sendToAnalyticsAPI(eventName, eventData);
  }
  
  /**
   * Send to custom analytics API
   */
  private async sendToAnalyticsAPI(eventName: string, eventData: any) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: eventName,
          data: eventData,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }
  
  /**
   * Recover session from storage
   */
  static recoverSession(): StudyCreationFlowTracker | null {
    try {
      const sessionData = localStorage.getItem('study_creation_session');
      if (!sessionData) return null;
      
      const data = JSON.parse(sessionData);
      const tracker = new StudyCreationFlowTracker();
      
      tracker.sessionId = data.sessionId;
      tracker.startTime = data.startTime;
      tracker.stepTimes = data.stepTimes;
      tracker.formData = data.formData;
      tracker.autoSaveCount = data.autoSaveCount;
      
      return tracker;
    } catch (error) {
      console.error('Failed to recover session:', error);
      return null;
    }
  }
}

/**
 * Performance monitoring for study creation flow
 */
export class StudyCreationPerformanceMonitor {
  private static instance: StudyCreationPerformanceMonitor;
  private metrics: Record<string, number> = {};
  
  static getInstance(): StudyCreationPerformanceMonitor {
    if (!this.instance) {
      this.instance = new StudyCreationPerformanceMonitor();
    }
    return this.instance;
  }
  
  /**
   * Track form render time
   */
  trackFormRender(stepNumber: number) {
    const startTime = performance.now();
    
    // Use requestAnimationFrame to measure when render is complete
    requestAnimationFrame(() => {
      const renderTime = performance.now() - startTime;
      this.metrics[`form_render_step_${stepNumber}`] = renderTime;
      
      // Send to analytics if render time is concerning
      if (renderTime > 100) {
        console.warn(`Slow form render for step ${stepNumber}: ${renderTime}ms`);
      }
    });
  }
  
  /**
   * Track step transition performance
   */
  trackStepTransition(fromStep: number, toStep: number) {
    const startTime = performance.now();
    
    requestAnimationFrame(() => {
      const transitionTime = performance.now() - startTime;
      this.metrics[`step_transition_${fromStep}_to_${toStep}`] = transitionTime;
    });
  }
  
  /**
   * Track validation response time
   */
  trackValidationTime(stepNumber: number, validationTime: number) {
    this.metrics[`validation_time_step_${stepNumber}`] = validationTime;
  }
  
  /**
   * Track auto-save performance
   */
  trackAutoSavePerformance(dataSize: number, saveTime: number) {
    this.metrics['auto_save_latency'] = saveTime;
    this.metrics['auto_save_data_size'] = dataSize;
  }
  
  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      connection: (navigator as any).connection?.effectiveType
    };
  }
}

// Export convenience instance
export const studyCreationTracker = new StudyCreationFlowTracker();
export const performanceMonitor = StudyCreationPerformanceMonitor.getInstance();
