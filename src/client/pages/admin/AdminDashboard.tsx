import React from 'react';
import { ComprehensiveAdminPanel } from '../../components/admin/ComprehensiveAdminPanel';

/**
 * Admin Dashboard Page - Entry point for all administrative functions
 * Uses the ComprehensiveAdminPanel component with integrated:
 * - User Management with comprehensive API backend
 * - Analytics Dashboard with real-time metrics
 * - System Monitoring and Alerts
 * - Revenue Analytics and Subscription Management
 */
export default function AdminDashboard() {
  return <ComprehensiveAdminPanel />;
}
