import React from 'react';
import { TemplateManager } from '../../components/templates/TemplateManager';

/**
 * Template Manager Page
 * 
 * Provides a full-page interface for researchers and admins to manage study templates.
 * This page includes template creation, editing, deletion, and analytics.
 * 
 * Features:
 * - Browse and search templates
 * - Create new templates with Template Creation UI
 * - Edit existing templates
 * - Duplicate templates
 * - View template analytics and usage statistics
 * - Role-based access control (researchers and admins only)
 * 
 * Created: July 10, 2025
 * Author: AI Assistant
 */
export const TemplateManagerPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Template Manager Component */}
        <TemplateManager />
      </div>
    </div>
  );
};

export default TemplateManagerPage;
