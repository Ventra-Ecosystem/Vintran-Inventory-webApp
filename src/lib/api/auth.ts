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

export const authApi = {
  login: (body: { email: string; password: string }) =>
    apiClient.post<LoginResponse>('/api/auth/login', {
      ...body,
      device: { deviceId: 'web', deviceName: 'Web Browser', deviceType: 1 }, // Web=1
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
    apiClient.post('/api/auth/account/verify-email', body),

  resendOtp: (body: {
    email: string;
    purpose: 'EmailVerification' | 'PasswordReset' | 'TwoFactorEnable';
  }) => apiClient.post('/api/auth/account/resend-otp', body),

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
};

// ─── Business self-service ────────────────────────────────────────────────────

export const businessApi = {
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
