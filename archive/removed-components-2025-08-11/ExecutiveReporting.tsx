import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Send,
  TrendingUp,
  Clock,
  Mail,
  Filter
} from 'lucide-react';

interface ExecutiveReport {
  id: string;
  title: string;
  type: 'monthly' | 'quarterly' | 'annual' | 'custom';
  period: string;
  status: 'draft' | 'ready' | 'sent';
  createdAt: string;
  lastModified: string;
  recipients: string[];
}

interface ExecutiveSummary {
  period: string;
  highlights: {
    title: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    icon: string;
  }[];
  kpis: {
    metric: string;
    current: number;
    target: number;
    progress: number;
    status: 'on-track' | 'at-risk' | 'behind';
  }[];
  insights: string[];
  recommendations: string[];
}

interface ExecutiveReportingData {
  summary: ExecutiveSummary;
  reports: ExecutiveReport[];
  templates: {
    id: string;
    name: string;
    description: string;
    frequency: string;
  }[];
  recipients: {
    id: string;
    name: string;
    email: string;
    role: string;
    active: boolean;
  }[];
}

export const ExecutiveReporting: React.FC = () => {
  const [data, setData] = useState<ExecutiveReportingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<'monthly' | 'quarterly' | 'annual' | 'custom'>('monthly');

  const fetchReportingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics/reporting?period=${selectedPeriod}`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch executive reporting data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchReportingData();
  }, [fetchReportingData]);

  const handleGenerateReport = (templateId: string) => {
    console.log('Generating report from template:', templateId);
    // Implementation for generating new report
  };

  const handleSendReport = (reportId: string) => {
    console.log('Sending report:', reportId);
    // Implementation for sending report
  };

  const handleDownloadReport = (reportId: string) => {
    console.log('Downloading report:', reportId);
    // Implementation for downloading report
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600 bg-green-100';
      case 'at-risk': return 'text-yellow-600 bg-yellow-100';
      case 'behind': return 'text-red-600 bg-red-100';
      case 'ready': return 'text-blue-600 bg-blue-100';
      case 'sent': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      case 'stable': return <div className="w-4 h-0.5 bg-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load executive reporting data</p>
        <button 
          onClick={fetchReportingData}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Executive Reporting</h2>
          <p className="text-gray-600 mt-1">Generate and manage executive reports</p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current">Current Period</option>
            <option value="last">Last Period</option>
            <option value="ytd">Year to Date</option>
          </select>
          
          <button
            onClick={() => setShowCreateReport(!showCreateReport)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
          >
            <FileText className="w-4 h-4" />
            <span>Create Report</span>
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Executive Summary - {data.summary.period}
        </h3>
        
        {/* Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {data.summary.highlights.map((highlight, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{highlight.title}</p>
                  <p className="text-xl font-bold text-gray-900">{highlight.value}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(highlight.trend)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* KPIs */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Key Performance Indicators</h4>
          <div className="space-y-3">
            {data.summary.kpis.map((kpi, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{kpi.metric}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(kpi.status)}`}>
                    {kpi.status.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Current: {kpi.current}</span>
                  <span>Target: {kpi.target}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      kpi.status === 'on-track' ? 'bg-green-600' :
                      kpi.status === 'at-risk' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {kpi.progress.toFixed(1)}% of target achieved
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Key Insights</h4>
            <ul className="space-y-2">
              {data.summary.insights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {data.summary.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Create Report Modal */}
      {showCreateReport && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Report</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={selectedReportType}
                onChange={(e) => setSelectedReportType(e.target.value as 'monthly' | 'quarterly' | 'annual' | 'custom')}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Monthly Report</option>
                <option value="quarterly">Quarterly Report</option>
                <option value="annual">Annual Report</option>
                <option value="custom">Custom Report</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {data.templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
            <button
              onClick={() => setShowCreateReport(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleGenerateReport('template-1');
                setShowCreateReport(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Generate Report
            </button>
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select className="border border-gray-300 rounded px-2 py-1 text-sm">
              <option value="all">All Reports</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-3">
          {data.reports.map((report) => (
            <div key={report.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">{report.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {report.type.charAt(0).toUpperCase() + report.type.slice(1)} • {report.period}
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Created: {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Modified: {new Date(report.lastModified).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {report.recipients.length} recipients
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDownloadReport(report.id)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {report.status === 'ready' && (
                    <button
                      onClick={() => handleSendReport(report.id)}
                      className="p-2 text-blue-600 hover:text-blue-800"
                      title="Send Report"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.templates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900">{template.name}</h4>
              <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">{template.frequency}</span>
                <button
                  onClick={() => handleGenerateReport(template.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
