# Small Enhancement Plan: Study Analytics Step

## Enhancement Overview
Add an optional 7th step to the existing StudyCreationWizard for advanced analytics configuration.

## Changes Required

### 1. Add Analytics Step Component
```tsx
// src/client/components/study-builder/steps/AnalyticsStep.tsx
export const AnalyticsStep: React.FC<StepProps> = ({
  formData,
  onUpdateFormData
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Analytics & Tracking
        </h2>
        <p className="text-gray-600">
          Configure advanced analytics for deeper insights
        </p>
      </div>

      {/* Screen Recording Toggle */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={formData.analytics?.screenRecording || false}
            onChange={(e) => onUpdateFormData({
              analytics: {
                ...formData.analytics,
                screenRecording: e.target.checked
              }
            })}
          />
          <div>
            <div className="font-medium text-gray-900">Screen Recording</div>
            <div className="text-sm text-gray-500">
              Record participant screens during the study
            </div>
          </div>
        </label>
      </div>

      {/* Heat Map Tracking */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={formData.analytics?.heatMaps || false}
            onChange={(e) => onUpdateFormData({
              analytics: {
                ...formData.analytics,
                heatMaps: e.target.checked
              }
            })}
          />
          <div>
            <div className="font-medium text-gray-900">Heat Map Tracking</div>
            <div className="text-sm text-gray-500">
              Track click patterns and user attention
            </div>
          </div>
        </label>
      </div>

      {/* Real-time Monitoring */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            checked={formData.analytics?.realTimeMonitoring || false}
            onChange={(e) => onUpdateFormData({
              analytics: {
                ...formData.analytics,
                realTimeMonitoring: e.target.checked
              }
            })}
          />
          <div>
            <div className="font-medium text-gray-900">Real-time Monitoring</div>
            <div className="text-sm text-gray-500">
              Watch sessions live as they happen
            </div>
          </div>
        </label>
      </div>
    </div>
  );
};
```

### 2. Update StudyCreationWizard.tsx
```tsx
// Add analytics step to STEPS array
const STEPS = [
  'type',
  'template', 
  'setup',
  'blocks',
  'review',
  'launch',
  'analytics'  // NEW
] as const;

const STEP_TITLES = {
  type: 'Study Type',
  template: 'Template',
  setup: 'Study Details',
  blocks: 'Build Study',
  review: 'Review',
  launch: 'Launch',
  analytics: 'Analytics'  // NEW
};

// Add analytics case to renderStepContent()
case 'analytics':
  return <AnalyticsStep {...stepProps} />;
```

### 3. Update Types
```tsx
// src/client/components/study-builder/types.ts
export interface StudyFormData {
  // ... existing fields ...
  analytics?: {
    screenRecording?: boolean;
    heatMaps?: boolean;
    realTimeMonitoring?: boolean;
  };
}
```

## Benefits
- ✅ Maintains existing wizard flow and UX
- ✅ Adds professional analytics capabilities
- ✅ Optional step - doesn't disrupt current workflow
- ✅ Minimal code changes (< 100 lines total)
- ✅ Follows existing patterns and conventions
