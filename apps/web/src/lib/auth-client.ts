import type { AuthResponse, LoginDto, RegisterDto } from '@aprendaufu/shared-types';
import { API_URL, apiClient } from './api-client';

export function login(data: LoginDto) {
  return apiClient.post<AuthResponse>('/auth/login', data);
}

export function register(data: RegisterDto) {
  return apiClient.post<AuthResponse>('/auth/register', data);
}

export function googleLoginUrl() {
  return `${API_URL}/auth/google`;
}

export function saveSession(auth: AuthResponse) {
  localStorage.setItem('accessToken', auth.accessToken);
  localStorage.setItem('user', JSON.stringify(auth.user));
}

export function saveAccessToken(token: string) {
  localStorage.setItem('accessToken', token);
}
