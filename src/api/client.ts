import type { VirtualMachine, Project, Invoice, AccountBalance, User } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://uzcloud.stackpoc.in/backend/api';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // User
  user: {
    get: async (): Promise<User> => {
      return apiRequest<User>('/user');
    },
  },

  // Projects
  projects: {
    list: async (): Promise<Project[]> => {
      const response = await apiRequest<{ data: Project[] }>('/projects');
      return response.data;
    },
  },

  // Virtual Machines
  virtualMachines: {
    list: async (projectSlug?: string): Promise<VirtualMachine[]> => {
      const params = projectSlug ? `?project_slug=${projectSlug}` : '';
      const response = await apiRequest<{ data: VirtualMachine[] }>(`/virtual-machines${params}`);
      return response.data;
    },

    get: async (slug: string): Promise<VirtualMachine> => {
      return apiRequest<VirtualMachine>(`/virtual-machines/${slug}`);
    },

    start: async (slug: string): Promise<void> => {
      await apiRequest(`/virtual-machines/${slug}/start`, { method: 'PUT' });
    },

    stop: async (slug: string): Promise<void> => {
      await apiRequest(`/virtual-machines/${slug}/stop`, { method: 'PUT' });
    },

    reboot: async (slug: string): Promise<void> => {
      await apiRequest(`/virtual-machines/${slug}/reboot`, { method: 'PUT' });
    },
  },

  // Billing
  billing: {
    getBalance: async (): Promise<AccountBalance> => {
      return apiRequest<AccountBalance>('/account/balance');
    },

    getInvoices: async (): Promise<Invoice[]> => {
      const response = await apiRequest<{ data: Invoice[] }>('/invoices');
      return response.data;
    },
  },
};
