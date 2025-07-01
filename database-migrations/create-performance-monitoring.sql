-- Performance Monitoring System Database Migration
-- Creates tables for performance issue tracking and reporting

-- Create performance_issues table
CREATE TABLE IF NOT EXISTS public.performance_issues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('performance', 'error', 'ui_issue', 'bug', 'feature_request')),
    description TEXT NOT NULL,
    url TEXT NOT NULL,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    performance_metrics JSONB,
    screenshot TEXT, -- Base64 encoded screenshot
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create performance_metrics table for historical tracking
CREATE TABLE IF NOT EXISTS public.performance_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    url TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    page_load_time INTEGER, -- milliseconds
    time_to_first_byte INTEGER, -- milliseconds
    first_contentful_paint INTEGER, -- milliseconds
    largest_contentful_paint INTEGER, -- milliseconds
    cumulative_layout_shift DECIMAL(5,4),
    first_input_delay INTEGER, -- milliseconds
    memory_usage BIGINT, -- bytes
    network_requests INTEGER,
    user_agent TEXT,
    viewport_width INTEGER,
    viewport_height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_performance_issues_type ON public.performance_issues(type);
CREATE INDEX IF NOT EXISTS idx_performance_issues_severity ON public.performance_issues(severity);
CREATE INDEX IF NOT EXISTS idx_performance_issues_status ON public.performance_issues(status);
CREATE INDEX IF NOT EXISTS idx_performance_issues_timestamp ON public.performance_issues(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_issues_user_id ON public.performance_issues(user_id);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON public.performance_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON public.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_url ON public.performance_metrics(url);

-- RLS Policies for performance_issues
ALTER TABLE public.performance_issues ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own issues
CREATE POLICY "Users can insert their own performance issues" ON public.performance_issues
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Allow users to view their own issues
CREATE POLICY "Users can view their own performance issues" ON public.performance_issues
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can update issues
CREATE POLICY "Admins can update performance issues" ON public.performance_issues
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Only admins can delete issues
CREATE POLICY "Admins can delete performance issues" ON public.performance_issues
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for performance_metrics
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own metrics
CREATE POLICY "Users can insert their own performance metrics" ON public.performance_metrics
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

-- Allow users to view their own metrics, admins can view all
CREATE POLICY "Users can view their own performance metrics" ON public.performance_metrics
    FOR SELECT USING (
        auth.uid() = user_id OR
        user_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_performance_issues_updated_at 
    BEFORE UPDATE ON public.performance_issues 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create view for performance statistics
CREATE OR REPLACE VIEW public.performance_stats AS
SELECT 
    DATE_TRUNC('day', timestamp) as date,
    type,
    severity,
    status,
    COUNT(*) as count,
    AVG(
        CASE 
            WHEN performance_metrics->>'loadTime' IS NOT NULL 
            THEN (performance_metrics->>'loadTime')::integer 
            ELSE NULL 
        END
    ) as avg_load_time,
    AVG(
        CASE 
            WHEN performance_metrics->>'memoryUsage' IS NOT NULL 
            THEN (performance_metrics->>'memoryUsage')::bigint 
            ELSE NULL 
        END
    ) as avg_memory_usage
FROM public.performance_issues
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp), type, severity, status
ORDER BY date DESC;

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.performance_issues TO authenticated;
GRANT SELECT, INSERT ON public.performance_metrics TO authenticated;
GRANT SELECT ON public.performance_stats TO authenticated;

-- Grant admin permissions
GRANT ALL ON public.performance_issues TO service_role;
GRANT ALL ON public.performance_metrics TO service_role;
GRANT SELECT ON public.performance_stats TO service_role;

-- Create function to clean old performance data (optional maintenance)
CREATE OR REPLACE FUNCTION clean_old_performance_data()
RETURNS void AS $$
BEGIN
    -- Delete performance issues older than 6 months
    DELETE FROM public.performance_issues 
    WHERE timestamp < NOW() - INTERVAL '6 months';
    
    -- Delete performance metrics older than 3 months
    DELETE FROM public.performance_metrics 
    WHERE timestamp < NOW() - INTERVAL '3 months';
END;
$$ LANGUAGE plpgsql;

-- Create comment for documentation
COMMENT ON TABLE public.performance_issues IS 'Tracks user-reported performance issues and bugs';
COMMENT ON TABLE public.performance_metrics IS 'Stores performance metrics for monitoring and analysis';
COMMENT ON VIEW public.performance_stats IS 'Aggregated performance statistics for the last 30 days';
