/**
 * Common validation utilities for form validation
 * Provides consistent validation logic across the application
 */

export interface ValidationErrors {
  [key: string]: string;
}

/**
 * Validates email format
 */
export const validateEmail = (email: string): string | null => {
  if (!email || !email.trim()) {
    return 'Email is required';
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  
  return null;
};

/**
 * Validates password strength
 */
export const validatePassword = (password: string): string | null => {
  if (!password || !password.trim()) {
    return 'Password is required';
  }
  
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  // Check for weak passwords
  const weakPasswords = ['12345678', 'password', 'admin', '123456789', 'qwerty'];
  if (weakPasswords.includes(password.toLowerCase())) {
    return 'This password is too common. Please choose a stronger password.';
  }
  
  return null;
};

/**
 * Validates required text fields
 */
export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value || !value.trim()) {
    return `${fieldName} is required`;
  }
  return null;
};

/**
 * Validates name fields (first name, last name)
 */
export const validateName = (name: string, fieldName: string): string | null => {
  if (!name || !name.trim()) {
    return `${fieldName} is required`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} must be at least 2 characters long`;
  }
  
  return null;
};

/**
 * Comprehensive form validation for registration/login forms
 */
export const validateForm = (data: Record<string, unknown>): ValidationErrors => {
  const errors: ValidationErrors = {};
  
  // Email validation
  if ('email' in data && typeof data.email === 'string') {
    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;
  }
  
  // Password validation
  if ('password' in data && typeof data.password === 'string') {
    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;
  }
  
  // First name validation
  if ('firstName' in data && typeof data.firstName === 'string') {
    const firstNameError = validateName(data.firstName, 'First name');
    if (firstNameError) errors.firstName = firstNameError;
  }
  
  // Last name validation
  if ('lastName' in data && typeof data.lastName === 'string') {
    const lastNameError = validateName(data.lastName, 'Last name');
    if (lastNameError) errors.lastName = lastNameError;
  }
  
  // Password confirmation validation
  if ('confirmPassword' in data && 'password' in data && 
      typeof data.password === 'string' && typeof data.confirmPassword === 'string') {
    if (data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }
  }
  
  // Role validation
  if ('role' in data) {
    if (!data.role) {
      errors.role = 'Please select your role';
    }
  }
  
  return errors;
};

/**
 * Check if validation errors exist
 */
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Password strength checker with detailed feedback
 */
export interface PasswordStrength {
  score: number; // 0-5
  feedback: string[];
  isValid: boolean;
  strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
}

export const checkPasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password) {
    return {
      score: 0,
      feedback: ['Password is required'],
      isValid: false,
      strength: 'Very Weak'
    };
  }
  
  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Must be at least 8 characters');
  }
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add an uppercase letter');
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add a lowercase letter');
  }
  
  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add a number');
  }
  
  // Special character check
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Add a special character');
  }
  
  // Common password check
  const weakPasswords = ['123', '123456', 'password', 'admin', 'qwerty', '12345678'];
  if (weakPasswords.includes(password.toLowerCase())) {
    score = 0;
    feedback.push('This password is too common');
  }
  
  // Determine strength
  let strength: PasswordStrength['strength'];
  if (score <= 1) strength = 'Very Weak';
  else if (score <= 2) strength = 'Weak';
  else if (score <= 3) strength = 'Fair';
  else if (score <= 4) strength = 'Good';
  else strength = 'Strong';
  
  return {
    score,
    feedback,
    isValid: score >= 3,
    strength
  };
};
