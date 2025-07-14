/**
 * 🔍 Business Logic Validator for ResearchHub
 * Real-time validation of points system accuracy, role access, and data consistency
 */

interface ValidationRule {
  name: string;
  description: string;
  category: 'points' | 'roles' | 'data' | 'security' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  validator: (data: unknown) => ValidationResult;
}

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  data?: Record<string, unknown>;
}

interface PointsTransaction {
  id: string;
  type: 'earn' | 'spend' | 'transfer' | 'refund';
  amount: number;
  participantId?: string;
  researcherId?: string;
  studyId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface RoleAction {
  userId: string;
  role: 'researcher' | 'participant' | 'admin';
  action: string;
  resource: string;
  timestamp: number;
  allowed: boolean;
}

interface StudyPricing {
  studyId: string;
  blocksCount: number;
  studyType: 'unmoderated' | 'moderated';
  participantReward: number;
  researcherCost: number;
  platformFee: number;
  calculatedAt: number;
}

class BusinessLogicValidator {
  private validationRules: Map<string, ValidationRule> = new Map();
  private validationHistory: Array<{ timestamp: number; rule: string; result: ValidationResult }> = [];
  private pointsRules: Record<string, unknown> = {
    participantEarning: {
      unmoderated: { baseReward: 50, perBlock: 10, maxReward: 200 },
      moderated: { baseReward: 100, perBlock: 20, maxReward: 500 }
    },
    researcherSpending: {
      unmoderated: { baseCost: 80, perBlock: 15, platformFee: 0.15 },
      moderated: { baseCost: 150, perBlock: 30, platformFee: 0.20 }
    },
    limits: {
      maxDailyEarning: 1000,
      maxDailySpending: 5000,
      minTransactionAmount: 1
    }
  };
  
  private rolePermissions: Record<string, string[]> = {
    researcher: [
      'create_study', 'view_results', 'manage_participants', 'download_data',
      'view_analytics', 'manage_templates', 'view_billing', 'cancel_study'
    ],
    participant: [
      'join_study', 'submit_responses', 'view_earnings', 'view_profile',
      'withdraw_earnings', 'update_preferences'
    ],
    admin: [
      'manage_users', 'view_all_analytics', 'moderate_content', 'system_settings',
      'financial_reports', 'user_support', 'platform_configuration'
    ]
  };

  constructor() {
    this.setupValidationRules();
    this.startMonitoring();
  }

  /**
   * Validate points transaction
   */
  validatePointsTransaction(transaction: PointsTransaction): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: []
    };

    // Run all points-related validation rules
    const pointsRules = Array.from(this.validationRules.values())
      .filter(rule => rule.category === 'points');

    for (const rule of pointsRules) {
      const result = rule.validator(transaction);
      
      validation.warnings.push(...result.warnings);
      validation.errors.push(...result.errors);
      validation.suggestions.push(...result.suggestions);
      
      if (!result.isValid) {
        validation.isValid = false;
      }
    }

    // Log validation result
    this.logValidationResult('points_transaction', validation, {
      transactionId: transaction.id,
      type: transaction.type,
      amount: transaction.amount
    });

    return validation;
  }

  /**
   * Validate role-based action
   */
  validateRoleAction(action: RoleAction): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: []
    };

    // Check if role has permission for action
    const allowedActions = this.rolePermissions[action.role] || [];
    
    if (!allowedActions.includes(action.action)) {
      validation.isValid = false;
      validation.errors.push(`Role '${action.role}' does not have permission for action '${action.action}'`);
    }

    // Run role-specific validation rules
    const roleRules = Array.from(this.validationRules.values())
      .filter(rule => rule.category === 'roles');

    for (const rule of roleRules) {
      const result = rule.validator(action);
      
      validation.warnings.push(...result.warnings);
      validation.errors.push(...result.errors);
      validation.suggestions.push(...result.suggestions);
      
      if (!result.isValid) {
        validation.isValid = false;
      }
    }

    this.logValidationResult('role_action', validation, {
      userId: action.userId,
      role: action.role,
      action: action.action,
      resource: action.resource
    });

    return validation;
  }

  /**
   * Validate study pricing calculation
   */
  validateStudyPricing(pricing: StudyPricing): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: []
    };

    // Calculate expected pricing
    const expected = this.calculateExpectedPricing(pricing.studyType, pricing.blocksCount);
    
    // Validate participant reward
    if (Math.abs(pricing.participantReward - expected.participantReward) > 0.01) {
      validation.errors.push(
        `Participant reward mismatch: expected ${expected.participantReward}, got ${pricing.participantReward}`
      );
      validation.isValid = false;
    }

    // Validate researcher cost
    if (Math.abs(pricing.researcherCost - expected.researcherCost) > 0.01) {
      validation.errors.push(
        `Researcher cost mismatch: expected ${expected.researcherCost}, got ${pricing.researcherCost}`
      );
      validation.isValid = false;
    }

    // Validate platform fee
    if (Math.abs(pricing.platformFee - expected.platformFee) > 0.01) {
      validation.errors.push(
        `Platform fee mismatch: expected ${expected.platformFee}, got ${pricing.platformFee}`
      );
      validation.isValid = false;
    }

    // Check for reasonable pricing bounds
    if (pricing.participantReward < 10) {
      validation.warnings.push('Participant reward is very low, may affect participation rates');
    }

    if (pricing.researcherCost > 1000) {
      validation.warnings.push('Researcher cost is very high, consider optimizing study design');
    }

    this.logValidationResult('study_pricing', validation, {
      studyId: pricing.studyId,
      expected,
      actual: {
        participantReward: pricing.participantReward,
        researcherCost: pricing.researcherCost,
        platformFee: pricing.platformFee
      }
    });

    return validation;
  }

  /**
   * Validate data consistency across tables
   */
  validateDataConsistency(data: { 
    studies: unknown[], 
    participants: unknown[], 
    transactions: unknown[] 
  }): ValidationResult {
    const validation: ValidationResult = {
      isValid: true,
      warnings: [],
      errors: [],
      suggestions: []
    };

    // Run data consistency rules
    const dataRules = Array.from(this.validationRules.values())
      .filter(rule => rule.category === 'data');

    for (const rule of dataRules) {
      const result = rule.validator(data);
      
      validation.warnings.push(...result.warnings);
      validation.errors.push(...result.errors);
      validation.suggestions.push(...result.suggestions);
      
      if (!result.isValid) {
        validation.isValid = false;
      }
    }

    this.logValidationResult('data_consistency', validation, {
      studiesCount: Array.isArray(data.studies) ? data.studies.length : 0,
      participantsCount: Array.isArray(data.participants) ? data.participants.length : 0,
      transactionsCount: Array.isArray(data.transactions) ? data.transactions.length : 0
    });

    return validation;
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): Record<string, unknown> {
    const recent = this.validationHistory.slice(-100); // Last 100 validations
    const byCategory = this.groupValidationsByCategory(recent);
    const errorRate = this.calculateErrorRate(recent);
    
    return {
      totalValidations: this.validationHistory.length,
      recentValidations: recent.length,
      errorRate,
      validationsByCategory: byCategory,
      criticalIssues: this.getCriticalIssues(),
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Setup validation rules
   */
  private setupValidationRules(): void {
    // Points system validation rules
    this.addValidationRule({
      name: 'points_amount_positive',
      description: 'Transaction amount must be positive',
      category: 'points',
      severity: 'high',
      validator: (data: unknown) => {
        const transaction = data as PointsTransaction;
        const isValid = transaction.amount > 0;
        
        return {
          isValid,
          warnings: [],
          errors: isValid ? [] : ['Transaction amount must be positive'],
          suggestions: isValid ? [] : ['Ensure all transaction amounts are greater than 0']
        };
      }
    });

    this.addValidationRule({
      name: 'points_daily_limit',
      description: 'Check daily earning/spending limits',
      category: 'points',
      severity: 'medium',
      validator: (data: unknown) => {
        const transaction = data as PointsTransaction;
        const limits = this.pointsRules.limits as Record<string, number>;
        
        const warnings: string[] = [];
        
        if (transaction.type === 'earn' && transaction.amount > limits.maxDailyEarning) {
          warnings.push(`Transaction amount exceeds daily earning limit of ${limits.maxDailyEarning}`);
        }
        
        if (transaction.type === 'spend' && transaction.amount > limits.maxDailySpending) {
          warnings.push(`Transaction amount exceeds daily spending limit of ${limits.maxDailySpending}`);
        }

        return {
          isValid: true,
          warnings,
          errors: [],
          suggestions: warnings.length > 0 ? ['Consider implementing rate limiting'] : []
        };
      }
    });

    // Role validation rules
    this.addValidationRule({
      name: 'role_action_permission',
      description: 'Validate role has permission for action',
      category: 'roles',
      severity: 'critical',
      validator: (data: unknown) => {
        const action = data as RoleAction;
        const allowedActions = this.rolePermissions[action.role] || [];
        const isValid = allowedActions.includes(action.action);
        
        return {
          isValid,
          warnings: [],
          errors: isValid ? [] : [`Unauthorized action: ${action.action} for role ${action.role}`],
          suggestions: isValid ? [] : ['Review role permissions and access controls']
        };
      }
    });

    // Data consistency rules
    this.addValidationRule({
      name: 'study_participant_consistency',
      description: 'Check study-participant relationship consistency',
      category: 'data',
      severity: 'high',
      validator: (data: unknown) => {
        const dataset = data as { studies: unknown[], participants: unknown[], transactions: unknown[] };
        const warnings: string[] = [];
        
        // Check if data structure is valid
        if (!Array.isArray(dataset.studies) || !Array.isArray(dataset.participants)) {
          return {
            isValid: false,
            warnings: [],
            errors: ['Invalid data structure for consistency check'],
            suggestions: ['Ensure studies and participants arrays are provided']
          };
        }
        
        // Basic consistency checks
        if (dataset.studies.length === 0 && dataset.participants.length > 0) {
          warnings.push('Participants exist without any studies');
        }
        
        return {
          isValid: true,
          warnings,
          errors: [],
          suggestions: warnings.length > 0 ? ['Review data integrity'] : []
        };
      }
    });

    // Security validation rules
    this.addValidationRule({
      name: 'admin_action_audit',
      description: 'Audit all admin actions for security',
      category: 'security',
      severity: 'critical',
      validator: (data: unknown) => {
        const action = data as RoleAction;
        const warnings: string[] = [];
        
        if (action.role === 'admin' && !action.allowed) {
          warnings.push('Admin action was denied - investigate potential security issue');
        }
        
        return {
          isValid: true,
          warnings,
          errors: [],
          suggestions: warnings.length > 0 ? ['Review admin access logs'] : []
        };
      }
    });
  }

  /**
   * Add a validation rule
   */
  private addValidationRule(rule: ValidationRule): void {
    this.validationRules.set(rule.name, rule);
  }

  /**
   * Calculate expected pricing based on study type and blocks
   */
  private calculateExpectedPricing(studyType: 'unmoderated' | 'moderated', blocksCount: number): {
    participantReward: number;
    researcherCost: number;
    platformFee: number;
  } {
    const rules = this.pointsRules as Record<string, Record<string, Record<string, number>>>;
    const participantRules = rules.participantEarning[studyType];
    const researcherRules = rules.researcherSpending[studyType];
    
    const participantReward = participantRules.baseReward + (blocksCount * participantRules.perBlock);
    const baseCost = researcherRules.baseCost + (blocksCount * researcherRules.perBlock);
    const platformFee = baseCost * researcherRules.platformFee;
    const researcherCost = baseCost + platformFee;
    
    return {
      participantReward: Math.min(participantReward, participantRules.maxReward),
      researcherCost,
      platformFee
    };
  }

  /**
   * Log validation result
   */
  private logValidationResult(type: string, result: ValidationResult, context: Record<string, unknown>): void {
    this.validationHistory.push({
      timestamp: Date.now(),
      rule: type,
      result
    });

    // Keep only last 1000 entries
    if (this.validationHistory.length > 1000) {
      this.validationHistory = this.validationHistory.slice(-1000);
    }

    // Log to debug console if there are issues
    if (!result.isValid || result.warnings.length > 0) {
      this.logToDebugConsole(`Validation ${result.isValid ? 'warnings' : 'errors'} for ${type}`, {
        ...context,
        warnings: result.warnings,
        errors: result.errors,
        suggestions: result.suggestions
      });
    }
  }

  /**
   * Group validations by category
   */
  private groupValidationsByCategory(validations: Array<{ timestamp: number; rule: string; result: ValidationResult }>): Record<string, unknown> {
    const groups: Record<string, { total: number; errors: number; warnings: number }> = {};
    
    validations.forEach(validation => {
      const rule = this.validationRules.get(validation.rule);
      if (!rule) return;
      
      if (!groups[rule.category]) {
        groups[rule.category] = { total: 0, errors: 0, warnings: 0 };
      }
      
      groups[rule.category].total++;
      
      if (!validation.result.isValid) {
        groups[rule.category].errors++;
      }
      
      if (validation.result.warnings.length > 0) {
        groups[rule.category].warnings++;
      }
    });
    
    return groups;
  }

  /**
   * Calculate overall error rate
   */
  private calculateErrorRate(validations: Array<{ timestamp: number; rule: string; result: ValidationResult }>): number {
    if (validations.length === 0) return 0;
    
    const errors = validations.filter(v => !v.result.isValid).length;
    return errors / validations.length;
  }

  /**
   * Get critical issues that need immediate attention
   */
  private getCriticalIssues(): Array<{ rule: string; timestamp: number; errors: string[] }> {
    return this.validationHistory
      .filter(v => {
        const rule = this.validationRules.get(v.rule);
        return rule?.severity === 'critical' && !v.result.isValid;
      })
      .slice(-10) // Last 10 critical issues
      .map(v => ({
        rule: v.rule,
        timestamp: v.timestamp,
        errors: v.result.errors
      }));
  }

  /**
   * Generate recommendations based on validation patterns
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const recentValidations = this.validationHistory.slice(-100);
    
    const errorRate = this.calculateErrorRate(recentValidations);
    
    if (errorRate > 0.1) {
      recommendations.push('High error rate detected - review validation rules and business logic');
    }
    
    const criticalIssues = this.getCriticalIssues();
    if (criticalIssues.length > 0) {
      recommendations.push('Critical validation issues found - immediate attention required');
    }
    
    const pointsErrors = recentValidations.filter(v => 
      v.rule.includes('points') && !v.result.isValid
    ).length;
    
    if (pointsErrors > 5) {
      recommendations.push('Multiple points system validation failures - review points calculation logic');
    }
    
    return recommendations;
  }

  /**
   * Start monitoring for automatic validation
   */
  private startMonitoring(): void {
    // Monitor for validation patterns every 5 minutes
    setInterval(() => {
      this.analyzeValidationPatterns();
    }, 300000);
  }

  /**
   * Analyze validation patterns for insights
   */
  private analyzeValidationPatterns(): void {
    const stats = this.getValidationStats();
    
    if (typeof stats.errorRate === 'number' && stats.errorRate > 0.05) {
      this.logToDebugConsole('High validation error rate detected', {
        errorRate: stats.errorRate,
        criticalIssues: stats.criticalIssues,
        recommendations: stats.recommendations
      });
    }
  }

  /**
   * Log to debug console
   */
  private logToDebugConsole(message: string, data: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      import('./DevDebugConsole').then(({ default: console }) => {
        console.log(message, data, 'journey');
      });
    }
  }
}

// Create singleton instance
const businessLogicValidator = new BusinessLogicValidator();

export default businessLogicValidator;
