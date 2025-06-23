// Task format conversion utilities for bridging legacy and new study builder formats
import type { ITask, StudyBuilderTask, TaskUnion } from '../../shared/types/index.js';

/**
 * Convert StudyBuilderTask to API TaskInput format
 */
export function convertStudyBuilderTaskToAPI(builderTask: StudyBuilderTask): {
  title: string;
  description: string;
  type: 'navigation' | 'interaction' | 'feedback' | 'questionnaire' | 'prototype' | 'heatmap';
  order: number;
  settings?: Record<string, unknown>;
} {
  // Map template IDs to API task types
  const templateToAPITypeMap: Record<string, 'navigation' | 'interaction' | 'feedback' | 'questionnaire' | 'prototype' | 'heatmap'> = {
    'website_navigation': 'navigation',
    'prototype_testing': 'prototype',
    'tree_testing': 'navigation',
    'card_sorting': 'interaction',
    'first_click_test': 'navigation',
    'interview_questions': 'questionnaire',
    'conversation_starter': 'questionnaire',
    'background_questions': 'questionnaire',
    'questionnaire': 'questionnaire',
    'likert_scale': 'questionnaire',
    'multiple_choice': 'questionnaire',
    'demographics': 'questionnaire',
    'net_promoter_score': 'questionnaire'
  };

  return {
    title: builderTask.name,
    description: builderTask.description,
    type: templateToAPITypeMap[builderTask.template_id] || 'interaction',
    order: builderTask.order_index,
    settings: builderTask.settings || {}
  };
}

/**
 * Convert StudyBuilderTask to legacy ITask format
 */
export function convertStudyBuilderTaskToLegacy(builderTask: StudyBuilderTask): ITask {
  // Map common template IDs to legacy task types
  const templateToTypeMap: Record<string, ITask['type']> = {
    'website_navigation': 'navigation',
    'prototype_testing': 'prototype-test',
    'tree_testing': 'navigation',
    'card_sorting': 'interaction',
    'first_click_test': 'navigation',
    'interview_questions': 'questionnaire',
    'conversation_starter': 'questionnaire',
    'background_questions': 'questionnaire',
    'questionnaire': 'questionnaire',
    'likert_scale': 'questionnaire',
    'multiple_choice': 'questionnaire',
    'demographics': 'questionnaire',
    'net_promoter_score': 'questionnaire'
  };

  const settings = builderTask.settings || {};

  return {
    _id: builderTask.id,
    studyId: '', // Will be set by the parent study
    title: builderTask.name,
    description: builderTask.description,
    type: templateToTypeMap[builderTask.template_id] || 'interaction',
    order: builderTask.order_index,
    configuration: {
      instructions: builderTask.description,
      heatmapTracking: Boolean(settings.recordHeatmap),
      clickTracking: Boolean(settings.trackClicks),
      scrollTracking: Boolean(settings.trackScrolling),
      questions: Array.isArray(settings.questions) ? settings.questions : [],
      ...settings
    },
    successCriteria: Array.isArray(settings.successCriteria) ? settings.successCriteria : [],
    timeLimit: typeof settings.timeLimit === 'number' ? settings.timeLimit : undefined,
    isRequired: settings.isRequired !== false
  };
}

/**
 * Convert legacy ITask to StudyBuilderTask format
 */
export function convertLegacyTaskToStudyBuilder(legacyTask: ITask): StudyBuilderTask {
  // Map legacy task types to template IDs
  const typeToTemplateMap: Record<ITask['type'], string> = {
    'navigation': 'website_navigation',
    'interaction': 'prototype_testing',
    'questionnaire': 'questionnaire',
    'prototype-test': 'prototype_testing'
  };
  return {
    id: legacyTask._id,
    template_id: typeToTemplateMap[legacyTask.type] || 'prototype_testing',
    name: legacyTask.title,
    description: legacyTask.description,
    estimated_duration: Math.ceil((legacyTask.timeLimit || 300) / 60), // Convert seconds to minutes (optional)
    order_index: legacyTask.order,
    settings: {
      recordHeatmap: legacyTask.configuration.heatmapTracking,
      trackClicks: legacyTask.configuration.clickTracking,
      trackScrolling: legacyTask.configuration.scrollTracking,
      questions: legacyTask.configuration.questions,
      successCriteria: legacyTask.successCriteria,
      timeLimit: legacyTask.timeLimit,
      isRequired: legacyTask.isRequired,
      ...legacyTask.configuration
    },
    category: getTaskCategory(legacyTask.type),
    complexity: 2 // Default complexity
  };
}

/**
 * Get task category based on legacy type
 */
function getTaskCategory(type: ITask['type']): string {
  switch (type) {
    case 'navigation':
      return 'usability';
    case 'interaction':
      return 'usability';
    case 'prototype-test':
      return 'usability';
    case 'questionnaire':
      return 'survey';
    default:
      return 'usability';
  }
}

/**
 * Convert study type from legacy to new format
 */
export function convertStudyType(legacyType: string): 'usability_test' | 'user_interview' | 'survey' {
  switch (legacyType) {
    case 'usability':
    case 'a-b-testing':
    case 'card-sorting':
      return 'usability_test';
    case 'interview':
      return 'user_interview';
    case 'survey':
      return 'survey';
    default:
      return 'usability_test';
  }
}

/**
 * Convert study type from new to legacy format
 */
export function convertStudyTypeToLegacy(newType: 'usability_test' | 'user_interview' | 'survey'): string {
  switch (newType) {
    case 'usability_test':
      return 'usability';
    case 'user_interview':
      return 'interview';
    case 'survey':
      return 'survey';
    default:
      return 'usability';
  }
}

/**
 * Batch convert an array of tasks to API format
 */
export function convertTasksToAPI(builderTasks: StudyBuilderTask[]) {
  return builderTasks.map(convertStudyBuilderTaskToAPI);
}

/**
 * Batch convert an array of tasks to legacy format
 */
export function convertTasksToLegacy(builderTasks: StudyBuilderTask[]): ITask[] {
  return builderTasks.map(convertStudyBuilderTaskToLegacy);
}

/**
 * Batch convert an array of legacy tasks
 */
export function convertTasksToStudyBuilder(legacyTasks: ITask[]): StudyBuilderTask[] {
  return legacyTasks.map(convertLegacyTaskToStudyBuilder);
}

/**
 * Determine if tasks are in StudyBuilder format
 */
export function isStudyBuilderTask(task: TaskUnion): task is StudyBuilderTask {
  return 'template_id' in task && 'order_index' in task;
}

/**
 * Determine if tasks are in legacy format
 */
export function isLegacyTask(task: TaskUnion): task is ITask {
  return '_id' in task && 'studyId' in task && 'configuration' in task;
}
