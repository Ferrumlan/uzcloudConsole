import type { VirtualMachine, Project, Invoice, AccountBalance, User, VMStatus } from './types';

// В dev режиме используем прокси, в production - прямой URL
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'https://uzcloud.stackpoc.in/backend/api');
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

// Функция нормализации ВМ из API ответа
function normalizeVM(apiVM: any): VirtualMachine {
  return {
    id: apiVM.id,
    slug: apiVM.slug || apiVM.id?.toString() || '',
    name: apiVM.name || apiVM.hostname || 'Unknown',
    hostname: apiVM.hostname || apiVM.name || '',
    status: (apiVM.status?.toLowerCase() || 'stopped') as VMStatus,
    cpu: apiVM.cpu || apiVM.service_offering?.cpu || apiVM.plan?.cpu || 0,
    ram: apiVM.ram || apiVM.service_offering?.ram || apiVM.plan?.ram || 0,
    disk: apiVM.disk || apiVM.disk_size || apiVM.volume_size || 0,
    ip_address: apiVM.ip_address || apiVM.ip || apiVM.public_ip || null,
    zone: apiVM.zone || apiVM.region?.name || apiVM.region || '',
    template: apiVM.template?.name || apiVM.template || apiVM.os || '',
    project_slug: apiVM.project?.slug || apiVM.project || 'default',
    created_at: apiVM.created_at || new Date().toISOString(),
  };
}

console.log('API Configuration:', {
  baseURL: API_BASE_URL,
  tokenExists: !!API_TOKEN,
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
    tokenLength: API_TOKEN.length,
    tokenPreview: API_TOKEN ? `${API_TOKEN.substring(0, 20)}...` : 'NO TOKEN',
    authHeader: `Bearer ${API_TOKEN.substring(0, 20)}...`
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
  // User Profile
  user: {
    get: async (): Promise<User> => {
      const response = await apiRequest<any>('/profile');
      // API возвращает { status, data: { user, account } }
      const userData = response.data?.user || response.data || response;
      return {
        id: userData.id,
        email: userData.email,
        first_name: userData.name?.split(' ')[0] || '',
        last_name: userData.name?.split(' ').slice(1).join(' ') || '',
      };
    },
  },

  // Projects
  projects: {
    list: async (): Promise<Project[]> => {
      const response = await apiRequest<any>('/projects');
      // API возвращает { status, data: { data: [...] } } или { status, data: [...] }
      return response.data?.data || response.data || [];
    },
  },

  // Regions
  regions: {
    list: async () => {
      const response = await apiRequest<any>('/regions');
      return response.data?.data || response.data || [];
    },
  },

  // Templates
  templates: {
    list: async () => {
      const response = await apiRequest<any>('/templates');
      return response.data?.data || response.data || [];
    },
  },

  // Plans
  plans: {
    listVMPlans: async () => {
      const response = await apiRequest<any>('/plans/service/Virtual Machine');
      return response.data?.data || response.data || [];
    },
  },
  
  // Virtual Machines
  virtualMachines: {
    list: async (projectSlug?: string): Promise<VirtualMachine[]> => {
      const params = projectSlug ? `?project_slug=${projectSlug}` : '';
      const response = await apiRequest<any>(`/virtual-machines${params}`);
      const data = response.data?.data || response.data || [];
      return Array.isArray(data) ? data.map(normalizeVM) : [];
    },

    get: async (slug: string): Promise<VirtualMachine> => {
      const response = await apiRequest<any>(`/virtual-machines/${slug}`);
      const data = response.data || response;
      return normalizeVM(data);
    },

    create: async (data: {
      name: string;
      hostname?: string;
      cloud_provider: string;
      region: string;
      project: string;
      template?: string;
      service_offering?: string;
      plan_id?: string;
      disk_size?: number;
      network_type?: string;
      public_ip?: boolean;
      [key: string]: any;
    }): Promise<VirtualMachine> => {
      const response = await apiRequest<any>('/virtual-machines', {
        method: 'POST',
        body: JSON.stringify(data),
      }, 60000); // 60 секунд для создания ВМ
      return response.data || response;
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
      const response = await apiRequest<any>('/account/balance');
      // API возвращает { status, data: { balance, currency } }
      return response.data || response;
    },

    getInvoices: async (): Promise<Invoice[]> => {
      const response = await apiRequest<any>('/billing/invoices');
      return response.data?.data || response.data || [];
    },
  },
};
