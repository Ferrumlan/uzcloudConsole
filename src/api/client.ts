import type { VirtualMachine, Project, Invoice, AccountBalance, User, VMStatus } from './types';

// В dev режиме используем прокси, в production - прямой URL
const API_BASE_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_BASE_URL || 'https://uzcloud.stackpoc.in/backend/api');
const API_TOKEN = import.meta.env.VITE_API_TOKEN || '';

// Функция нормализации ВМ из API ответа
function normalizeVM(apiVM: any): VirtualMachine {
  console.log('Normalizing VM:', apiVM.slug || apiVM.id);
  
  // Извлекаем CPU/RAM/Disk из offering (реальная структура API)
  const offering = apiVM.offering || {};
  
  console.log('=== OFFERING STRUCTURE ===');
  console.log('Full offering:', JSON.stringify(offering, null, 2));
  console.log('offering.cpu:', offering.cpu);
  console.log('offering.memory:', offering.memory);
  console.log('offering.storage:', offering.storage);
  console.log('offering.disk:', offering.disk);
  console.log('offering.disk_size:', offering.disk_size);
  console.log('apiVM.disk:', apiVM.disk);
  console.log('apiVM.disk_size:', apiVM.disk_size);
  console.log('apiVM.storage:', apiVM.storage);
  console.log('apiVM.volume_size:', apiVM.volume_size);
  console.log('apiVM.blockstorage:', apiVM.blockstorage);
  
  // CPU: строка "4" → число 4
  const cpu = parseInt(offering.cpu || apiVM.cpu || '0', 10) || 0;
  
  // Memory: строка "4096" (MB) → число 4 (GB)
  const memoryMB = parseInt(offering.memory || apiVM.memory || '0', 10) || 0;
  const ram = memoryMB > 100 ? Math.round(memoryMB / 1024) : memoryMB; // Если > 100, значит в MB
  
  // Storage: строка "50" (GB) → число 50
  // Пробуем разные возможные поля
  const disk = parseInt(
    offering.storage || 
    offering.disk || 
    offering.disk_size || 
    offering.volume_size ||
    apiVM.disk || 
    apiVM.disk_size || 
    apiVM.storage ||
    apiVM.volume_size ||
    apiVM.blockstorage?.size ||
    '0', 
    10
  ) || 0;
  
  console.log('Extracted disk value:', disk);

  console.log('Extracted config:', { cpu, ram, disk, memoryMB });

  // Извлекаем IP адрес из ipaddresses массива
  let ip_address: string | null = null;
  let public_ip: string | null = null;
  
  console.log('Full API VM response:', apiVM);
  console.log('offering field:', apiVM.offering);
  console.log('ipaddresses field:', apiVM.ipaddresses);
  console.log('public_ip field:', apiVM.public_ip);
  console.log('private_ip field:', apiVM.private_ip);
  
  if (apiVM.ipaddresses && Array.isArray(apiVM.ipaddresses) && apiVM.ipaddresses.length > 0) {
    console.log('IP addresses found:', apiVM.ipaddresses.length, apiVM.ipaddresses);
    
    // Разделяем публичные и приватные IP
    const publicIPs = apiVM.ipaddresses.filter((ip: any) => 
      ip.is_public || ip.ip_type === 'Public IP' || ip.ip_type === 'public'
    );
    const privateIPs = apiVM.ipaddresses.filter((ip: any) => 
      !ip.is_public && ip.ip_type !== 'Public IP' && ip.ip_type !== 'public'
    );
    
    console.log('Public IPs:', publicIPs);
    console.log('Private IPs:', privateIPs);
    
    // Берём первый публичный IP
    if (publicIPs.length > 0) {
      public_ip = publicIPs[0].ipaddress || publicIPs[0].ip_address || publicIPs[0].ip || null;
    }
    
    // Берём первый приватный IP
    if (privateIPs.length > 0) {
      ip_address = privateIPs[0].ipaddress || privateIPs[0].ip_address || privateIPs[0].ip || null;
    } else if (publicIPs.length > 0) {
      // Если приватных нет, используем публичный
      ip_address = public_ip;
    }
  }
  
  // Fallback на public_ip/private_ip
  if (!public_ip) {
    public_ip = apiVM.public_ip || null;
  }
  if (!ip_address) {
    ip_address = apiVM.private_ip || public_ip || null;
  }
  
  // Storage volume = disk (это одно и то же)
  const storage_volume = disk;

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

  const normalized = {
    id: apiVM.id,
    slug: apiVM.slug || apiVM.id?.toString() || '',
    name: apiVM.name || apiVM.hostname || apiVM.display_name || 'Unknown',
    hostname: apiVM.hostname || apiVM.name || '',
    status: status,
    cpu: cpu,
    ram: ram,
    disk: disk,
    storage_volume: storage_volume,
    ip_address: ip_address,
    public_ip: public_ip,
    zone: zone,
    template: template,
    project_slug: apiVM.project?.slug || apiVM.project || 'default',
    created_at: apiVM.created_at || new Date().toISOString(),
  };

  console.log('Normalized VM:', normalized);

  return normalized;
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
        console.log('=== Plans API Response ===');
        console.log('Total plans:', data.length);
        console.log('First plan keys:', Object.keys(data[0]));
        console.log('First plan sample:', {
          id: data[0].id,
          slug: data[0].slug,
          name: data[0].name,
          has_attribute: !!data[0].attribute,
          attribute: data[0].attribute,
          monthly_price: data[0].monthly_price,
        });
      }
      
      return data;
    },
    
    listNetworkPlans: async () => {
      const response = await apiRequest<any>('/plans/service/Network');
      const data = response.data?.data || response.data || [];
      
      if (Array.isArray(data) && data.length > 0) {
        console.log('=== Network Plans API Response ===');
        console.log('Total network plans:', data.length);
        console.log('First network plan sample:', {
          id: data[0].id,
          slug: data[0].slug,
          name: data[0].name,
          network_type: data[0].network_type,
        });
      }
      
      return data;
    },
  },

  // Storage Categories
  storageCategories: {
    list: async () => {
      const response = await apiRequest<any>('/storage-categories');
      return response.data?.data || response.data || [];
    },
  },

  // Billing Cycles
  billingCycles: {
    list: async () => {
      const response = await apiRequest<any>('/billing-cycles');
      return response.data?.data || response.data || [];
    },
  },
  
  // Virtual Machines
  virtualMachines: {
    list: async (projectSlug?: string, loadDetails: boolean = false): Promise<VirtualMachine[]> => {
      const params = projectSlug ? `?project_slug=${projectSlug}` : '';
      const response = await apiRequest<any>(`/virtual-machines${params}`);
      const data = response.data?.data || response.data || [];
      
      // Логируем первую ВМ для отладки структуры
      if (Array.isArray(data) && data.length > 0) {
        console.log('=== VM List API Response ===');
        console.log('Total VMs:', data.length);
        console.log('First VM keys:', Object.keys(data[0]));
        console.log('First VM sample:', {
          id: data[0].id,
          slug: data[0].slug,
          name: data[0].name,
          state: data[0].state,
          has_offering: !!data[0].offering,
          offering_keys: data[0].offering ? Object.keys(data[0].offering) : null,
          offering_cpu: data[0].offering?.cpu,
          offering_memory: data[0].offering?.memory,
          offering_storage: data[0].offering?.storage,
        });
      }
      
      let vms = Array.isArray(data) ? data.map(normalizeVM) : [];
      
      // Если нужно загрузить детали каждой ВМ (для получения полной конфигурации)
      if (loadDetails && vms.length > 0) {
        console.log('Loading details for', vms.length, 'VMs...');
        const detailedVMs = await Promise.all(
          vms.map(async (vm) => {
            try {
              const detail = await api.virtualMachines.get(vm.slug);
              return detail;
            } catch (error) {
              console.error('Failed to load details for VM:', vm.slug, error);
              return vm;
            }
          })
        );
        vms = detailedVMs;
      }
      
      return vms;
    },

    get: async (slug: string): Promise<VirtualMachine> => {
      const response = await apiRequest<any>(`/virtual-machines/${slug}`);
      const data = response.data || response;
      
      // Логируем полную структуру для отладки
      console.log('=== VM Detail API Response ===');
      console.log('VM slug:', slug);
      console.log('VM keys:', Object.keys(data));
      console.log('VM offering:', data.offering);
      console.log('VM state:', data.state);
      
      return normalizeVM(data);
    },

    create: async (data: {
      name: string;
      hostname?: string;
      cloud_provider: string;
      region: string;
      project: string;
      template?: string;
      plan?: string;
      service_offering?: string;
      plan_id?: string;
      disk_size?: number;
      network_type?: string;
      public_ip?: boolean | any[];
      billing_cycle?: string;
      storage_category?: string;
      blockstorage_custom_plan?: {
        storage: number;
      };
      [key: string]: any;
    }): Promise<VirtualMachine> => {
      // Добавляем обязательные поля если их нет
      const payload: any = {
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
      
      // Преобразуем public_ip для API
      if (typeof data.public_ip === 'boolean') {
        // API ожидает массив объектов с флагом is_public
        payload.public_ip = data.public_ip ? [{ is_public: true }] : [];
      } else if (Array.isArray(data.public_ip)) {
        // Если уже массив, добавляем is_public к каждому элементу
        payload.public_ip = data.public_ip.map((ip: any) => ({
          ...ip,
          is_public: true
        }));
      }
      
      console.log('Creating VM with payload:', JSON.stringify(payload, null, 2));
      
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
