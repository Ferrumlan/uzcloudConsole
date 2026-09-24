import React, { useState } from 'react';
import { Box, Flex, VStack, HStack, Text, Input, Badge, Avatar, Button } from '@chakra-ui/react';
import { 
  LuLayoutDashboard, LuServer, LuContainer, LuImage, LuHardDrive, LuCamera,
  LuNetwork, LuGlobe, LuShield, LuKey, LuDatabase, LuActivity, LuShoppingBag,
  LuCreditCard, LuLifeBuoy, LuSettings, LuSearch, LuBell, LuPlus, LuMoon, LuSun,
  LuChevronDown, LuMenu
} from 'react-icons/lu';
import { useApp } from '../contexts/AppContext';

export type Page = 'dashboard' | 'vms' | 'kubernetes' | 'images' | 'volumes' | 'snapshots' | 
            'networks' | 'floating-ips' | 'firewalls' | 'ssh-keys' | 'object-storage' |
            'load-balancers' | 'dns' | 'monitoring' | 'marketplace' | 'billing' | 
            'support' | 'settings';

interface NavItem {
  id: Page;
  icon: any;
  label: string;
  labelUz?: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', icon: LuLayoutDashboard, label: 'Dashboard', labelUz: 'Boshqaruv paneli' },
  { id: 'vms', icon: LuServer, label: 'Virtual Machines', labelUz: 'Virtual mashinalar' },
  { id: 'kubernetes', icon: LuContainer, label: 'Kubernetes', badge: 'Скоро' },
  { id: 'images', icon: LuImage, label: 'Images', labelUz: 'Rasmlar' },
  { id: 'volumes', icon: LuHardDrive, label: 'Volumes', labelUz: 'Hajmlar' },
  { id: 'snapshots', icon: LuCamera, label: 'Snapshots', labelUz: 'Snapshotlar' },
  { id: 'networks', icon: LuNetwork, label: 'Networks', labelUz: 'Tarmoqlar' },
  { id: 'floating-ips', icon: LuGlobe, label: 'Floating IPs', labelUz: 'Suzuvchi IP' },
  { id: 'firewalls', icon: LuShield, label: 'Firewalls', labelUz: 'Xavfsizlik devorlari' },
  { id: 'ssh-keys', icon: LuKey, label: 'SSH Keys', labelUz: 'SSH kalitlari' },
  { id: 'object-storage', icon: LuDatabase, label: 'Object Storage', labelUz: 'Ob\'ektli saqlash' },
  { id: 'load-balancers', icon: LuActivity, label: 'Load Balancers', labelUz: 'Yuk balanseri' },
  { id: 'dns', icon: LuGlobe, label: 'DNS', labelUz: 'DNS' },
  { id: 'monitoring', icon: LuActivity, label: 'Monitoring', labelUz: 'Monitoring' },
  { id: 'marketplace', icon: LuShoppingBag, label: 'Marketplace', labelUz: 'Bozor' },
  { id: 'billing', icon: LuCreditCard, label: 'Billing', labelUz: 'To\'lovlar' },
  { id: 'support', icon: LuLifeBuoy, label: 'Support', labelUz: 'Qo\'llab-quvvatlash' },
  { id: 'settings', icon: LuSettings, label: 'Settings', labelUz: 'Sozlamalar' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, language, setLanguage, currentPage, setCurrentPage } = useApp();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  const userName = user?.first_name || user?.email?.split('@')[0] || 'User';

  return (
    <Flex minH="100vh" bg="var(--bg-secondary)">
      {/* Sidebar */}
      <Box
        w="260px"
        bg="var(--card-bg)"
        borderRight="1px solid"
        borderRightColor="var(--border-color)"
        display="flex"
        flexDirection="column"
        position="fixed"
        h="100vh"
        overflowY="auto"
        zIndex={100}
      >
        {/* Logo */}
        <Box p="20px" borderBottom="1px solid" borderBottomColor="var(--border-color)">
          <HStack gap="12px">
            <Box
              w="36px"
              h="36px"
              borderRadius="10px"
              bg="linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontSize="18px"
              fontWeight="700"
            >
              ☁️
            </Box>
            <VStack gap="0" align="start">
              <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
                UzCloud
              </Text>
              <Text fontSize="11px" color="var(--text-tertiary)" fontWeight="500">
                Cloud Platform
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Navigation */}
        <VStack gap="2px" p="12px" flex={1} align="stretch">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const label = language === 'uz' ? item.labelUz || item.label : item.label;
            
            return (
              <Box
                key={item.id}
                p="10px 12px"
                borderRadius="8px"
                bg={isActive ? 'var(--bg-tertiary)' : 'transparent'}
                color={isActive ? 'var(--text-primary)' : 'var(--text-secondary)'}
                cursor="pointer"
                onClick={() => setCurrentPage(item.id)}
                transition="all 0.15s"
                _hover={{
                  bg: isActive ? 'var(--bg-tertiary)' : 'var(--bg-secondary)',
                }}
              >
                <HStack gap="10px">
                  <Icon size={18} />
                  <Text fontSize="14px" fontWeight={isActive ? '600' : '500'} flex={1}>
                    {label}
                  </Text>
                  {item.badge && (
                    <Badge 
                      size="sm" 
                      colorPalette="orange" 
                      variant="subtle"
                      borderRadius="6px"
                      px="6px"
                      py="2px"
                      fontSize="10px"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </HStack>
              </Box>
            );
          })}
        </VStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} ml="260px">
        {/* Top Bar */}
        <Box
          bg="var(--card-bg)"
          borderBottom="1px solid"
          borderBottomColor="var(--border-color)"
          px="24px"
          py="12px"
          position="sticky"
          top={0}
          zIndex={50}
        >
          <HStack justify="space-between">
            {/* Search */}
            <Box flex={1} maxW="500px">
              <HStack 
                gap="8px"
                bg="var(--bg-secondary)"
                borderRadius="8px"
                px="12px"
                py="8px"
                border="1px solid"
                borderColor="var(--border-color)"
              >
                <LuSearch size={16} color="var(--text-tertiary)" />
                <Input
                  placeholder="Search resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fontSize="14px"
                  border="none"
                  bg="transparent"
                  _placeholder={{ color: 'var(--text-tertiary)' }}
                  _focus={{ boxShadow: 'none', border: 'none' }}
                />
                <Text fontSize="12px" color="var(--text-tertiary)" fontWeight="500">
                  ⌘K
                </Text>
              </HStack>
            </Box>

            {/* Right Actions */}
            <HStack gap="12px">
              {/* Quick Create */}
              <Button
                size="sm"
                bg="linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                color="white"
                borderRadius="8px"
                px="16px"
                fontWeight="600"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                }}
              >
                <LuPlus size={16} />
                <Text fontSize="14px">Create</Text>
              </Button>

              {/* Theme Toggle */}
              <Box
                p="8px"
                borderRadius="8px"
                bg="var(--bg-secondary)"
                cursor="pointer"
                onClick={toggleTheme}
                _hover={{ bg: 'var(--bg-tertiary)' }}
              >
                {isDarkMode ? <LuSun size={18} color="var(--text-secondary)" /> : <LuMoon size={18} color="var(--text-secondary)" />}
              </Box>

              {/* Notifications */}
              <Box
                p="8px"
                borderRadius="8px"
                bg="var(--bg-secondary)"
                cursor="pointer"
                position="relative"
                onClick={() => setShowNotifications(!showNotifications)}
                _hover={{ bg: 'var(--bg-tertiary)' }}
              >
                <LuBell size={18} color="var(--text-secondary)" />
                <Box
                  position="absolute"
                  top="4px"
                  right="4px"
                  w="8px"
                  h="8px"
                  borderRadius="full"
                  bg="red.500"
                />
              </Box>

              {/* Language Switcher */}
              <HStack 
                gap="4px"
                p="6px 10px"
                borderRadius="8px"
                bg="var(--bg-secondary)"
                cursor="pointer"
                _hover={{ bg: 'var(--bg-tertiary)' }}
              >
                <Text fontSize="13px" fontWeight="600" color="var(--text-secondary)">
                  {language.toUpperCase()}
                </Text>
                <LuChevronDown size={14} color="var(--text-tertiary)" />
              </HStack>

              {/* Balance */}
              <Box
                p="8px 12px"
                borderRadius="8px"
                bg="var(--bg-secondary)"
              >
                <VStack gap="0" align="end">
                  <Text fontSize="11px" color="var(--text-tertiary)" fontWeight="500">
                    Balance
                  </Text>
                  <Text fontSize="14px" fontWeight="700" color="var(--text-primary)">
                    $1,245.00
                  </Text>
                </VStack>
              </Box>

              {/* User Profile */}
              <HStack 
                gap="8px"
                p="6px 10px"
                borderRadius="8px"
                bg="var(--bg-secondary)"
                cursor="pointer"
                _hover={{ bg: 'var(--bg-tertiary)' }}
              >
                <Avatar.Root size="sm">
                  <Avatar.Fallback name={userName} />
                </Avatar.Root>
                <VStack gap="0" align="start">
                  <Text fontSize="13px" fontWeight="600" color="var(--text-primary)">
                    {userName}
                  </Text>
                  <Text fontSize="11px" color="var(--text-tertiary)">
                    Production
                  </Text>
                </VStack>
              </HStack>
            </HStack>
          </HStack>
        </Box>

        {/* Page Content */}
        <Box p="24px">
          {children}
        </Box>
      </Box>
    </Flex>
  );
};
