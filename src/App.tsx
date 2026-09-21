import React, { useState } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { VMCreateWizard } from './components/VMCreateWizard';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { VMListPage } from './pages/VMListPage';
import { VMDetailPage } from './pages/VMDetailPage';
import { BillingPage } from './pages/BillingPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import type { VirtualMachine } from './api/types';
import { LuContainer, LuDatabase, LuNetwork, LuHardDrive, LuCamera, LuSettings } from 'react-icons/lu';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentPage, setCurrentPage } = useApp();
  const [selectedVM, setSelectedVM] = useState<VirtualMachine | null>(null);
  const [isCreateVMOpen, setIsCreateVMOpen] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderPage = () => {
    if (selectedVM) {
      return <VMDetailPage vm={selectedVM} onBack={() => setSelectedVM(null)} />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'vms':
        return (
          <VMListPage
            onSelectVM={setSelectedVM}
            onCreateVM={() => setIsCreateVMOpen(true)}
          />
        );
      case 'billing':
        return <BillingPage />;
      case 'kubernetes':
        return (
          <PlaceholderPage
            title="Kubernetes"
            description="Управление Kubernetes-кластерами. Раздел заблокирован до решения вопросов CSI/StorageClass, internal LB и схемы node-pools."
            icon={<LuContainer />}
          />
        );
      case 'objectStorage':
        return (
          <PlaceholderPage
            title="Object Storage"
            description="Управление объектным хранилищем. Раздел заблокирован до работоспособности POST /object-storages на уровне платформы."
            icon={<LuDatabase />}
          />
        );
      case 'networking':
        return (
          <PlaceholderPage
            title="Сети"
            description="Управление сетями, VPC, балансировщиками и виртуальными роутерами. Этап 7 — в разработке."
            icon={<LuNetwork />}
          />
        );
      case 'storage':
        return (
          <PlaceholderPage
            title="Хранилища"
            description="Управление блочными хранилищами. Этап 4 — в разработке."
            icon={<LuHardDrive />}
          />
        );
      case 'snapshots':
        return (
          <PlaceholderPage
            title="Снапшоты"
            description="Снапшоты ВМ, блочных хранилищ, бэкапы, шаблоны и ISO. Этап 6 — в разработке."
            icon={<LuCamera />}
          />
        );
      case 'settings':
        return (
          <PlaceholderPage
            title="Настройки"
            description="Настройки аккаунта, SSH-ключи, API-токены и предпочтения."
            icon={<LuSettings />}
          />
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <Layout>{renderPage()}</Layout>
      <VMCreateWizard
        isOpen={isCreateVMOpen}
        onClose={() => setIsCreateVMOpen(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
