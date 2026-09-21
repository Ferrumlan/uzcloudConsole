import React from 'react';
import { Box, Flex, VStack, HStack, Text, Badge, Separator } from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';
import { ModernButton } from './ModernButton';
import { 
  LuLayoutDashboard, LuServer, LuNetwork, LuHardDrive, LuCamera, 
  LuCreditCard, LuContainer, LuDatabase, LuSettings, LuLogOut, 
  LuGlobe, LuCloud, LuChevronRight
} from 'react-icons/lu';

type Page = 'dashboard' | 'vms' | 'networking' | 'storage' | 'snapshots' | 'billing' | 'kubernetes' | 'objectStorage' | 'settings';

const navItems: Array<{ id: Page; icon: any; label: string; badge?: string }> = [
  { id: 'dashboard', icon: LuLayoutDashboard, label: 'Обзор' },
  { id: 'vms', icon: LuServer, label: 'Виртуальные машины' },
  { id: 'networking', icon: LuNetwork, label: 'Сети' },
  { id: 'storage', icon: LuHardDrive, label: 'Хранилища' },
  { id: 'snapshots', icon: LuCamera, label: 'Снапшоты' },
  { id: 'billing', icon: LuCreditCard, label: 'Финансы' },
  { id: 'kubernetes', icon: LuContainer, label: 'Kubernetes', badge: 'скоро' },
  { id: 'objectStorage', icon: LuDatabase, label: 'Object Storage', badge: 'скоро' },
  { id: 'settings', icon: LuSettings, label: 'Настройки' },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, language, setLanguage, projects, selectedProject, setSelectedProject, currentPage, setCurrentPage } = useApp();

  return (
    <Flex minH="100vh" bg="#f8fafc">
      {/* Sidebar */}
      <Box
        w="280px"
        bg="white"
        borderRight="1px solid"
        borderRightColor="gray.200"
        display="flex"
        flexDirection="column"
        position="fixed"
        h="100vh"
        overflowY="auto"
      >
        {/* Logo */}
        <Box p="24px" borderBottom="1px solid" borderBottomColor="gray.100">
          <HStack gap="12px">
            <Box
              w="40px"
              h="40px"
              borderRadius="12px"
              bgGradient="linear(to-br, #0ea5e9, #a855f7)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontSize="20px"
            >
              <LuCloud />
            </Box>
            <VStack gap="0" align="start">
              <Text fontSize="18px" fontWeight="700" letterSpacing="-0.02em">
                UzCloud
              </Text>
              <Text fontSize="12px" color="gray.500" fontWeight="500">
                Console
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Project Selector */}
        <Box p="16px" borderBottom="1px solid" borderBottomColor="gray.100">
          <Text fontSize="12px" fontWeight="600" color="gray.500" mb="12px" textTransform="uppercase" letterSpacing="0.05em">
            Проект
          </Text>
          <VStack gap="4px" align="stretch">
            {projects.map((project) => (
              <Box
                key={project.slug}
                p="10px 12px"
                borderRadius="10px"
                bg={selectedProject === project.slug ? 'brand.50' : 'transparent'}
                color={selectedProject === project.slug ? 'brand.700' : 'gray.700'}
                cursor="pointer"
                onClick={() => setSelectedProject(project.slug)}
                _hover={{ bg: selectedProject === project.slug ? 'brand.100' : 'gray.50' }}
                transition="all 0.2s"
              >
                <HStack justify="space-between">
                  <Text fontSize="14px" fontWeight={selectedProject === project.slug ? '600' : '500'}>
                    {project.name}
                  </Text>
                  {project.is_default && (
                    <Badge size="sm" colorPalette="gray" variant="subtle" borderRadius="6px">
                      default
                    </Badge>
                  )}
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Navigation */}
        <VStack gap="4px" p="16px" flex={1} align="stretch">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isBlocked = item.badge === 'скоро';
            
            return (
              <Box
                key={item.id}
                p="12px"
                borderRadius="12px"
                bg={isActive ? 'brand.50' : 'transparent'}
                color={isActive ? 'brand.700' : 'gray.700'}
                cursor={isBlocked ? 'not-allowed' : 'pointer'}
                opacity={isBlocked ? 0.5 : 1}
                onClick={() => !isBlocked && setCurrentPage(item.id)}
                _hover={{
                  bg: isActive ? 'brand.100' : 'gray.50',
                }}
                transition="all 0.2s"
              >
                <HStack gap="12px">
                  <Icon size={20} />
                  <Text fontSize="14px" fontWeight={isActive ? '600' : '500'} flex={1}>
                    {item.label}
                  </Text>
                  {item.badge && (
                    <Badge size="sm" colorPalette="orange" variant="subtle" borderRadius="6px">
                      {item.badge}
                    </Badge>
                  )}
                </HStack>
              </Box>
            );
          })}
        </VStack>

        {/* Footer */}
        <Box p="16px" borderTop="1px solid" borderTopColor="gray.100">
          <VStack gap="16px" align="stretch">
            {/* Language Selector */}
            <HStack justify="space-between">
              <HStack gap="8px" color="gray.500">
                <LuGlobe size={16} />
                <Text fontSize="12px" fontWeight="500">Язык</Text>
              </HStack>
              <HStack gap="4px">
                {(['ru', 'uz', 'en'] as const).map((lang) => (
                  <Box
                    key={lang}
                    px="8px"
                    py="4px"
                    borderRadius="6px"
                    bg={language === lang ? 'brand.500' : 'transparent'}
                    color={language === lang ? 'white' : 'gray.600'}
                    fontSize="12px"
                    fontWeight="600"
                    cursor="pointer"
                    onClick={() => setLanguage(lang)}
                    _hover={{ bg: language === lang ? 'brand.600' : 'gray.100' }}
                    transition="all 0.2s"
                  >
                    {lang.toUpperCase()}
                  </Box>
                ))}
              </HStack>
            </HStack>

            <Separator />

            {/* User Info */}
            <HStack justify="space-between">
              <VStack gap="0" align="start">
                <Text fontSize="14px" fontWeight="600">
                  {user?.email || 'admin@uzcloud.uz'}
                </Text>
                <Text fontSize="12px" color="gray.500">
                  {projects.find(p => p.slug === selectedProject)?.name || 'Production'}
                </Text>
              </VStack>
              <ModernButton variant="ghost" size="sm" onClick={logout}>
                <LuLogOut size={16} />
              </ModernButton>
            </HStack>
          </VStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex={1} ml="280px">
        {/* Top Bar */}
        <Box
          bg="white"
          borderBottom="1px solid"
          borderBottomColor="gray.200"
          px="32px"
          py="16px"
          position="sticky"
          top={0}
          zIndex={10}
        >
          <HStack justify="space-between">
            <HStack gap="8px">
              <Text fontSize="14px" color="gray.500" fontWeight="500">
                {projects.find(p => p.slug === selectedProject)?.name || 'Production'}
              </Text>
              <Text fontSize="14px" color="gray.300">/</Text>
              <Text fontSize="14px" fontWeight="600" color="gray.900">
                {navItems.find(item => item.id === currentPage)?.label || 'Обзор'}
              </Text>
            </HStack>
            <HStack gap="12px">
              <Badge colorPalette="success" variant="subtle" borderRadius="8px" px="12px" py="6px" fontSize="12px" fontWeight="600">
                API: nimbo
              </Badge>
            </HStack>
          </HStack>
        </Box>

        {/* Page Content */}
        <Box p="32px">
          {children}
        </Box>
      </Box>
    </Flex>
  );
};
