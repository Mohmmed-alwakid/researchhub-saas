// Task format conversion utilities for bridging legacy and new study builder formats
import type { ITask, StudyBuilderBlock, BlockType } from '../../shared/types/index.js';

// Type aliases for compatibility
type StudyBuilderTask = StudyBuilderBlock;
type TaskUnion = ITask | StudyBuilderTask;

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
  // Map block types to API task types
  const blockTypeToAPITypeMap: Record<BlockType, 'navigation' | 'interaction' | 'feedback' | 'questionnaire' | 'prototype' | 'heatmap'> = {
    'welcome': 'interaction',
    'open_question': 'questionnaire',
    'opinion_scale': 'questionnaire',
    'simple_input': 'questionnaire',
    'multiple_choice': 'questionnaire',
    'context_screen': 'interaction',
    'yes_no': 'questionnaire',
    'five_second_test': 'heatmap',
    'card_sort': 'interaction',
    'tree_test': 'navigation',
    'screener': 'questionnaire',
    'prototype_test': 'prototype',
    'live_website_test': 'navigation',
    'thank_you': 'interaction',
    'image_upload': 'interaction',
    'file_upload': 'interaction'
  };

  return {
    title: builderTask.title,
    description: builderTask.description,
    type: blockTypeToAPITypeMap[builderTask.type] || 'interaction',
    order: builderTask.order,
    settings: builderTask.settings || {}
  };
}

/**
 * Convert StudyBuilderTask to legacy ITask format
 */
export function convertStudyBuilderTaskToLegacy(builderTask: StudyBuilderTask): ITask {
  // Map block types to legacy task types
  const blockTypeToLegacyTypeMap: Record<BlockType, ITask['type']> = {
    'welcome': 'interaction',
    'open_question': 'questionnaire',
    'opinion_scale': 'questionnaire',
    'simple_input': 'questionnaire',
    'multiple_choice': 'questionnaire',
    'context_screen': 'interaction',
    'yes_no': 'questionnaire',
    'five_second_test': 'prototype-test',
    'card_sort': 'interaction',
    'tree_test': 'navigation',
    'screener': 'questionnaire',
    'prototype_test': 'prototype-test',
    'live_website_test': 'navigation',
    'thank_you': 'interaction',
    'image_upload': 'interaction',
    'file_upload': 'interaction'
  };

  const settings = builderTask.settings || {};

  return {
    _id: builderTask.id,
    studyId: '', // Will be set by the parent study
    title: builderTask.title,
    description: builderTask.description,
    type: blockTypeToLegacyTypeMap[builderTask.type] || 'interaction',
    order: builderTask.order,
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
  // Map legacy task types to block types
  const legacyTypeToBlockTypeMap: Record<ITask['type'], BlockType> = {
    'navigation': 'tree_test',
    'interaction': 'card_sort',
    'questionnaire': 'multiple_choice',
    'prototype-test': 'five_second_test'
  };
  
  return {
    id: legacyTask._id,
    type: legacyTypeToBlockTypeMap[legacyTask.type] || 'multiple-choice',
    title: legacyTask.title,
    description: legacyTask.description,
    order: legacyTask.order,
    settings: {
      recordHeatmap: legacyTask.configuration.heatmapTracking,
      trackClicks: legacyTask.configuration.clickTracking,
      trackScrolling: legacyTask.configuration.scrollTracking,
      questions: legacyTask.configuration.questions,
      successCriteria: legacyTask.successCriteria,
      timeLimit: legacyTask.timeLimit,
      isRequired: legacyTask.isRequired,
      ...legacyTask.configuration
    }
  };
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
  return 'type' in task && 'order' in task && !('_id' in task);
}

/**
 * Determine if tasks are in legacy format
 */
export function isLegacyTask(task: TaskUnion): task is ITask {
  return '_id' in task && 'studyId' in task && 'configuration' in task;
}
