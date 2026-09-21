import type { VirtualMachine, Project, Invoice, AccountBalance, User } from './types';

// В dev режиме используем прокси, в production - прямой URL
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'https://uzcloud.stackpoc.in/backend/api');
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

console.log('API Configuration:', {
  baseURL: API_BASE_URL,
  tokenExists: !!API_TOKEN,
  tokenLength: API_TOKEN.length,
  isDev: import.meta.env.DEV
});

async function apiRequest<T>(endpoint: string, options: RequestInit = {}, timeoutMs: number = 10000): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`,
    ...options.headers,
  };

  console.log('API Request:', {
    url,
    method: options.method || 'GET',
    hasToken: !!API_TOKEN,
    tokenPreview: API_TOKEN ? `${API_TOKEN.substring(0, 10)}...` : 'NO TOKEN'
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API Request failed:', error);
    throw error;
  }
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

    create: async (data: {
      name: string;
      hostname?: string;
      project_id?: number;
      service_offering_id: number;
      template_id: number;
      zone_id: number;
      disk_size?: number;
      network_id?: number;
      public_ip?: boolean;
    }): Promise<VirtualMachine> => {
      return apiRequest<VirtualMachine>('/virtual-machines', {
        method: 'POST',
        body: JSON.stringify(data),
      }, 30000); // 30 секунд для создания ВМ
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
