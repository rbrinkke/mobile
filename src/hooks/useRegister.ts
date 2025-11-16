import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import type { RegisterRequest, RegisterResponse } from '../types/auth';

export function useRegister() {
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: authApi.register,
  });
}
