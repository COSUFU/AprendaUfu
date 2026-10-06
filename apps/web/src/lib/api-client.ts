import { MESSAGES } from '@aprendaufu/messages';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 300;
const MAX_DELAY_MS = 3000;
const REQUEST_TIMEOUT_MS = 10000;
const NETWORK_ERROR_STATUS = 0;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelay(attempt: number) {
  const exponential = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (attempt - 1));
  return exponential + Math.random() * BASE_DELAY_MS;
}

function retryAfterDelay(response: Response): number | null {
  const header = response.headers.get('Retry-After');
  if (!header) return null;

  const seconds = Number(header);
  if (Number.isFinite(seconds)) return seconds * 1000;

  const date = Date.parse(header);
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
}

async function fetchWithTimeout(path: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(`${API_URL}${path}`, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function request<T>(
  path: string,
  options: RequestInit,
  retryable: boolean,
): Promise<T> {
  const token = getToken();
  const init: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  for (let attempt = 1; ; attempt++) {
    const canRetry = retryable && attempt < MAX_ATTEMPTS;
    try {
      const response = await fetchWithTimeout(path, init);

      if (response.ok) {
        return (await response.json()) as T;
      }

      if (canRetry && RETRYABLE_STATUS.has(response.status)) {
        await delay(retryAfterDelay(response) ?? backoffDelay(attempt));
        continue;
      }

      const body = await response.json().catch(() => null);
      throw new ApiError(response.status, body?.message ?? MESSAGES.request.genericError);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (canRetry) {
        await delay(backoffDelay(attempt));
        continue;
      }
      throw new ApiError(NETWORK_ERROR_STATUS, MESSAGES.request.genericError);
    }
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, {}, true),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }, false),
};
