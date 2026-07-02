export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  isVintran?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: string;
  stock: number;
  category: string;
  negotiable?: boolean;
}

export interface Order {
  id: string;
  supplierId: string;
  supplierName: string;
  items: { productId: string; name: string; quantity: number; price: string }[];
  status: 'pending' | 'awaiting-receipt' | 'received';
  date: string;
  total: string;
}

export interface Message {
  id: string;
  text: string;
  fromUser: boolean;
  isProposal?: boolean;
  timestamp: string;
}

export type HeaderOverride = { title: string; onBack: () => void } | null;
