import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiResponseHelper, ApiResponse } from '../../shared/api/ApiResponse.js';


/**
 * PHASE 1: BASE SERVICE LAYER
 * Implements service layer architecture for business logic separation
 * Requirements Source: docs/requirements/01-PLATFORM_FOUNDATION.md
 */

// Supabase configuration
const supabaseUrl = 'https://wxpwxzdgdvinlbtnbgdf.supabase.co';
const supabaseServiceKey = 'process.env.SUPABASE_SERVICE_ROLE_KEY || 'your_supabase_service_role_key_here'';

// Base service interface
export interface ServiceContext {
  userId?: string;
  organizationId?: string;
  userRole?: string;
  ipAddress?: string;
  userAgent?: string;
}

// Audit log entry interface
export interface AuditLogEntry {
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
}

/**
 * Base service class providing common functionality
 */
export abstract class BaseService {
  protected supabase: SupabaseClient;
  protected context?: ServiceContext;

  constructor(context?: ServiceContext) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey);
    this.context = context;
  }

  /**
   * Execute operation within a transaction
   */
  protected async withTransaction<T>(
    operation: (client: SupabaseClient) => Promise<T>
  ): Promise<T> {
    // Note: Supabase doesn't support explicit transactions in the JS client
    // This is a placeholder for transaction wrapper when needed
    return await operation(this.supabase);
  }

  /**
   * Log audit entry for compliance
   */
  protected async auditLog(entry: AuditLogEntry): Promise<void> {
    try {
      await this.supabase.from('audit_logs').insert({
        user_id: this.context?.userId,
        organization_id: this.context?.organizationId,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        details: entry.details || {},
        ip_address: this.context?.ipAddress,
        user_agent: this.context?.userAgent,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Audit logging failed:', error);
      // Don't throw - audit failures shouldn't break business logic
    }
  }

  /**
   * Check if user has permission for action
   */
  protected async checkPermission(
    action: string, 
    _resourceType: string, 
    _resourceId?: string
  ): Promise<boolean> {
    if (!this.context?.userId) {
      return false;
    }

    // Admin users have all permissions
    if (this.context.userRole === 'admin') {
      return true;
    }

    // Add specific permission logic here based on requirements
    // For now, basic role-based checks
    switch (action) {
      case 'read':
        return true; // Most users can read
      case 'create':
      case 'update':
        return this.context.userRole === 'researcher' || this.context.userRole === 'admin';
      case 'delete':
        return this.context.userRole === 'admin';
      default:
        return false;
    }
  }

  /**
   * Handle standard service errors
   */
  protected handleError(error: unknown, context: string): ApiResponse {
    console.error(`Service error in ${context}:`, error);

    if (error instanceof Error) {
      // Database constraint errors
      if (error.message.includes('duplicate key')) {
        return ApiResponseHelper.error(
          'DUPLICATE_ERROR',
          'A record with this information already exists'
        );
      }

      // Foreign key constraint errors
      if (error.message.includes('violates foreign key')) {
        return ApiResponseHelper.error(
          'REFERENCE_ERROR',
          'Referenced record does not exist'
        );
      }

      // Permission errors
      if (error.message.includes('permission denied') || error.message.includes('RLS')) {
        return ApiResponseHelper.forbiddenError();
      }

      // Generic error
      return ApiResponseHelper.serverError(
        process.env.NODE_ENV === 'development' ? error.message : 'Service error occurred'
      );
    }

    return ApiResponseHelper.serverError();
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: Record<string, unknown>, requiredFields: string[]): string[] {
    const missing: string[] = [];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && !data[field].toString().trim())) {
        missing.push(field);
      }
    }
    
    return missing;
  }

  /**
   * Get system setting value
   */
  protected async getSystemSetting(key: string): Promise<unknown> {
    try {
      const { data } = await this.supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .single();
      
      return data?.value;
    } catch (error) {
      console.error(`Failed to get system setting ${key}:`, error);
      return null;
    }
  }

  /**
   * Set system setting value (admin only)
   */
  protected async setSystemSetting(key: string, value: unknown): Promise<boolean> {
    if (this.context?.userRole !== 'admin') {
      return false;
    }

    try {
      await this.supabase
        .from('system_settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString()
        });
      
      await this.auditLog({
        action: 'UPDATE_SYSTEM_SETTING',
        resource_type: 'SYSTEM_SETTINGS',
        resource_id: key,
        details: { key, value }
      });

      return true;
    } catch (error) {
      console.error(`Failed to set system setting ${key}:`, error);
      return false;
    }
  }
}

/**
 * User Service - Enhanced user management
 */
export class UserService extends BaseService {
  /**
   * Get user with profile information
   */
  async getUserWithProfile(userId: string): Promise<ApiResponse> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select(`
          *,
          user_profiles (*)
        `)
        .eq('id', userId)
        .single();

      if (error) {
        return this.handleError(error, 'getUserWithProfile');
      }

      if (!user) {
        return ApiResponseHelper.notFoundError('User');
      }

      // Remove sensitive fields (destructure for security)
      const { 
        password_changed_at: _, 
        login_attempts: __, 
        locked_until: ___, 
        two_factor_secret: ____, 
        backup_codes: _____, 
        ...safeUser 
      } = user;

      return ApiResponseHelper.success(safeUser);
    } catch (error) {
      return this.handleError(error, 'getUserWithProfile');
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profileData: Record<string, unknown>): Promise<ApiResponse> {
    try {
      // Check permission
      if (!await this.checkPermission('update', 'user_profile', userId)) {
        return ApiResponseHelper.forbiddenError();
      }

      // Validate required fields
      const missingFields = this.validateRequired(profileData, ['first_name']);
      if (missingFields.length > 0) {
        return ApiResponseHelper.validationError({ missingFields });
      }

      // Update or create profile
      const { data, error } = await this.supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return this.handleError(error, 'updateProfile');
      }

      // Mark user profile as completed
      await this.supabase
        .from('users')
        .update({ profile_completed: true })
        .eq('id', userId);

      await this.auditLog({
        action: 'UPDATE_PROFILE',
        resource_type: 'USER_PROFILE',
        resource_id: userId,
        details: { updatedFields: Object.keys(profileData) }
      });

      return ApiResponseHelper.success(data);
    } catch (error) {
      return this.handleError(error, 'updateProfile');
    }
  }

  /**
   * Update user last activity
   */
  async updateLastActivity(userId: string): Promise<void> {
    try {
      await this.supabase
        .from('users')
        .update({ last_active: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Failed to update last activity:', error);
      // Don't throw - this is a background operation
    }
  }
}

/**
 * Organization Service - Organization and team management
 */
export class OrganizationService extends BaseService {
  /**
   * Create new organization
   */
  async createOrganization(orgData: {
    name: string;
    slug: string;
    type?: 'individual' | 'team' | 'enterprise';
    description?: string;
  }): Promise<ApiResponse> {
    try {
      if (!this.context?.userId) {
        return ApiResponseHelper.authError();
      }

      // Validate required fields
      const missingFields = this.validateRequired(orgData, ['name', 'slug']);
      if (missingFields.length > 0) {
        return ApiResponseHelper.validationError({ missingFields });
      }

      // Create organization
      const { data: organization, error: orgError } = await this.supabase
        .from('organizations')
        .insert({
          ...orgData,
          type: orgData.type || 'individual',
          created_by: this.context.userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orgError) {
        return this.handleError(orgError, 'createOrganization');
      }

      // Add creator as owner
      await this.supabase
        .from('organization_memberships')
        .insert({
          organization_id: organization.id,
          user_id: this.context.userId,
          role: 'owner',
          joined_at: new Date().toISOString()
        });

      await this.auditLog({
        action: 'CREATE_ORGANIZATION',
        resource_type: 'ORGANIZATION',
        resource_id: organization.id,
        details: { name: orgData.name, type: orgData.type }
      });

      return ApiResponseHelper.success(organization);
    } catch (error) {
      return this.handleError(error, 'createOrganization');
    }
  }

  /**
   * Get user's organizations
   */
  async getUserOrganizations(userId: string): Promise<ApiResponse> {
    try {
      const { data, error } = await this.supabase
        .from('organization_memberships')
        .select(`
          role,
          joined_at,
          organizations (
            id,
            name,
            slug,
            type,
            description,
            created_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) {
        return this.handleError(error, 'getUserOrganizations');
      }

      return ApiResponseHelper.success(data || []);
    } catch (error) {
      return this.handleError(error, 'getUserOrganizations');
    }
  }
}

/**
 * System Service - System management and configuration
 */
export class SystemService extends BaseService {
  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<ApiResponse> {
    try {
      const health = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        version: await this.getSystemSetting('app_version') || '1.0.0',
        maintenance_mode: await this.getSystemSetting('maintenance_mode') || false,
        database: await this.checkDatabaseHealth(),
        features: {
          collaboration: await this.getSystemSetting('enable_collaboration') || true,
          templates: await this.getSystemSetting('enable_templates') || true,
          analytics: await this.getSystemSetting('enable_analytics') || true
        }
      };

      return ApiResponseHelper.success(health);
    } catch (error) {
      return this.handleError(error, 'getSystemHealth');
    }
  }

  /**
   * Check database connectivity and basic functionality
   */
  private async checkDatabaseHealth(): Promise<{ status: string; latency: number }> {
    const startTime = Date.now();
    
    try {
      await this.supabase.from('system_settings').select('id').limit(1);
      const latency = Date.now() - startTime;
      
      return {
        status: 'healthy',
        latency
      };
    } catch (_error) {
      return {
        status: 'unhealthy',
        latency: Date.now() - startTime
      };
    }
  }
}

// Export service instances
export function createUserService(context?: ServiceContext): UserService {
  return new UserService(context);
}

export function createOrganizationService(context?: ServiceContext): OrganizationService {
  return new OrganizationService(context);
}

export function createSystemService(context?: ServiceContext): SystemService {
  return new SystemService(context);
}

export default {
  BaseService,
  UserService,
  OrganizationService,
  SystemService,
  createUserService,
  createOrganizationService,
  createSystemService
};
