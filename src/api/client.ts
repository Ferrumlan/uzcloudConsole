import type { VirtualMachine, Project, Invoice, AccountBalance, User, VMStatus } from './types';

// В dev режиме используем прокси, в production - прямой URL
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'https://uzcloud.stackpoc.in/backend/api');
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

// Функция нормализации ВМ из API ответа
function normalizeVM(apiVM: any): VirtualMachine {
  // Извлекаем CPU/RAM/Disk из offering (реальная структура API)
  const offering = apiVM.offering || {};
  
  // CPU: строка "4" → число 4
  const cpu = parseInt(offering.cpu || apiVM.cpu || '0', 10) || 0;
  
  // Memory: строка "4096" (MB) → число 4 (GB)
  const memoryMB = parseInt(offering.memory || apiVM.memory || '0', 10) || 0;
  const ram = memoryMB > 100 ? Math.round(memoryMB / 1024) : memoryMB; // Если > 100, значит в MB
  
  // Storage: строка "50" (GB) → число 50
  const disk = parseInt(offering.storage || apiVM.disk || apiVM.disk_size || '0', 10) || 0;

  // Извлекаем IP адрес из ipaddresses массива
  let ip_address: string | null = null;
  if (apiVM.ipaddresses && Array.isArray(apiVM.ipaddresses) && apiVM.ipaddresses.length > 0) {
    // Ищем первый публичный IP
    const publicIP = apiVM.ipaddresses.find((ip: any) => ip.is_public || ip.ip_type === 'public');
    if (publicIP) {
      ip_address = publicIP.ip_address || publicIP.ip || null;
    } else {
      // Если нет публичного, берём первый
      ip_address = apiVM.ipaddresses[0]?.ip_address || apiVM.ipaddresses[0]?.ip || null;
    }
  }
  
  // Fallback на public_ip/private_ip
  if (!ip_address) {
    ip_address = apiVM.public_ip || apiVM.private_ip || null;
  }

  // Извлекаем статус (state не status!)
  const status = (apiVM.state?.toLowerCase() || 
                  apiVM.status?.toLowerCase() ||
                  'stopped') as VMStatus;

  // Извлекаем зону/регион
  const zone = apiVM.region?.name || 
               apiVM.zone || 
               apiVM.zone_name ||
               apiVM.location ||
               '';

  // Извлекаем шаблон/ОС
  const template = apiVM.template?.name || 
                   apiVM.template_name ||
                   apiVM.operating_system?.name ||
                   apiVM.template || 
                   apiVM.os ||
                   '';

  return {
    id: apiVM.id,
    slug: apiVM.slug || apiVM.id?.toString() || '',
    name: apiVM.name || apiVM.hostname || apiVM.display_name || 'Unknown',
    hostname: apiVM.hostname || apiVM.name || '',
    status: status,
    cpu: cpu,
    ram: ram,
    disk: disk,
    ip_address: ip_address,
    zone: zone,
    template: template,
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
      const data = response.data?.data || response.data || [];
      
      // Логируем первый план для отладки структуры
      if (Array.isArray(data) && data.length > 0) {
        console.log('Plan API Response Sample:', JSON.stringify(data[0], null, 2));
      }
      
      return data;
    },
  },
  
  // Virtual Machines
  virtualMachines: {
    list: async (projectSlug?: string): Promise<VirtualMachine[]> => {
      const params = projectSlug ? `?project_slug=${projectSlug}` : '';
      const response = await apiRequest<any>(`/virtual-machines${params}`);
      const data = response.data?.data || response.data || [];
      
      // Логируем первую ВМ для отладки структуры
      if (Array.isArray(data) && data.length > 0) {
        console.log('VM API Response Sample:', JSON.stringify(data[0], null, 2));
      }
      
      return Array.isArray(data) ? data.map(normalizeVM) : [];
    },

    get: async (slug: string): Promise<VirtualMachine> => {
      const response = await apiRequest<any>(`/virtual-machines/${slug}`);
      const data = response.data || response;
      
      // Логируем полную структуру для отладки
      console.log('VM Detail API Response:', JSON.stringify(data, null, 2));
      
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
      billing_cycle?: string;
      storage_category?: string;
      blockstorage_custom_plan?: {
        storage: number;
      };
      [key: string]: any;
    }): Promise<VirtualMachine> => {
      // Добавляем обязательные поля если их нет
      const payload = {
        ...data,
        billing_cycle: data.billing_cycle || 'monthly',
        storage_category: data.storage_category || 'standard',
      };
      
      // Если указан disk_size, добавляем blockstorage_custom_plan
      if (data.disk_size && !data.blockstorage_custom_plan) {
        payload.blockstorage_custom_plan = {
          storage: data.disk_size
        };
      }
      
      console.log('Creating VM with payload:', payload);
      
      const response = await apiRequest<any>('/virtual-machines', {
        method: 'POST',
        body: JSON.stringify(payload),
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
