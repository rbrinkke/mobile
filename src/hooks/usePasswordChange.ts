import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import type { PasswordChangeRequest } from '../types/auth';

export function usePasswordChange() {
  return useMutation<void, Error, PasswordChangeRequest>({
    mutationFn: authApi.changePassword,
  });
}
