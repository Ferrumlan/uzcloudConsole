export type VMStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error' | 'deploying';

export interface VirtualMachine {
  id: number | string;
  slug: string;
  name: string;
  hostname: string;
  status: VMStatus;
  cpu: number;
  ram: number;
  disk: number;
  storage_volume?: number;
  ip_address: string | null;
  public_ip?: string | null;
  zone: string;
  template: string;
  project_slug: string;
  created_at: string;
}

export interface Project {
  id: number | string;
  slug: string;
  name: string;
  description?: string;
  is_default?: boolean;
}

export interface Region {
  id: string;
  slug: string;
  name: string;
  cloud_provider?: {
    slug: string;
    name: string;
  };
}

export interface Template {
  id: string;
  slug: string;
  name: string;
}

export interface Plan {
  id: string;
  slug: string;
  name: string;
  cpu?: number | string;
  ram?: number | string;
  memory?: number | string;
  price?: number;
  monthly_price?: number;
  attribute?: {
    cpu?: number;
    memory?: number;
    storage?: number;
  };
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  date: string;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  currency: string;
}

export interface AccountBalance {
  balance: number;
  currency: string;
}
