-- Week 4 Day 1: Database Performance Optimization
-- Performance indexes for ResearchHub Enterprise Collaboration features
-- Date: June 29, 2025

-- ============================================================================
-- CRITICAL PERFORMANCE INDEXES FOR ENTERPRISE COLLABORATION
-- ============================================================================

-- 1. Organization Members Performance Indexes
-- Optimize user organization lookups and role-based access queries

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_user_lookup 
ON organization_members(user_id, organization_id, role)
INCLUDE (joined_at, invited_by);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_organization_members_org_role 
ON organization_members(organization_id, role)
INCLUDE (user_id, joined_at);

-- 2. Study Collaborators Performance Indexes  
-- Optimize collaboration permission checks and study access queries

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_collaborators_performance 
ON study_collaborators(study_id, user_id, role) 
INCLUDE (permissions, added_at, added_by);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_study_collaborators_user_studies 
ON study_collaborators(user_id, role)
INCLUDE (study_id, permissions, added_at);

-- 3. Collaboration Activity Timeline Indexes
-- Optimize activity feed queries and audit trail lookups

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaboration_activity_timeline 
ON collaboration_activity(study_id, created_at DESC, activity_type)
INCLUDE (user_id, details);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_collaboration_activity_user 
ON collaboration_activity(user_id, created_at DESC)
INCLUDE (study_id, activity_type, details);

-- 4. Studies Organization Performance Indexes
-- Optimize organization-based study queries

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_studies_organization_lookup 
ON studies(organization_id, status, created_at DESC)
INCLUDE (title, created_by);

-- 5. Teams and Team Members Indexes
-- Optimize team-based collaboration queries

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_members_team_user 
ON team_members(team_id, user_id)
INCLUDE (role, joined_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_teams_organization 
ON teams(organization_id, created_at DESC)
INCLUDE (name, description, created_by);

-- ============================================================================
-- QUERY OPTIMIZATION FUNCTIONS
-- ============================================================================

-- Function to get user's collaborative studies with performance optimization
CREATE OR REPLACE FUNCTION get_user_collaborative_studies(p_user_id UUID)
RETURNS TABLE (
    study_id UUID,
    study_title VARCHAR,
    collaboration_role collaboration_role,
    permissions TEXT[],
    collaborator_count BIGINT,
    last_activity TIMESTAMP WITH TIME ZONE
) 
LANGUAGE SQL STABLE
AS $$
    WITH user_studies AS (
        SELECT 
            sc.study_id,
            sc.role,
            sc.permissions,
            s.title,
            s.created_at
        FROM study_collaborators sc
        JOIN studies s ON sc.study_id = s.id
        WHERE sc.user_id = p_user_id
           OR s.created_by = p_user_id
    ),
    study_stats AS (
        SELECT 
            study_id,
            COUNT(*) as collaborator_count,
            MAX(added_at) as last_activity
        FROM study_collaborators
        WHERE study_id IN (SELECT study_id FROM user_studies)
        GROUP BY study_id
    )
    SELECT 
        us.study_id,
        us.title::VARCHAR,
        us.role,
        us.permissions,
        COALESCE(ss.collaborator_count, 0),
        COALESCE(ss.last_activity, us.created_at)
    FROM user_studies us
    LEFT JOIN study_stats ss ON us.study_id = ss.study_id
    ORDER BY COALESCE(ss.last_activity, us.created_at) DESC;
$$;

-- Function to get organization analytics with performance optimization
CREATE OR REPLACE FUNCTION get_organization_analytics(p_org_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_studies BIGINT,
    active_collaborations BIGINT,
    total_comments BIGINT,
    avg_resolution_time INTERVAL,
    member_activity JSONB
)
LANGUAGE SQL STABLE
AS $$
    WITH date_range AS (
        SELECT NOW() - INTERVAL '1 day' * p_days as start_date
    ),
    org_studies AS (
        SELECT id, title, created_by, created_at
        FROM studies 
        WHERE organization_id = p_org_id
    ),
    collaboration_stats AS (
        SELECT 
            COUNT(DISTINCT sc.study_id) as active_collabs,
            COUNT(DISTINCT ca.id) as total_comments,
            AVG(
                CASE 
                    WHEN ca.activity_type = 'comment_resolved' 
                    THEN EXTRACT(EPOCH FROM (ca.created_at - prev_comment.created_at))
                    ELSE NULL 
                END
            ) as avg_resolution_seconds
        FROM study_collaborators sc
        JOIN org_studies os ON sc.study_id = os.id
        LEFT JOIN collaboration_activity ca ON ca.study_id = sc.study_id
        LEFT JOIN collaboration_activity prev_comment ON 
            prev_comment.study_id = ca.study_id 
            AND prev_comment.activity_type = 'comment_added'
            AND prev_comment.created_at < ca.created_at
        WHERE sc.added_at >= (SELECT start_date FROM date_range)
    ),
    member_stats AS (
        SELECT 
            om.user_id,
            COUNT(DISTINCT ca.id) as activity_count
        FROM organization_members om
        LEFT JOIN collaboration_activity ca ON ca.user_id = om.user_id
        WHERE om.organization_id = p_org_id
          AND ca.created_at >= (SELECT start_date FROM date_range)
        GROUP BY om.user_id
    )
    SELECT 
        (SELECT COUNT(*) FROM org_studies),
        cs.active_collabs,
        cs.total_comments,
        CASE 
            WHEN cs.avg_resolution_seconds IS NOT NULL 
            THEN INTERVAL '1 second' * cs.avg_resolution_seconds
            ELSE NULL 
        END,
        (
            SELECT jsonb_object_agg(user_id::text, activity_count)
            FROM member_stats
            WHERE activity_count > 0
        )
    FROM collaboration_stats cs;
$$;

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS PERFORMANCE
-- ============================================================================

-- Materialized view for team productivity analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS team_productivity_analytics AS
WITH team_stats AS (
    SELECT 
        t.id as team_id,
        t.organization_id,
        t.name as team_name,
        COUNT(DISTINCT tm.user_id) as member_count,
        COUNT(DISTINCT s.id) as studies_created,
        COUNT(DISTINCT sc.study_id) as collaborative_studies,
        COALESCE(AVG(
            EXTRACT(EPOCH FROM (s.updated_at - s.created_at)) / 86400
        ), 0) as avg_study_duration_days
    FROM teams t
    LEFT JOIN team_members tm ON t.id = tm.team_id
    LEFT JOIN studies s ON s.created_by = tm.user_id
    LEFT JOIN study_collaborators sc ON sc.user_id = tm.user_id
    WHERE t.created_at >= NOW() - INTERVAL '90 days'
    GROUP BY t.id, t.organization_id, t.name
)
SELECT 
    team_id,
    organization_id,
    team_name,
    member_count,
    studies_created,
    collaborative_studies,
    CASE 
        WHEN member_count > 0 
        THEN studies_created::FLOAT / member_count 
        ELSE 0 
    END as studies_per_member,
    avg_study_duration_days,
    NOW() as last_updated
FROM team_stats;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_team_productivity_team_id 
ON team_productivity_analytics(team_id);

-- ============================================================================
-- DATABASE CONNECTION OPTIMIZATION
-- ============================================================================

-- Optimize PostgreSQL configuration for collaboration workloads
-- These settings should be applied to postgresql.conf

/*
Performance Optimization Settings for ResearchHub Enterprise:

# Connection and Memory Settings
max_connections = 200
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Query Performance
random_page_cost = 1.1
effective_io_concurrency = 200
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Logging for Performance Monitoring
log_min_duration_statement = 1000  # Log queries taking > 1 second
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Autovacuum Optimization
autovacuum_max_workers = 3
autovacuum_naptime = 20s
*/

-- ============================================================================
-- PERFORMANCE MONITORING QUERIES
-- ============================================================================

-- Query to identify slow-running queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
    query,
    calls,
    total_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent,
    mean_time,
    stddev_time
FROM pg_stat_statements 
WHERE calls > 10
ORDER BY total_time DESC
LIMIT 20;

-- Query to monitor index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    CASE 
        WHEN idx_tup_read > 0 
        THEN (idx_tup_fetch::float / idx_tup_read * 100)::numeric(5,2)
        ELSE 0 
    END as index_efficiency_percent
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_tup_read DESC;

-- Query to monitor table statistics
CREATE OR REPLACE VIEW table_performance_stats AS
SELECT 
    schemaname,
    tablename,
    n_tup_ins + n_tup_upd + n_tup_del as total_writes,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    CASE 
        WHEN seq_scan + idx_scan > 0 
        THEN (idx_scan::float / (seq_scan + idx_scan) * 100)::numeric(5,2)
        ELSE 0 
    END as index_usage_percent
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY total_writes DESC;

-- ============================================================================
-- PERFORMANCE TESTING FUNCTIONS
-- ============================================================================

-- Function to test collaboration query performance
CREATE OR REPLACE FUNCTION test_collaboration_performance()
RETURNS TABLE (
    test_name TEXT,
    execution_time_ms NUMERIC,
    result_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    sample_user_id UUID;
    sample_org_id UUID;
BEGIN
    -- Get sample IDs for testing
    SELECT user_id INTO sample_user_id FROM organization_members LIMIT 1;
    SELECT organization_id INTO sample_org_id FROM organization_members LIMIT 1;
    
    -- Test 1: User collaborative studies query
    start_time := clock_timestamp();
    RETURN QUERY 
        SELECT 
            'get_user_collaborative_studies'::TEXT,
            EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time),
            COUNT(*)
        FROM get_user_collaborative_studies(sample_user_id);
    
    -- Test 2: Organization analytics query
    start_time := clock_timestamp();
    RETURN QUERY
        SELECT 
            'get_organization_analytics'::TEXT,
            EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time),
            1::BIGINT
        FROM get_organization_analytics(sample_org_id);
        
    -- Test 3: Complex collaboration join query
    start_time := clock_timestamp();
    RETURN QUERY
        SELECT 
            'complex_collaboration_join'::TEXT,
            EXTRACT(MILLISECONDS FROM clock_timestamp() - start_time),
            COUNT(*)
        FROM studies s
        JOIN study_collaborators sc ON s.id = sc.study_id
        JOIN organization_members om ON sc.user_id = om.user_id
        LEFT JOIN collaboration_activity ca ON s.id = ca.study_id
        WHERE om.organization_id = sample_org_id
          AND s.created_at >= NOW() - INTERVAL '30 days';
END;
$$;

-- ============================================================================
-- REFRESH MATERIALIZED VIEWS FUNCTION
-- ============================================================================

-- Function to refresh analytics materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY team_productivity_analytics;
    
    -- Log the refresh
    INSERT INTO collaboration_activity (
        id,
        activity_type,
        user_id,
        details,
        created_at
    ) VALUES (
        uuid_generate_v4(),
        'system_analytics_refresh',
        NULL,
        jsonb_build_object('refreshed_at', NOW()),
        NOW()
    );
END;
$$;

-- ============================================================================
-- AUTOMATED MAINTENANCE
-- ============================================================================

-- Create a function to run automated database maintenance
CREATE OR REPLACE FUNCTION run_database_maintenance()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update table statistics
    ANALYZE organization_members;
    ANALYZE study_collaborators;
    ANALYZE collaboration_activity;
    ANALYZE studies;
    ANALYZE teams;
    ANALYZE team_members;
    
    -- Refresh materialized views
    PERFORM refresh_analytics_views();
    
    -- Clean up old activity logs (keep 90 days)
    DELETE FROM collaboration_activity 
    WHERE created_at < NOW() - INTERVAL '90 days'
      AND activity_type NOT IN ('study_created', 'organization_created');
END;
$$;

-- ============================================================================
-- COMPLETION VERIFICATION
-- ============================================================================

-- Verify all indexes were created successfully
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- End of Week 4 Day 1 Database Performance Optimization
