import React, { useState } from 'react';
import { Box, VStack, Text, Spinner } from '@chakra-ui/react';
import { useApp } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { VMCreateWizard } from './components/VMCreateWizard';
import { DashboardPage } from './pages/DashboardPage';
import { VMListPage } from './pages/VMListPage';
import { VMDetailPage } from './pages/VMDetailPage';
import { BillingPage } from './pages/BillingPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import type { VirtualMachine } from './api/types';
import { 
  LuContainer, LuDatabase, LuNetwork, LuHardDrive, LuCamera, LuSettings,
  LuImage, LuGlobe, LuShield, LuKey, LuActivity, LuShoppingBag, LuLifeBuoy,
  LuCircleAlert
} from 'react-icons/lu';

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
        bg="var(--bg-secondary)"
      >
        <VStack gap="16px">
          <Spinner size="xl" color="brand.500" borderWidth="3px" />
          <Text fontSize="16px" color="var(--text-secondary)" fontWeight="500">
            Loading...
          </Text>
        </VStack>
      </Box>
    );
  }

  // Экран ошибки (если токен невалидный)
  if (!isAuthenticated || !user) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="var(--bg-secondary)"
        p="24px"
      >
        <Box
          bg="var(--card-bg)"
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
              <Text fontSize="24px" fontWeight="700" color="var(--text-primary)">
                Authentication Error
              </Text>
              <Text fontSize="16px" color="var(--text-secondary)" textAlign="center">
                Unable to connect to API. Please check your authorization token in .env file
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
      case 'kubernetes':
        return (
          <PlaceholderPage
            title="Kubernetes"
            description="Manage Kubernetes clusters with auto-scaling, monitoring, and one-click deployments."
            icon={<LuContainer />}
          />
        );
      case 'images':
        return (
          <PlaceholderPage
            title="Images"
            description="Manage custom images, snapshots, and templates for your virtual machines."
            icon={<LuImage />}
          />
        );
      case 'volumes':
        return (
          <PlaceholderPage
            title="Volumes"
            description="Attach additional block storage volumes to your virtual machines."
            icon={<LuHardDrive />}
          />
        );
      case 'snapshots':
        return (
          <PlaceholderPage
            title="Snapshots"
            description="Create and manage snapshots of your virtual machines and volumes."
            icon={<LuCamera />}
          />
        );
      case 'networks':
        return (
          <PlaceholderPage
            title="Networks"
            description="Configure virtual networks, VPCs, and network isolation for your resources."
            icon={<LuNetwork />}
          />
        );
      case 'floating-ips':
        return (
          <PlaceholderPage
            title="Floating IPs"
            description="Manage floating IP addresses that can be assigned to your virtual machines."
            icon={<LuGlobe />}
          />
        );
      case 'firewalls':
        return (
          <PlaceholderPage
            title="Firewalls"
            description="Configure firewall rules and security groups to protect your resources."
            icon={<LuShield />}
          />
        );
      case 'ssh-keys':
        return (
          <PlaceholderPage
            title="SSH Keys"
            description="Manage SSH keys for secure access to your virtual machines."
            icon={<LuKey />}
          />
        );
      case 'object-storage':
        return (
          <PlaceholderPage
            title="Object Storage"
            description="S3-compatible object storage for backups, media, and static assets."
            icon={<LuDatabase />}
          />
        );
      case 'load-balancers':
        return (
          <PlaceholderPage
            title="Load Balancers"
            description="Distribute traffic across multiple virtual machines for high availability."
            icon={<LuActivity />}
          />
        );
      case 'dns':
        return (
          <PlaceholderPage
            title="DNS"
            description="Manage DNS records and domain names for your services."
            icon={<LuGlobe />}
          />
        );
      case 'monitoring':
        return (
          <PlaceholderPage
            title="Monitoring"
            description="Monitor metrics, set up alerts, and track performance of your resources."
            icon={<LuActivity />}
          />
        );
      case 'marketplace':
        return (
          <PlaceholderPage
            title="Marketplace"
            description="Deploy pre-configured applications and solutions with one click."
            icon={<LuShoppingBag />}
          />
        );
      case 'support':
        return (
          <PlaceholderPage
            title="Support"
            description="Get help, access documentation, and contact our support team."
            icon={<LuLifeBuoy />}
          />
        );
      case 'settings':
        return (
          <PlaceholderPage
            title="Settings"
            description="Configure your account, API keys, billing settings, and preferences."
            icon={<LuSettings />}
          />
        );
      default:
        return <DashboardPage />;
    }
  };

  return (
    <>
      <Layout>
        {renderPage()}
      </Layout>
      <VMCreateWizard
        isOpen={isCreateVMOpen}
        onClose={() => setIsCreateVMOpen(false)}
      />
    </>
  );
};

export default function App() {
  return <AppContent />;
}
