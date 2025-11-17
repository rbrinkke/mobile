import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import type { VerifyCodeRequest } from '@features/auth/types';

export function useVerifyEmail() {
  return useMutation<void, Error, VerifyCodeRequest>({
    mutationFn: authApi.verifyEmail,
  });
}
