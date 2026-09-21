import React, { useState } from 'react';
import { Box, VStack, Text, Spinner } from '@chakra-ui/react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { VMCreateWizard } from './components/VMCreateWizard';
import { DashboardPage } from './pages/DashboardPage';
import { VMListPage } from './pages/VMListPage';
import { VMDetailPage } from './pages/VMDetailPage';
import { BillingPage } from './pages/BillingPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import type { VirtualMachine } from './api/types';
import { LuContainer, LuDatabase, LuNetwork, LuHardDrive, LuCamera, LuSettings, LuCircleAlert } from 'react-icons/lu';

// Проверка переменных окружения
console.log('Environment check:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_TOKEN: import.meta.env.VITE_API_TOKEN ? 'SET' : 'NOT SET',
  VITE_USE_MOCK: import.meta.env.VITE_USE_MOCK,
});

const AppContent: React.FC = () => {
  const { isAuthenticated, user, currentPage } = useApp();
  const [selectedVM, setSelectedVM] = useState<VirtualMachine | null>(null);
  const [isCreateVMOpen, setIsCreateVMOpen] = useState(false);

  // Экран загрузки
  if (!user) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#f8fafc"
      >
        <VStack gap="16px">
          <Spinner size="xl" color="brand.500" borderWidth="3px" />
          <Text fontSize="16px" color="gray.600" fontWeight="500">
            Загрузка...
          </Text>
        </VStack>
      </Box>
    );
  }

  // Экран ошибки (если токен невалидный)
  if (!isAuthenticated) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="#f8fafc"
        p="24px"
      >
        <Box
          bg="white"
          borderRadius="24px"
          p="48px"
          maxW="500px"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        >
          <VStack gap="24px" align="center">
            <Box
              w="72px"
              h="72px"
              borderRadius="20px"
              bg="#fef2f2"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="#ef4444"
            >
              <LuCircleAlert size={40} />
            </Box>
            <VStack gap="12px">
              <Text fontSize="24px" fontWeight="700" color="gray.900">
                Ошибка авторизации
              </Text>
              <Text fontSize="16px" color="gray.600" textAlign="center">
                Не удалось подключиться к API. Проверьте токен авторизации в файле .env
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Box>
    );
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
