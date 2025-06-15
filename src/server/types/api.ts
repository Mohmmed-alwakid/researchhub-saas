// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  limit?: number;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

// Payment API Types
export interface PaymentPlanInfo {
  id: string;
  name: string;
  price: number;
  currency: string;
  credits: number;
  features: {
    maxStudies: number;
    maxParticipants: number;
    maxRecordingMinutes: number;
    advancedAnalytics: boolean;
    prioritySupport: boolean;
    customBranding: boolean;
  };
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  bankName: string;
  iban: string;
  swiftCode?: string;
}

export interface PaymentRequestData {
  id: string;
  referenceNumber: string;
  amount: number;
  currency: string;
  bankDetails: BankDetails;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  verifiedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}
