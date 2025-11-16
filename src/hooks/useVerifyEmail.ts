import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import type { VerifyEmailRequest } from '../types/auth';

export function useVerifyEmail() {
  return useMutation<void, Error, VerifyEmailRequest>({
    mutationFn: authApi.verifyEmail,
  });
}
