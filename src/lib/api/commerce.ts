import { apiClient } from './client';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardApi = {
  getSummary: (params?: { from?: string; to?: string }, storeId?: string) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const q = qs.toString();
    return apiClient.get(`/api/dashboard/summary${q ? `?${q}` : ''}`, { storeId });
  },
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const customersApi = {
  list: (params?: { search?: string; page?: number; pageSize?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
    const q = qs.toString();
    return apiClient.get(`/api/customers${q ? `?${q}` : ''}`);
  },

  get: (id: string) => apiClient.get(`/api/customers/${id}`),

  create: (
    body: {
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email?: string;
      address?: string;
      notes?: string;
      companyName?: string;
      category?: 'Retail' | 'Wholesale';
    },
    storeId: string,
  ) => apiClient.post('/api/customers', body, { storeId }),

  addBenefit: (id: string, body: Record<string, unknown>) =>
    apiClient.post(`/api/customers/${id}/benefits`, body),

  getApplicableBenefits: (id: string) =>
    apiClient.get(`/api/customers/${id}/applicable-benefits`),

  rate: (id: string, score: number) =>
    apiClient.post(`/api/customers/${id}/rate`, { score }),
};

// ─── Sales ────────────────────────────────────────────────────────────────────

export const salesApi = {
  record: (body: {
    channel: 'InStore' | 'Marketplace';
    locationId?: string;
    customerId?: string;
    lines: { productId: string; productName: string; quantity: number; unitPrice: number; unitCost: number }[];
    deliveryCost: number;
    paymentKind: 'Paid' | 'PartiallyPaid' | 'Debt';
    amountPaid: number;
    debtDueDate?: string;
    debtNarration?: string;
    benefitIdsToApply?: string[];
  }) => apiClient.post('/api/sales', body),

  getReport: (from: string, to: string) =>
    apiClient.get(`/api/reports/sales?from=${from}&to=${to}`),

  exportReport: (from: string, to: string, format: 'csv' | 'pdf' = 'csv') =>
    apiClient.get(`/api/reports/sales/export?from=${from}&to=${to}&format=${format}`),
};

// ─── Finance ──────────────────────────────────────────────────────────────────

export const financeApi = {
  getOpenDebts: (params?: { overdueOnly?: boolean; customerId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.overdueOnly !== undefined) qs.set('overdueOnly', String(params.overdueOnly));
    if (params?.customerId) qs.set('customerId', params.customerId);
    const q = qs.toString();
    return apiClient.get(`/api/debts/open${q ? `?${q}` : ''}`);
  },

  repayDebt: (id: string, amount: number) =>
    apiClient.post(`/api/debts/${id}/repay`, { amount }),

  writeOffDebt: (id: string, reason: string) =>
    apiClient.post(`/api/debts/${id}/write-off`, { reason }),

  getOverview: (from: string, to: string) =>
    apiClient.get(`/api/finance/overview?from=${from}&to=${to}`),

  getLedger: (params?: { from?: string; to?: string; account?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.account) qs.set('account', params.account);
    const q = qs.toString();
    return apiClient.get(`/api/finance/ledger${q ? `?${q}` : ''}`);
  },

  createExpense: (
    body: { category: string; amount: number; incurredOn: string; notes?: string },
    storeId: string,
  ) => apiClient.post('/api/expenses', body, { storeId }),

  issueCredit: (body: {
    customerId: string;
    amount: number;
    reason: string;
    method: 'InAppCreditBalance' | 'VintranAccountCredit';
  }) => apiClient.post('/api/credits', body),

  getBalancing: (from: string, to: string) =>
    apiClient.get(`/api/finance/balancing?from=${from}&to=${to}`),

  getCustomerReport: () => apiClient.get('/api/reports/customers'),
};

// ─── Staff ────────────────────────────────────────────────────────────────────

export const staffApi = {
  list: () => apiClient.get('/api/staff'),

  create: (body: Record<string, unknown>) => apiClient.post('/api/staff', body),

  deactivate: (id: string) => apiClient.post(`/api/staff/${id}/deactivate`),

  listRoles: () => apiClient.get('/api/roles'),

  createRole: (body: { name: string; permissions: string[] }) =>
    apiClient.post('/api/roles', body),

  updateRole: (id: string, body: { name: string; permissions: string[] }) =>
    apiClient.put(`/api/roles/${id}`, body),

  deleteRole: (id: string) => apiClient.delete(`/api/roles/${id}`),

  getAttendance: (staffId: string, params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const q = qs.toString();
    return apiClient.get(`/api/attendance/${staffId}${q ? `?${q}` : ''}`);
  },

  runPayroll: (body: { payPeriodLabel: string; defaultHoursForHourly: number }) =>
    apiClient.post('/api/payroll/run', body),

  getReport: (from: string, to: string) =>
    apiClient.get(`/api/reports/staff?from=${from}&to=${to}`),
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const notificationsApi = {
  list: (params?: { unreadOnly?: boolean; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.unreadOnly !== undefined) qs.set('unreadOnly', String(params.unreadOnly));
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiClient.get(`/api/notifications${q ? `?${q}` : ''}`);
  },

  getUnreadCount: () => apiClient.get('/api/notifications/unread-count'),

  markRead: (id: string) => apiClient.post(`/api/notifications/${id}/read`),

  markAllRead: () => apiClient.post('/api/notifications/read-all'),

  deleteAll: () => apiClient.delete('/api/notifications'),
};

// ─── Activity ─────────────────────────────────────────────────────────────────

export const activityApi = {
  list: (params?: { staffUserId?: string; from?: string; to?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.staffUserId) qs.set('staffUserId', params.staffUserId);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiClient.get(`/api/activity${q ? `?${q}` : ''}`);
  },
};

// ─── Finance extras ───────────────────────────────────────────────────────────

export const financeExtrasApi = {
  /** GET /api/finance/product-ledger/{productId} */
  getProductLedger: (productId: string, params?: { from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const q = qs.toString();
    return apiClient.get(`/api/finance/product-ledger/${productId}${q ? `?${q}` : ''}`);
  },

  /** POST /api/finance/reconciliations */
  createReconciliation: (body: {
    periodStart: string;
    periodEnd: string;
    lines: { locationId: string; expected: number; declared: number; note?: string }[];
    notes?: string;
  }) => apiClient.post('/api/finance/reconciliations', body),

  /** GET /api/reports/customers/export */
  exportCustomerReport: (format: 'csv' | 'pdf' = 'csv') =>
    apiClient.get(`/api/reports/customers/export?format=${format}`),

  /** GET /api/reports/staff/export */
  exportStaffReport: (params: { from: string; to: string; format?: 'csv' | 'pdf' }) => {
    const qs = new URLSearchParams({ from: params.from, to: params.to });
    if (params.format) qs.set('format', params.format);
    return apiClient.get(`/api/reports/staff/export?${qs.toString()}`);
  },

  /** GET /api/links/inbox */
  getLinksInbox: () => apiClient.get('/api/links/inbox'),

  /** POST /api/links/{id}/accept */
  acceptLink: (id: string) => apiClient.post(`/api/links/${id}/accept`),
};

// ─── Attendance extras ────────────────────────────────────────────────────────

export const attendanceApi = {
  /** PUT /api/attendance/{id} — manual correction */
  correct: (id: string, body: { clockedInUtc: string; clockedOutUtc?: string; reason: string }) =>
    apiClient.put(`/api/attendance/${id}`, body),
};

// ─── Notification preferences ─────────────────────────────────────────────────

export const notificationPreferencesApi = {
  /** GET /api/notifications/preferences */
  get: () => apiClient.get('/api/notifications/preferences'),

  /** PUT /api/notifications/preferences */
  update: (body: {
    trigger: string;
    enabled: boolean;
    thresholdOverride?: number;
    roleFilter?: string;
  }) => apiClient.put('/api/notifications/preferences', body),

  /** GET /api/notifications/preferences/mine */
  getMine: () => apiClient.get('/api/notifications/preferences/mine'),

  /** PUT /api/notifications/preferences/mine */
  updateMine: (body: { trigger: string; enabled: boolean; thresholdOverride?: number }) =>
    apiClient.put('/api/notifications/preferences/mine', body),
};

// ─── Custom reports ───────────────────────────────────────────────────────────

export const customReportsApi = {
  /** POST /api/reports/custom/run */
  run: (body: {
    metric: 'revenue' | 'quantity';
    groupBy: 'product' | 'channel' | 'staff' | 'day';
    from: string;
    to: string;
  }) => apiClient.post('/api/reports/custom/run', body),

  /** POST /api/reports/custom/templates */
  saveTemplate: (body: { name: string; definition: Record<string, unknown> }) =>
    apiClient.post('/api/reports/custom/templates', body),

  /** GET /api/reports/custom/templates */
  listTemplates: () => apiClient.get('/api/reports/custom/templates'),

  /** GET /api/reports/custom/templates/{id}/run */
  runTemplate: (id: string) => apiClient.get(`/api/reports/custom/templates/${id}/run`),

  /** DELETE /api/reports/custom/templates/{id} */
  deleteTemplate: (id: string) => apiClient.delete(`/api/reports/custom/templates/${id}`),
};
