import { apiClient } from './client';

export interface AuthTokens {
  userId: string;
  hasBusiness: boolean;
  businessId?: string;
  businessName?: string;
  plan?: string;
  accessToken: string;
  accessTokenExpiresOnUtc: string;
  refreshToken: string;
}

export interface LoginResponse {
  twoFactorRequired: boolean;
  verifyToken?: string;
  verifyTokenExpiresOnUtc?: string;
  hasBusiness: boolean;
  tokens?: AuthTokens;
}

export interface MeResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  isOwner: boolean;
  hasBusiness: boolean;
  businessId?: string;
  businessName?: string;
  plan?: string;
  permissions: string[];
  entitlements: Record<string, unknown>;
}

/** Returns a stable browser device ID stored in localStorage */
function getWebDeviceId(): string {
  if (typeof window === 'undefined') return 'web-ssr';
  const key = 'vint-device-id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = 'web-' + crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

/** Returns a human-readable browser/OS label */
function getWebDeviceName(): string {
  if (typeof window === 'undefined') return 'Web Browser';
  const ua = navigator.userAgent;
  if (/iPhone|iPad/.test(ua)) return 'Safari on iOS';
  if (/Android/.test(ua)) return 'Chrome on Android';
  if (/Macintosh/.test(ua)) return 'Mac Browser';
  if (/Windows/.test(ua)) return 'Windows Browser';
  if (/Linux/.test(ua)) return 'Linux Browser';
  return 'Web Browser';
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    apiClient.post<LoginResponse>('/api/auth/login', {
      ...body,
      device: {
        deviceId: getWebDeviceId(),
        deviceName: getWebDeviceName(),
        deviceType: 1, // Web=1
      },
    }),

  verify2FA: (body: { verifyToken: string; code: string }) =>
    apiClient.post<AuthTokens>('/api/auth/login/verify-2fa', body),

  resendVerifyOtp: (body: { verifyToken: string }) =>
    apiClient.post('/api/auth/login/resend-verify-otp', body),

  createAccount: (body: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    password: string;
    confirmPassword: string;
    referralCode?: string;
  }) => apiClient.post<{ email: string; expiresOnUtc: string }>('/api/auth/account', body),

  verifyEmail: (body: { email: string; code: string }) =>
    apiClient.post<AuthTokens>('/api/auth/account/verify-email', {
      ...body,
      device: {
        deviceId: getWebDeviceId(),
        deviceName: getWebDeviceName(),
        deviceType: 1, // Web=1
      },
    }),

  resendOtp: (body: {
    email: string;
    purpose: 'EmailVerification' | 'PasswordReset' | 'TwoFactorEnable';
  }) => {
    const purposeCode: Record<string, number> = { EmailVerification: 1, PasswordReset: 2, TwoFactorEnable: 3 };
    return apiClient.post('/api/auth/account/resend-otp', { email: body.email, purpose: purposeCode[body.purpose] });
  },

  forgotPassword: (body: { identifier: string }) =>
    apiClient.post('/api/auth/forgot-password', body),

  resetPassword: (body: {
    email: string;
    code: string;
    newPassword: string;
    confirmPassword: string;
  }) => apiClient.post('/api/auth/reset-password', body),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthTokens>('/api/auth/refresh', { refreshToken }),

  registerBusiness: (body: {
    businessName: string;
    address?: string;
    country?: string;
    state?: string;
    city?: string;
    categoryId?: string;
    categoryName?: string;
    currency?: string;
  }) => apiClient.post('/api/auth/register', body),

  logout: () => apiClient.post('/api/auth/logout'),

  getMe: () => apiClient.get<MeResponse>('/api/me'),

  getBusinessCategories: () =>
    apiClient.get<{ id: string; name: string; sortOrder: number }[]>(
      '/api/business-categories',
    ),

  changePassword: (body: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => apiClient.post('/api/account/change-password', body),

  // ── 2FA ──────────────────────────────────────────────────────────────────
  enable2FA: () =>
    apiClient.post<{ email: string; expiresOnUtc: string }>('/api/auth/2fa/enable'),

  confirm2FA: (body: { code: string }) =>
    apiClient.post('/api/auth/2fa/enable/confirm', body),

  disable2FA: (body: { password: string }) =>
    apiClient.post('/api/auth/2fa/disable', body),

  // ── Sessions ──────────────────────────────────────────────────────────────
  getSessions: () =>
    apiClient.get<{ id: string; deviceName: string; deviceType: string; ipAddress: string; lastActiveUtc: string; isCurrent: boolean }[]>('/api/sessions/mine'),

  revokeSession: (id: string) => apiClient.delete(`/api/sessions/${id}`),

  logoutAll: () => apiClient.post('/api/auth/logout/all'),
};

// ─── Business self-service ────────────────────────────────────────────────────

export const businessApi = {
  /** GET /api/me/business */
  getProfile: () => apiClient.get('/api/me/business'),

  /** PATCH /api/me/business — owner only */
  update: (body: { address?: string; country?: string; city?: string; state?: string }) =>
    apiClient.patch('/api/me/business', body),

  /** POST /api/me/business/name-change */
  requestNameChange: (body: { newName: string }) =>
    apiClient.post('/api/me/business/name-change', body),

  /** GET /api/me/business/name-changes */
  getNameChanges: () => apiClient.get('/api/me/business/name-changes'),

  /** GET /api/businesses/directory */
  searchDirectory: (params?: { search?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiClient.get(`/api/businesses/directory${q ? `?${q}` : ''}`);
  },

  /** POST /api/subscription/change */
  changePlan: (body: { newPlan: 'Basic' | 'Standard' | 'Professional' | 'Enterprise' }) =>
    apiClient.post('/api/subscription/change', body),

  /** POST /api/api-keys */
  createApiKey: (body: { name: string; scopes: string[]; expiresInDays?: number }) =>
    apiClient.post('/api/api-keys', body),
};

// ─── User management ──────────────────────────────────────────────────────────

export const usersApi = {
  /** GET /api/users */
  list: () => apiClient.get('/api/users'),

  /** PATCH /api/users/{id}/role */
  assignRole: (userId: string, body: { roleId: string }) =>
    apiClient.patch(`/api/users/${userId}/role`, body),

  /** PATCH /api/users/{id}/permissions */
  updatePermissions: (userId: string, body: { permissions: string[] }) =>
    apiClient.patch(`/api/users/${userId}/permissions`, body),

  /** POST /api/users/{id}/disable */
  disable: (userId: string) => apiClient.post(`/api/users/${userId}/disable`),

  /** POST /api/users/{id}/enable */
  enable: (userId: string) => apiClient.post(`/api/users/${userId}/enable`),

  /** POST /api/users/{id}/reset-password */
  resetPassword: (userId: string) =>
    apiClient.post(`/api/users/${userId}/reset-password`),
};
