/**
 * Authentication feature types
 *
 * Aligned with Auth API OpenAPI specification
 */

// ============================================================================
// API Request Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface VerifyCodeRequest {
  verification_token: string;
  code: string; // 6 digits
}

export interface LoginRequest {
  email: string;
  password: string;
  code?: string; // Optional 6-digit code for 2FA
  org_id?: string; // Optional organization selection
}

export interface RequestPasswordResetRequest {
  email: string;
}

export interface ResetPasswordRequest {
  reset_token: string;
  code: string; // 6 digits
  new_password: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

// ============================================================================
// API Response Types (Discriminated Unions)
// ============================================================================

export interface TokenResponse {
  type: 'success';
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number; // seconds
}

export interface LoginCodeSentResponse {
  type: 'code_sent';
  message: string;
  email: string;
  user_id: string;
}

export interface OrganizationSelectionResponse {
  type: 'org_selection';
  organizations: Organization[];
  user_id: string;
}

export interface Organization {
  id: string;
  name: string;
  role?: string;
}

// Discriminated union for login responses
export type LoginResponse =
  | TokenResponse
  | LoginCodeSentResponse
  | OrganizationSelectionResponse;

export interface VerifyCodeResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

export interface RegisterResponse {
  message: string;
  email: string;
  verification_token: string;
  user_id: string;
}

export interface RequestPasswordResetResponse {
  message: string;
  reset_token: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// ============================================================================
// Auth State Types
// ============================================================================

export type AuthMode =
  | 'login'
  | 'register'
  | 'verify-email'
  | 'enter-code'
  | 'reset-password'
  | 'org-selection';

export interface AuthState {
  mode: AuthMode;
  email?: string;
  verificationToken?: string;
  resetToken?: string;
  userId?: string;
  organizations?: Organization[];
  error?: string;
}

// ============================================================================
// Auth Flow State Machine Types
// ============================================================================

export type RegisterFlowState =
  | { step: 'email-password' }
  | { step: 'verify-code'; verificationToken: string; email: string };

export type LoginFlowState =
  | { step: 'email-password' }
  | { step: 'enter-code'; email: string }
  | { step: 'select-org'; organizations: Organization[]; email: string };

export type ResetPasswordFlowState =
  | { step: 'email' }
  | { step: 'enter-code'; resetToken: string; email: string }
  | { step: 'new-password'; resetToken: string; code: string; email: string };

// ============================================================================
// Form Data Types
// ============================================================================

export interface EmailPasswordFormData {
  email: string;
  password: string;
}

export interface CodeFormData {
  code: string; // 6 digits
}

export interface ResetPasswordFormData {
  email: string;
}

export interface NewPasswordFormData {
  code: string;
  newPassword: string;
}

export interface OrganizationSelectionFormData {
  orgId: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface AuthError {
  message: string;
  field?: string; // Field-specific error (e.g., 'email', 'password')
  code?: string; // Error code from API
}

// ============================================================================
// Type Guards
// ============================================================================

export function isTokenResponse(
  response: LoginResponse
): response is TokenResponse {
  return response.type === 'success';
}

export function isLoginCodeSentResponse(
  response: LoginResponse
): response is LoginCodeSentResponse {
  return response.type === 'code_sent';
}

export function isOrganizationSelectionResponse(
  response: LoginResponse
): response is OrganizationSelectionResponse {
  return response.type === 'org_selection';
}
