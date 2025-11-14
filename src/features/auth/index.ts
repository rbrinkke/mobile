/**
 * Auth feature barrel exports
 */

// Components
export { AuthInput } from './components/AuthInput';
export { CodeInput } from './components/CodeInput';

// Screens
export { AuthScreen } from './screens/AuthScreen';

// Hooks
export {
  useRegister,
  useVerifyCode,
  useLogin,
  useRequestPasswordReset,
  useResetPassword,
  useLogout,
  useIsAuthenticated,
} from './hooks/useAuth';
export { useAuthFlow } from './hooks/useAuthFlow';

// Types
export type {
  AuthMode,
  AuthState,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  TokenResponse,
  LoginCodeSentResponse,
  OrganizationSelectionResponse,
  Organization,
  VerifyCodeRequest,
  RequestPasswordResetRequest,
  ResetPasswordRequest,
} from './types';

export {
  isTokenResponse,
  isLoginCodeSentResponse,
  isOrganizationSelectionResponse,
} from './types';

// Validation
export {
  emailSchema,
  passwordSchema,
  codeSchema,
  loginSchema,
  registerSchema,
  verifyCodeSchema,
  requestPasswordResetSchema,
  newPasswordSchema,
  organizationSelectionSchema,
  isValidEmail,
  isValidPassword,
  isValidCode,
  getPasswordStrength,
  getPasswordRequirements,
  checkPasswordRequirements,
} from './validation';

export type {
  LoginFormData,
  RegisterFormData,
  VerifyCodeFormData,
  RequestPasswordResetFormData,
  NewPasswordFormData,
  OrganizationSelectionFormData,
} from './validation';

// Services
export { authApi } from './services/authApi';
