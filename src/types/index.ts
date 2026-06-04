export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface Client {
  id: string;
  name: string;
  cif: string;
  email: string;
  address?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  createdAt: string;
}

export interface InvoiceItem {
  serviceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface InvoiceData {
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: Client;
  data: InvoiceData;
  subtotal: number;
  tax: number;
  total: number;
  status: 'DRAFT' | 'GENERATED' | 'DOWNLOADED';
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  cif: string;
  email: string;
  address?: string;
  phone?: string;
  logo?: string;
  paymentMethod: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}