/**
 * Approval System Components
 * 
 * Components for managing study approval workflows, including:
 * - ApprovalQueue: Main approval management interface
 * - StudyApprovalCard: Individual approval review interface
 * - ApprovalHistory: Audit trail and history tracking
 * - ApprovalNotifications: Real-time approval notifications (planned)
 */

export { default as ApprovalQueue } from './ApprovalQueue';
export { default as StudyApprovalCard } from './StudyApprovalCard';
export { default as ApprovalHistory } from './ApprovalHistory';

// Type exports for external use
export type {
  ApprovalItem,
  ApprovalStatus,
  ApprovalPriority
} from './ApprovalQueue';
