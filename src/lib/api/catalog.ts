import { apiClient } from './client';

// ─── Products ─────────────────────────────────────────────────────────────────

export const productsApi = {
  list: (params?: { search?: string; category?: string; page?: number; pageSize?: number }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.category) qs.set('category', params.category);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
    const q = qs.toString();
    return apiClient.get(`/api/products${q ? `?${q}` : ''}`);
  },

  get: (id: string) => apiClient.get(`/api/products/${id}`),

  create: (body: {
    sku?: string;
    name: string;
    description?: string;
    category?: string;
    subcategory?: string;
    unitOfMeasure: string;
    lowStockThreshold: number;
    channels: 'InStore' | 'Marketplace' | 'Both';
  }) => apiClient.post('/api/products', body),

  update: (id: string, body: Record<string, unknown>) =>
    apiClient.patch(`/api/products/${id}`, body),

  bulkUpload: (csv: string, dryRun = false) =>
    apiClient.post(`/api/products/bulk?dryRun=${dryRun}`, { csv }),

  getStock: (productId: string) =>
    apiClient.get(`/api/products/${productId}/stock`),

  getMovements: (productId: string, params?: { locationId?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.locationId) qs.set('locationId', params.locationId);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiClient.get(`/api/products/${productId}/movements${q ? `?${q}` : ''}`);
  },

  setStorePrice: (id: string, body: { storeId: string; inStorePrice: number }) =>
    apiClient.put(`/api/products/${id}/store-price`, body),

  getStorePrices: (id: string) =>
    apiClient.get(`/api/products/${id}/store-prices`),
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const categoriesApi = {
  list: () => apiClient.get('/api/categories'),
  create: (body: { name: string; description?: string; parentCategoryId?: string }) =>
    apiClient.post('/api/categories', body),
  update: (id: string, body: { name?: string; description?: string }) =>
    apiClient.patch(`/api/categories/${id}`, body),
  delete: (id: string, body?: { reassignToCategoryId?: string }) =>
    apiClient.post(`/api/categories/${id}/delete`, body ?? {}),
};

// ─── Stock & Locations ────────────────────────────────────────────────────────

export const stockApi = {
  receive: (body: {
    productId: string;
    locationId: string;
    quantity: number;
    unitCost?: number;
    batchReference?: string;
  }) => apiClient.post('/api/stock/receive', body),

  adjust: (body: {
    productId: string;
    locationId: string;
    actualQuantity: number;
    reason: string;
    notes?: string;
  }) => apiClient.post('/api/stock/adjust', body),

  transfer: (body: {
    productId: string;
    sourceLocationId: string;
    destinationLocationId: string;
    quantity: number;
    inStorePrice?: number;
  }) => apiClient.post('/api/stock/transfer', body),

  approveTransfer: (id: string) => apiClient.post(`/api/stock/transfers/${id}/approve`),
  rejectTransfer: (id: string, reason?: string) =>
    apiClient.post(`/api/stock/transfers/${id}/reject`, { reason }),
  getPendingTransfers: () => apiClient.get('/api/stock/transfers/pending'),

  /** GET /api/stock/movements — business-wide movement feed */
  listMovements: (params?: { kind?: string; locationId?: string; productId?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.kind) qs.set('kind', params.kind);
    if (params?.locationId) qs.set('locationId', params.locationId);
    if (params?.productId) qs.set('productId', params.productId);
    if (params?.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiClient.get(`/api/stock/movements${q ? `?${q}` : ''}`);
  },
};

export const locationsApi = {
  list: () => apiClient.get('/api/locations'),

  createStore: (body: {
    name: string;
    address?: string;
    country?: string;
    city?: string;
    state?: string;
    actsAsWarehouse: boolean;
    operatingHours?: string;
  }) => apiClient.post('/api/stores', body),

  updateStore: (id: string, body: Record<string, unknown>) =>
    apiClient.put(`/api/stores/${id}`, body),

  createWarehouse: (body: {
    name: string;
    address?: string;
    country?: string;
    city?: string;
    state?: string;
    capacityNotes?: string;
    makePrimary: boolean;
  }) => apiClient.post('/api/warehouses', body),

  deactivate: (id: string) => apiClient.post(`/api/locations/${id}/deactivate`),
};

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const suppliersApi = {
  list: (params?: { search?: string; favouriteOnly?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.favouriteOnly !== undefined)
      qs.set('favouriteOnly', String(params.favouriteOnly));
    const q = qs.toString();
    return apiClient.get(`/api/suppliers${q ? `?${q}` : ''}`);
  },

  get: (id: string) => apiClient.get(`/api/suppliers/${id}`),

  create: (body: Record<string, unknown>) => apiClient.post('/api/suppliers', body),

  favourite: (id: string) => apiClient.post(`/api/suppliers/${id}/favourite`),
  unfavourite: (id: string) => apiClient.delete(`/api/suppliers/${id}/favourite`),

  getMessages: (id: string, limit = 200) =>
    apiClient.get(`/api/suppliers/${id}/messages?limit=${limit}`),

  sendMessage: (id: string, body: { body: string; attachmentUrl?: string }) =>
    apiClient.post(`/api/suppliers/${id}/messages`, body),

  getBenefits: (id: string) => apiClient.get(`/api/suppliers/${id}/benefits`),

  addBenefit: (id: string, body: Record<string, unknown>) =>
    apiClient.post(`/api/suppliers/${id}/benefits`, body),

  rate: (id: string, score: number) =>
    apiClient.post(`/api/suppliers/${id}/rate`, { score }),

  getConnectionRequests: (pendingOnly = true) =>
    apiClient.get(`/api/suppliers/connection-requests?pendingOnly=${pendingOnly}`),

  decideConnection: (id: string, accept: boolean) =>
    apiClient.post(`/api/suppliers/connection-requests/${id}/decide`, { accept }),
};

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export const purchaseOrdersApi = {
  list: (status?: string) =>
    apiClient.get(`/api/purchase-orders${status ? `?status=${status}` : ''}`),

  get: (id: string) => apiClient.get(`/api/purchase-orders/${id}`),

  create: (body: {
    supplierId: string;
    lines: { productId: string; quantity: number; unitCost: number }[];
  }) => apiClient.post('/api/purchase-orders', body),

  receive: (
    id: string,
    body: { locationId: string; lines: { lineId: string; quantityReceived: number }[] },
  ) => apiClient.post(`/api/purchase-orders/${id}/receive`, body),

  cancel: (id: string, reason: string) =>
    apiClient.post(`/api/purchase-orders/${id}/cancel`, { reason }),

  markPaid: (id: string, transactionReference: string) =>
    apiClient.post(`/api/purchase-orders/${id}/mark-paid`, { transactionReference }),

  negotiate: (lineId: string, body: { proposedUnitCost: number; note?: string }) =>
    apiClient.post(`/api/purchase-order-lines/${lineId}/negotiate`, body),

  respondToNegotiation: (id: string, accept: boolean) =>
    apiClient.post(`/api/negotiations/${id}/respond`, { accept }),

  getMovements: (id: string) =>
    apiClient.get(`/api/purchase-orders/${id}/movements`),
};

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reportsApi = {
  inventory: (deadStockWindowDays?: number) =>
    apiClient.get(
      `/api/reports/inventory${deadStockWindowDays ? `?deadStockWindowDays=${deadStockWindowDays}` : ''}`,
    ),

  suppliers: (from?: string, to?: string) => {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const q = qs.toString();
    return apiClient.get(`/api/reports/suppliers${q ? `?${q}` : ''}`);
  },
};

// ─── Consumer Marketplace Listings ───────────────────────────────────────────

export const marketplaceApi = {
  /** GET /api/listings */
  list: (params?: { includePaused?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.includePaused) qs.set('includePaused', 'true');
    const q = qs.toString();
    return apiClient.get(`/api/listings${q ? `?${q}` : ''}`);
  },

  /** POST /api/listings */
  create: (body: {
    productId: string;
    quantity: number;
    overridePrice?: number;
    fulfillingStoreId?: string;
    description?: string;
    minimumOrderQuantity?: number;
    channelIds?: string[];
  }) => apiClient.post('/api/listings', body),

  /** POST /api/listings/bulk */
  bulkCreate: (body: {
    lines: { productId: string; quantity: number; overridePrice?: number; description?: string }[];
    fulfillingStoreId: string;
    minimumOrderQuantity?: number;
    channelIds?: string[];
  }) => apiClient.post('/api/listings/bulk', body),

  /** POST /api/listings/{id}/revalidate */
  revalidate: (id: string) => apiClient.post(`/api/listings/${id}/revalidate`),

  /** POST /api/listings/{id}/pause */
  pause: (id: string) => apiClient.post(`/api/listings/${id}/pause`),

  /** POST /api/listings/{id}/resume */
  resume: (id: string) => apiClient.post(`/api/listings/${id}/resume`),

  /** POST /api/listings/{id}/vintran-link */
  attachVintranLink: (id: string, body: { link: string }) =>
    apiClient.post(`/api/listings/${id}/vintran-link`, body),

  /** PATCH /api/listings/{id}/quantity */
  updateQuantity: (id: string, body: { newQuantity: number }) =>
    apiClient.patch(`/api/listings/${id}/quantity`, body),

  /** DELETE /api/listings/{id} */
  delete: (id: string) => apiClient.delete(`/api/listings/${id}`),

  /** GET /api/marketplace-channels */
  listChannels: () => apiClient.get('/api/marketplace-channels'),

  /** POST /api/marketplace-channels */
  createChannel: (body: { name: string; kind: 'Marketplace' | 'Storefront' }) =>
    apiClient.post('/api/marketplace-channels', body),
};

// ─── B2B Listings & Orders ────────────────────────────────────────────────────

export const b2bApi = {
  /** POST /api/b2b-listings */
  createListing: (body: {
    productId: string;
    quantityToList: number;
    unitPrice: number;
    minimumOrderQuantity: number;
    isNegotiable: boolean;
    offersVolumeDiscounts: boolean;
    notes?: string;
  }) => apiClient.post('/api/b2b-listings', body),

  /** GET /api/b2b-listings/mine */
  getMyListings: () => apiClient.get('/api/b2b-listings/mine'),

  /** PATCH /api/b2b-listings/{id} */
  updateListing: (
    id: string,
    body: { unitPrice: number; quantityAvailable: number; isNegotiable: boolean },
  ) => apiClient.patch(`/api/b2b-listings/${id}`, body),

  /** POST /api/b2b-listings/{id}/delist */
  delist: (id: string) => apiClient.post(`/api/b2b-listings/${id}/delist`),

  /** POST /api/b2b-listings/{id}/vintran-link */
  attachVintranLink: (id: string, body: { link: string }) =>
    apiClient.post(`/api/b2b-listings/${id}/vintran-link`, body),

  /** GET /api/b2b-orders/supply-dashboard */
  getSupplyDashboard: () => apiClient.get('/api/b2b-orders/supply-dashboard'),

  /** GET /api/b2b-orders/incoming */
  getIncomingOrders: (status?: string) =>
    apiClient.get(`/api/b2b-orders/incoming${status ? `?status=${status}` : ''}`),

  /** GET /api/b2b-orders/{id} */
  getOrder: (id: string) => apiClient.get(`/api/b2b-orders/${id}`),

  /** POST /api/b2b-orders/{id}/ship */
  shipOrder: (
    id: string,
    body: { sourceLocationId: string; lines: { lineId: string; quantityShipped: number }[] },
  ) => apiClient.post(`/api/b2b-orders/${id}/ship`, body),

  /** POST /api/b2b-orders/{id}/status */
  updateOrderStatus: (
    id: string,
    body: { status: 'Processing' | 'Delivered' | 'Cancelled' },
  ) => apiClient.post(`/api/b2b-orders/${id}/status`, body),

  /** GET /api/businesses/{linkedBusinessId}/b2b-listings */
  getBusinessListings: (linkedBusinessId: string) =>
    apiClient.get(`/api/businesses/${linkedBusinessId}/b2b-listings`),

  /** POST /api/b2b-orders/negotiations/{lineId}/respond */
  respondToNegotiation: (lineId: string, body: { accept: boolean }) =>
    apiClient.post(`/api/b2b-orders/negotiations/${lineId}/respond`, body),

  /** GET /api/reports/suppliers/export */
  exportSupplierReport: (params?: { format?: 'csv' | 'pdf'; from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.format) qs.set('format', params.format);
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const q = qs.toString();
    return apiClient.get(`/api/reports/suppliers/export${q ? `?${q}` : ''}`);
  },
};
