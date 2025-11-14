import { z } from 'zod';

/**
 * Zod validation schemas for authentication forms
 *
 * Features:
 * - Strong password validation (min 8 chars, uppercase, lowercase, number)
 * - Email format validation
 * - 6-digit code validation
 * - Clear, user-friendly error messages
 */

// ============================================================================
// Email Schema
// ============================================================================

export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .toLowerCase()
  .trim();

// ============================================================================
// Password Schema
// ============================================================================

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(
    /[A-Z]/,
    'Password must contain at least one uppercase letter'
  )
  .regex(
    /[a-z]/,
    'Password must contain at least one lowercase letter'
  )
  .regex(
    /[0-9]/,
    'Password must contain at least one number'
  );

// ============================================================================
// Code Schema (6 digits)
// ============================================================================

export const codeSchema = z
  .string()
  .length(6, 'Code must be exactly 6 digits')
  .regex(/^[0-9]{6}$/, 'Code must contain only numbers');

// ============================================================================
// Form Schemas
// ============================================================================

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Code verification schema (for email verification or 2FA)
 */
export const verifyCodeSchema = z.object({
  code: codeSchema,
});

export type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

/**
 * Password reset request schema
 */
export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export type RequestPasswordResetFormData = z.infer<
  typeof requestPasswordResetSchema
>;

/**
 * New password schema (for password reset)
 */
export const newPasswordSchema = z.object({
  code: codeSchema,
  newPassword: passwordSchema,
});

export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

/**
 * Organization selection schema
 */
export const organizationSelectionSchema = z.object({
  orgId: z.string().uuid('Invalid organization ID'),
});

export type OrganizationSelectionFormData = z.infer<
  typeof organizationSelectionSchema
>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate email without throwing
 */
export function isValidEmail(email: string): boolean {
  return emailSchema.safeParse(email).success;
}

/**
 * Validate password without throwing
 */
export function isValidPassword(password: string): boolean {
  return passwordSchema.safeParse(password).success;
}

/**
 * Validate code without throwing
 */
export function isValidCode(code: string): boolean {
  return codeSchema.safeParse(code).success;
}

/**
 * Get password strength score (0-4)
 */
export function getPasswordStrength(password: string): {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
  color: string;
} {
  if (!password) {
    return { score: 0, label: 'Weak', color: '#FF3B30' };
  }

  let score = 0;

  // Length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++; // Special chars

  // Normalize to 0-4
  score = Math.min(score, 4);

  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'] as const;
  const colors = ['#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#30D158'];

  return {
    score,
    label: labels[score],
    color: colors[score],
  };
}

/**
 * Get human-readable password requirements
 */
export function getPasswordRequirements(): string[] {
  return [
    'At least 8 characters long',
    'One uppercase letter',
    'One lowercase letter',
    'One number',
  ];
}

/**
 * Check which password requirements are met
 */
export function checkPasswordRequirements(password: string): {
  requirement: string;
  met: boolean;
}[] {
  return [
    {
      requirement: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      requirement: 'One uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      requirement: 'One lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      requirement: 'One number',
      met: /[0-9]/.test(password),
    },
  ];
}
