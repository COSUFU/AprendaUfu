import type { AuthResponse, LoginDto, RegisterDto } from '@aprendaufu/shared-types';
import { apiClient } from './api-client';

export function login(data: LoginDto) {
  return apiClient.post<AuthResponse>('/auth/login', data);
}

export function register(data: RegisterDto) {
  return apiClient.post<AuthResponse>('/auth/register', data);
}

export function saveSession(auth: AuthResponse) {
  localStorage.setItem('accessToken', auth.accessToken);
  localStorage.setItem('user', JSON.stringify(auth.user));
}
