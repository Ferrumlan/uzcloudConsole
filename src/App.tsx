import React, { useState } from 'react';
import { Box, VStack, Text, Spinner } from '@chakra-ui/react';
import { useApp } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { VMCreateWizard } from './components/VMCreateWizard';
import { DashboardPage } from './pages/DashboardPage';
import { VMListPage } from './pages/VMListPage';
import { VMDetailPage } from './pages/VMDetailPage';
import { BillingPage } from './pages/BillingPage';
import type { VirtualMachine } from './api/types';
import { LuCircleAlert } from 'react-icons/lu';

// Проверка переменных окружения
console.log('Environment check:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_API_TOKEN: import.meta.env.VITE_API_TOKEN ? 'SET' : 'NOT SET',
  VITE_USE_MOCK: import.meta.env.VITE_USE_MOCK,
});

const AppContent: React.FC = () => {
  const { isAuthenticated, user, currentPage, isLoading, loadError } = useApp();
  const [selectedVM, setSelectedVM] = useState<VirtualMachine | null>(null);
  const [isCreateVMOpen, setIsCreateVMOpen] = useState(false);

  // Сбрасываем выбранную ВМ при смене страницы
  React.useEffect(() => {
    setSelectedVM(null);
  }, [currentPage]);

  // Экран загрузки
  if (isLoading) {
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

  // Экран ошибки (если токен невалидный или API недоступен)
  if (!isAuthenticated || !user) {
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
              {loadError && (
                <Box bg="#fef2f2" p="12px" borderRadius="8px" w="100%">
                  <Text fontSize="14px" color="#dc2626" fontFamily="mono">
                    {loadError}
                  </Text>
                </Box>
              )}
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
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      {loadError === 'DEMO_MODE' && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bg="orange.500"
          color="white"
          p="8px"
          textAlign="center"
          fontSize="14px"
          fontWeight="600"
          zIndex={9999}
        >
          ⚠️ Демо-режим (API недоступен) — Разверните на VPS для реальных данных
        </Box>
      )}
      <Box pt={loadError === 'DEMO_MODE' ? '40px' : '0'}>
        <Layout>{renderPage()}</Layout>
        <VMCreateWizard
          isOpen={isCreateVMOpen}
          onClose={() => setIsCreateVMOpen(false)}
        />
      </Box>
    </>
  );
};

export default function App() {
  return <AppContent />;
}
