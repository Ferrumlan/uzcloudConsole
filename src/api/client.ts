import type { VirtualMachine, Project, Invoice, AccountBalance, User } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://uzcloud.stackpoc.in/backend/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';

// Mock данные
const mockVMs: VirtualMachine[] = [
  {
    id: 1, slug: 'web-server-01', name: 'Web Server 01', hostname: 'web-01.uzcloud.uz',
    status: 'running', cpu: 4, ram: 8, disk: 100,
    ip_address: '10.0.1.15', zone: 'Tashkent-1', template: 'Ubuntu 22.04 LTS',
    project_slug: 'production', created_at: '2026-03-15T10:30:00Z',
  },
  {
    id: 2, slug: 'api-server-01', name: 'API Server 01', hostname: 'api-01.uzcloud.uz',
    status: 'running', cpu: 8, ram: 16, disk: 200,
    ip_address: '10.0.1.22', zone: 'Tashkent-1', template: 'Ubuntu 22.04 LTS',
    project_slug: 'production', created_at: '2026-04-01T14:20:00Z',
  },
  {
    id: 3, slug: 'db-server-01', name: 'Database Server', hostname: 'db-01.uzcloud.uz',
    status: 'stopped', cpu: 16, ram: 32, disk: 500,
    ip_address: '10.0.1.30', zone: 'Tashkent-1', template: 'CentOS 9',
    project_slug: 'production', created_at: '2026-02-20T08:15:00Z',
  },
  {
    id: 4, slug: 'staging-web', name: 'Staging Web', hostname: 'staging-web.local',
    status: 'stopped', cpu: 2, ram: 4, disk: 50,
    ip_address: '10.0.2.10', zone: 'Tashkent-1', template: 'Ubuntu 22.04 LTS',
    project_slug: 'staging', created_at: '2026-05-10T16:45:00Z',
  },
];

const mockProjects: Project[] = [
  { id: 1, slug: 'production', name: 'Production', description: 'Продакшн окружение', is_default: true },
  { id: 2, slug: 'staging', name: 'Staging', description: 'Тестовое окружение', is_default: false },
  { id: 3, slug: 'development', name: 'Development', description: 'Среда разработки', is_default: false },
];

const mockInvoices: Invoice[] = [
  { id: 1, invoice_number: 'INV-2026-09', date: '2026-09-01', total: 387200, status: 'paid', currency: 'UZS' },
  { id: 2, invoice_number: 'INV-2026-08', date: '2026-08-01', total: 412500, status: 'paid', currency: 'UZS' },
  { id: 3, invoice_number: 'INV-2026-07', date: '2026-07-01', total: 398100, status: 'paid', currency: 'UZS' },
];

function delay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
      if (USE_MOCK) {
        await delay(500);
        if (email && password) {
          return {
            token: 'mock-token-' + Date.now(),
            user: {
              id: 1,
              email: email,
              first_name: 'Admin',
              last_name: 'User',
            },
          };
        }
        throw new Error('Invalid credentials');
      }
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Login failed');
      return response.json();
    },
  },

  projects: {
    list: async (token: string): Promise<Project[]> => {
      if (USE_MOCK) {
        await delay();
        return mockProjects;
      }
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      return data.data;
    },
  },

  virtualMachines: {
    list: async (token: string, projectSlug?: string): Promise<VirtualMachine[]> => {
      if (USE_MOCK) {
        await delay();
        return projectSlug ? mockVMs.filter(vm => vm.project_slug === projectSlug) : mockVMs;
      }
      const url = projectSlug ? `${API_BASE_URL}/virtual-machines?project_slug=${projectSlug}` : `${API_BASE_URL}/virtual-machines`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      return data.data;
    },

    get: async (token: string, slug: string): Promise<VirtualMachine> => {
      if (USE_MOCK) {
        await delay();
        const vm = mockVMs.find(v => v.slug === slug);
        if (!vm) throw new Error('VM not found');
        return vm;
      }
      const response = await fetch(`${API_BASE_URL}/virtual-machines/${slug}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.json();
    },

    start: async (token: string, slug: string): Promise<void> => {
      if (USE_MOCK) { await delay(800); return; }
      await fetch(`${API_BASE_URL}/virtual-machines/${slug}/start`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    },

    stop: async (token: string, slug: string): Promise<void> => {
      if (USE_MOCK) { await delay(800); return; }
      await fetch(`${API_BASE_URL}/virtual-machines/${slug}/stop`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    },

    reboot: async (token: string, slug: string): Promise<void> => {
      if (USE_MOCK) { await delay(800); return; }
      await fetch(`${API_BASE_URL}/virtual-machines/${slug}/reboot`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
    },
  },

  billing: {
    getBalance: async (token: string): Promise<AccountBalance> => {
      if (USE_MOCK) {
        await delay();
        return { balance: 1245000, currency: 'UZS' };
      }
      const response = await fetch(`${API_BASE_URL}/account/balance`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      return response.json();
    },

    getInvoices: async (token: string): Promise<Invoice[]> => {
      if (USE_MOCK) {
        await delay();
        return mockInvoices;
      }
      const response = await fetch(`${API_BASE_URL}/invoices`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      return data.data;
    },
  },
};
