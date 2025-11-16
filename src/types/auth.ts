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
  id: string;
  email: string;
  message: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export interface ApiError {
  detail: string;
}
