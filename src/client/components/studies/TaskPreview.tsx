import React from 'react';
import { Clock, Target, AlertTriangle, ExternalLink, MousePointer, Star } from 'lucide-react';
import { type StudyTask } from './DragDropStudyBuilder';
import { Card, CardContent, CardHeader } from '../ui/Card';

interface TaskPreviewProps {
  task: StudyTask;
}

export const TaskPreview: React.FC<TaskPreviewProps> = ({ task }) => {
  const renderTaskTypeSpecificPreview = () => {
    switch (task.type) {
      case 'navigation':
        return (
          <div className="space-y-3">
            {task.configuration && typeof task.configuration === 'object' && 
             'targetUrl' in task.configuration && task.configuration.targetUrl ? (
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-blue-900">Target URL</div>
                  <div className="text-sm text-blue-700">{String(task.configuration.targetUrl) as React.ReactNode}</div>
                </div>
              </div>
            ) : null}
            
            {task.configuration?.clickElement ? (
              <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                <MousePointer className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-sm font-medium text-green-900">Click Target</div>
                  <div className="text-sm text-green-700 font-mono">{String(task.configuration.clickElement) as React.ReactNode}</div>
                </div>
              </div>
            ) : null}

            {task.configuration?.waitForElement ? (
              <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg">
                <Clock className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="text-sm font-medium text-amber-900">Wait for Element</div>
                  <div className="text-sm text-amber-700 font-mono">{String(task.configuration.waitForElement) as React.ReactNode}</div>
                </div>
              </div>
            ) : null}
          </div>
        );

      case 'feedback':
        return (
          <div className="space-y-3">
            {task.configuration?.question ? (
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                <div className="text-sm font-medium text-purple-900 mb-2">Question</div>
                <div className="text-purple-800">{String(task.configuration.question) as React.ReactNode}</div>
              </div>
            ) : null}
            
            {task.configuration?.feedbackType ? (
              <div className="flex items-center space-x-2 p-3 bg-indigo-50 rounded-lg">
                <Star className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="text-sm font-medium text-indigo-900">Response Type</div>
                  <div className="text-sm text-indigo-700 capitalize">{String(task.configuration.feedbackType) as React.ReactNode}</div>
                </div>
              </div>
            ) : null}
          </div>
        );

      case 'prototype':
        return (
          <div className="space-y-3">
            {task.configuration?.prototypeUrl ? (
              <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                <ExternalLink className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="text-sm font-medium text-orange-900">Prototype URL</div>
                  <div className="text-sm text-orange-700">{String(task.configuration.prototypeUrl) as React.ReactNode}</div>
                </div>
              </div>
            ) : null}
            
            {task.configuration?.prototypeType ? (
              <div className="flex items-center space-x-2 p-3 bg-pink-50 rounded-lg">
                <Target className="w-4 h-4 text-pink-600" />
                <div>
                  <div className="text-sm font-medium text-pink-900">Prototype Type</div>
                  <div className="text-sm text-pink-700 capitalize">{String(task.configuration.prototypeType) as React.ReactNode}</div>
                </div>
              </div>
            ) : null}
          </div>
        );

      case 'heatmap':
        return (
          <div className="space-y-3">
            {task.configuration?.targetUrl ? (
              <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg">
                <ExternalLink className="w-4 h-4 text-red-600" />
                <div>
                  <div className="text-sm font-medium text-red-900">Target URL</div>
                  <div className="text-sm text-red-700">{String(task.configuration.targetUrl) as React.ReactNode}</div>
                </div>
              </div>
            ) : null}
            
            <div className="grid grid-cols-2 gap-3">
              {task.configuration?.heatmapDuration ? (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Duration</div>
                  <div className="text-sm text-blue-700">{String(task.configuration.heatmapDuration) as React.ReactNode}s</div>
                </div>
              ) : null}
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-900">Tracking</div>
                <div className="text-xs text-green-700 space-y-1">
                  {(task.configuration?.trackClicks as boolean) && <div>• Clicks</div>}
                  {(task.configuration?.trackMouseMovement as boolean) && <div>• Mouse</div>}
                  {(task.configuration?.trackScrolling as boolean) && <div>• Scrolling</div>}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No specific configuration preview available</p>
          </div>
        );
    }
  };

  return (
    <Card variant="elevated" className="w-full">
      <CardHeader 
        title="Task Preview" 
        subtitle="How this task will appear to participants"
      />
      <CardContent className="space-y-4">
        {/* Basic Task Info */}
        <div className="border-l-4 border-indigo-400 pl-4 py-2 bg-indigo-50">
          <h3 className="font-semibold text-indigo-900">{task.title}</h3>
          <p className="text-sm text-indigo-700 mt-1">{task.description}</p>
        </div>

        {/* Task Metadata */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>~{task.estimatedTime} min</span>
            </div>
            
            {task.timeLimit && (
              <div className="flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Max {task.timeLimit} min</span>
              </div>
            )}
            
            {task.isRequired && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Required
              </span>
            )}
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${task.color} text-white`}>
            {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
          </div>
        </div>

        {/* Task-specific Configuration Preview */}
        {renderTaskTypeSpecificPreview()}

        {/* Success Criteria */}
        {task.successCriteria && task.successCriteria.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-600" />
              Success Criteria
            </h4>
            <div className="space-y-1">
              {task.successCriteria.map((criteria, index) => (
                <div key={index} className="text-sm text-gray-700 bg-green-50 p-2 rounded border-l-2 border-green-400">
                  {typeof criteria === 'string' 
                    ? criteria 
                    : (criteria as { description: string }).description || 'Success criteria'
                  }
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
