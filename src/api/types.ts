export type VMStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error';

export interface VirtualMachine {
  id: number;
  slug: string;
  name: string;
  hostname: string;
  status: VMStatus;
  cpu: number;
  ram: number;
  disk: number;
  ip_address: string | null;
  zone: string;
  template: string;
  project_slug: string;
  created_at: string;
}

export interface Project {
  id: number;
  slug: string;
  name: string;
  description?: string;
  is_default: boolean;
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
