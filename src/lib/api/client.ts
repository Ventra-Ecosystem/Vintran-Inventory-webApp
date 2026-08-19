/**
 * Vintran Inventory — Next.js API Client
 *
 * Token strategy:
 *  - Tokens are persisted in localStorage via Zustand persist middleware
 *    (key: "vint-auth"). On page refresh the store rehydrates synchronously
 *    so getAccessToken() always finds the token.
 *  - Silent 401 → refresh → retry with coalesced refresh-lock so multiple
 *    concurrent 401s only trigger one refresh call.
 *  - On refresh failure tokens are cleared and an ApiError is thrown.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://152.53.108.33:5100';

// ─── Inlined token shape (breaks circular dep with auth.ts) ──────────────────
interface AuthTokens {
  userId: string;
  hasBusiness: boolean;
  businessId?: string;
  businessName?: string;
  plan?: string;
  accessToken: string;
  accessTokenExpiresOnUtc: string;
  refreshToken: string;
}

// ─── Response envelope ────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  error: {
    code: string;
    description: string;
    type:
      | 'Validation'
      | 'NotFound'
      | 'Conflict'
      | 'Unauthorized'
      | 'Forbidden'
      | 'PlanRestriction'
      | 'Failure';
  } | null;
  traceId: string | null;
  timestamp: string;
}

// ─── Error class ──────────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public readonly code: string,
    public readonly description: string,
    public readonly type: string,
    public readonly status: number,
    public readonly validationErrors?: Record<string, string[]>,
  ) {
    super(description);
    this.name = 'ApiError';
  }
}

// ─── Token helpers ────────────────────────────────────────────────────────────
// Read directly from the persisted JSON in localStorage so this works both
// during SSR (returns null) and on client (always finds the token after hydration).

const STORAGE_KEY = 'vint-auth'; // must match the persist name in authStore.ts

function getStoredAuth(): { accessToken: string | null; refreshToken: string | null } {
  if (typeof window === 'undefined') return { accessToken: null, refreshToken: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw);
    // Zustand persist wraps state in { state: {...}, version: 0 }
    const state = parsed?.state ?? parsed;
    return {
      accessToken: state?.accessToken ?? null,
      refreshToken: state?.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function getAccessToken(): string | null {
  return getStoredAuth().accessToken;
}

function getRefreshToken(): string | null {
  return getStoredAuth().refreshToken;
}

function clearStoredAuth(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  // Clear the auth cookie so middleware redirects on next navigation
  document.cookie = 'auth-token=; path=/; max-age=0; SameSite=Lax';
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.href = `/login?next=${next}`;
}

// ─── Request options ──────────────────────────────────────────────────────────
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  storeId?: string;
  token?: string;
  next?: NextFetchRequestConfig;
  signal?: AbortSignal;
  _isRefreshRequest?: boolean;
  _isRetry?: boolean;
};

// ─── Refresh lock ─────────────────────────────────────────────────────────────
let refreshPromise: Promise<void> | null = null;

async function performRefresh(): Promise<void> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearStoredAuth();
    redirectToLogin();
    throw new ApiError('no_refresh_token', 'Session expired. Please log in again.', 'Unauthorized', 401);
  }

  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  let json: ApiResponse<AuthTokens>;
  try {
    json = await res.json();
  } catch {
    clearStoredAuth();
    redirectToLogin();
    throw new ApiError('parse_error', 'Failed to parse refresh response.', 'Failure', res.status);
  }

  if (!json.success || !json.data) {
    clearStoredAuth();
    redirectToLogin();
    throw new ApiError(
      json.error?.code ?? 'refresh_failed',
      json.error?.description ?? 'Session expired. Please log in again.',
      json.error?.type ?? 'Unauthorized',
      res.status,
    );
  }

  // Persist new tokens via the Zustand store (also writes to localStorage).
  // Dynamic import avoids auth.ts → client.ts circular dependency.
  try {
    const { useAuthStore } = await import('@/src/store/authStore');
    useAuthStore.getState().setTokens(json.data);
  } catch {
    // Fallback: write directly into the persist key
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : { state: {}, version: 0 };
      const state = existing?.state ?? existing;
      state.accessToken = json.data.accessToken;
      state.refreshToken = json.data.refreshToken;
      state.isAuthenticated = true;
      if (existing.state !== undefined) existing.state = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    }
  }
}

// ─── Core request ─────────────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    headers = {},
    storeId,
    next,
    signal,
    _isRefreshRequest = false,
    _isRetry = false,
  } = options;

  const token = options.token ?? getAccessToken();

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (token) reqHeaders['Authorization'] = `Bearer ${token}`;
  if (storeId) reqHeaders['X-Store-Id'] = storeId;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: reqHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      ...(next ? { next } : {}),
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    throw new ApiError(
      'network_error',
      'Unable to connect to the server. Please check your network connection.',
      'Failure',
      0,
    );
  }

  // ── Silent token refresh ──────────────────────────────────────────────────
  if (res.status === 401 && !_isRefreshRequest && !_isRetry && !path.startsWith('/api/auth')) {
    if (!getRefreshToken()) {
      clearStoredAuth();
      redirectToLogin();
      throw new ApiError('session_expired', 'Session expired. Please log in again.', 'Unauthorized', 401);
    }

    if (!refreshPromise) {
      refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
    }

    await refreshPromise;

    return request<T>(path, { ...options, token: undefined, _isRetry: true });
  }

  // ── Parse envelope / response ─────────────────────────────────────────────
  let rawBody: any;
  try {
    rawBody = await res.json();
  } catch {
    if (!res.ok) {
      throw new ApiError(
        `http_${res.status}`,
        `Server returned an error (${res.status}). Please try again.`,
        'Failure',
        res.status,
      );
    }
    throw new ApiError('parse_error', 'Failed to parse server response.', 'Failure', res.status);
  }

  // Support envelope structure vs raw backend response
  const isEnvelope = typeof rawBody === 'object' && rawBody !== null && 'success' in rawBody;

  if (!res.ok || (isEnvelope && !rawBody.success)) {
    const errorObj = rawBody.error ?? {};
    const code = errorObj.code ?? rawBody.code ?? `status_${res.status}`;
    const type = errorObj.type ?? rawBody.type ?? (res.status === 400 ? 'Validation' : res.status === 401 ? 'Unauthorized' : res.status === 403 ? 'Forbidden' : res.status === 404 ? 'NotFound' : res.status === 409 ? 'Conflict' : 'Failure');

    // Extract validation errors dictionary (e.g. ASP.NET ModelState or custom error mapping)
    const valErrors: Record<string, string[]> | undefined =
      rawBody.errors ?? errorObj.errors ?? errorObj.validationErrors ?? undefined;

    // Build human-readable description
    let description = errorObj.description ?? rawBody.message ?? rawBody.title ?? rawBody.detail;
    if (!description && valErrors && Object.keys(valErrors).length > 0) {
      const firstKey = Object.keys(valErrors)[0];
      const firstVal = valErrors[firstKey];
      description = Array.isArray(firstVal) ? firstVal[0] : String(firstVal);
    }
    if (!description) {
      description = `Request failed with status ${res.status}.`;
    }

    throw new ApiError(code, description, type, res.status, valErrors);
  }

  return rawBody as ApiResponse<T>;
}

// ─── Public API client ────────────────────────────────────────────────────────
export const apiClient = {
  get:    <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'GET' }),
  post:   <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  put:    <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'PUT', body }),
  patch:  <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method'>) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...opts, method: 'DELETE' }),
};
