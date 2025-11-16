/**
 * Auth types - SIMPEL!
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
  email: string;
  user_id: string;
  verification_token: string;  // Token for email verification
}

export interface LoginCodeSentResponse {
  message: string;
  email: string;
  user_id: string;
  requires_code: boolean;
  expires_in: number;
}

export interface OrganizationSelectionResponse {
  organizations: Array<{
    id: string;
    name: string;
    role: string;
  }>;
  user_id: string;
}

export interface VerifyEmailRequest {
  verification_token: string;
  code: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface ApiError {
  detail: string;
}
