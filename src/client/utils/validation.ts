export interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationError[];
}

export const createValidationError = (
  field: string,
  message: string,
  type: 'error' | 'warning' | 'info' = 'error',
  code?: string
): ValidationError => ({
  field,
  message,
  type,
  code
});

export const createValidationResult = (
  errors: ValidationError[] = [],
  warnings: ValidationError[] = [],
  suggestions: ValidationError[] = []
): ValidationResult => ({
  isValid: errors.length === 0,
  errors,
  warnings,
  suggestions
});

// Common validation rules
export const validateStudyTitle = (title: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!title || title.trim().length === 0) {
    errors.push(createValidationError('Study Title', 'Title is required', 'error'));
  } else if (title.length < 3) {
    errors.push(createValidationError('Study Title', 'Title must be at least 3 characters long', 'error'));
  } else if (title.length > 100) {
    errors.push(createValidationError('Study Title', 'Title must be less than 100 characters', 'error'));
  }
  
  return errors;
};

export const validateStudyDescription = (description: string): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!description || description.trim().length === 0) {
    errors.push(createValidationError('Description', 'Description is required', 'error'));
  } else if (description.length < 10) {
    errors.push(createValidationError('Description', 'Description should be at least 10 characters long', 'warning'));
  } else if (description.length > 500) {
    errors.push(createValidationError('Description', 'Description must be less than 500 characters', 'error'));
  }
  
  return errors;
};

export const validateTasks = (tasks: unknown[]): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (!tasks || tasks.length === 0) {
    errors.push(createValidationError('Tasks', 'At least one task is required', 'error'));
  } else if (tasks.length > 10) {
    errors.push(createValidationError('Tasks', 'Too many tasks may overwhelm participants', 'warning'));
  }
  
  return errors;
};

export const validateStudyDuration = (totalMinutes: number): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (totalMinutes > 60) {
    errors.push(createValidationError('Duration', 'Studies longer than 60 minutes may have high dropout rates', 'warning'));
  } else if (totalMinutes > 90) {
    errors.push(createValidationError('Duration', 'Studies longer than 90 minutes are not recommended', 'error'));
  } else if (totalMinutes < 5) {
    errors.push(createValidationError('Duration', 'Very short studies may not provide enough data', 'info'));
  }
  
  return errors;
};
