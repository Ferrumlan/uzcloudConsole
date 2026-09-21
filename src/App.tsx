import React, { useState } from 'react';
import { Box, Flex, VStack, HStack, Text, Heading, Input, Grid, GridItem, Badge, Card } from '@chakra-ui/react';
import { LuCloud, LuServer, LuPlay, LuSquare, LuDollarSign, LuWallet, LuLayoutDashboard, LuSettings, LuLogOut, LuPlus } from 'react-icons/lu';
import { ModernButton } from './components/ModernButton';
import { ModernCard } from './components/ModernCard';

// Mock данные
const mockVMs = [
  { id: 1, name: 'Web Server 01', status: 'running', cpu: 4, ram: 8, ip: '10.0.1.15' },
  { id: 2, name: 'API Server 01', status: 'running', cpu: 8, ram: 16, ip: '10.0.1.22' },
  { id: 3, name: 'Database Server', status: 'stopped', cpu: 16, ram: 32, ip: '10.0.1.30' },
  { id: 4, name: 'Staging Web', status: 'running', cpu: 2, ram: 4, ip: '10.0.2.10' },
];

const statusColors = {
  running: 'success',
  stopped: 'danger',
  starting: 'warning',
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgGradient="linear(to-br, brand.50, accent.50, brand.100)"
        p="24px"
      >
        <Box
          bg="white"
          borderRadius="24px"
          p="48px"
          w="100%"
          maxW="440px"
          boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        >
          <VStack gap="32px" align="stretch">
            <VStack gap="16px">
              <Box
                w="72px"
                h="72px"
                borderRadius="20px"
                bgGradient="linear(to-br, brand.500, accent.600)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontSize="32px"
              >
                <LuCloud />
              </Box>
              <VStack gap="8px">
                <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">
                  UzCloud Console
                </Heading>
                <Text fontSize="16px" color="gray.600" fontWeight="500">
                  Управление облачной инфраструктурой
                </Text>
              </VStack>
            </VStack>

            <form onSubmit={handleLogin}>
              <VStack gap="20px" align="stretch">
                <VStack gap="8px" align="stretch">
                  <Text fontSize="14px" fontWeight="600" color="gray.700">
                    Email
                  </Text>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.uz"
                    size="lg"
                    borderRadius="12px"
                    borderWidth="2px"
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
                    }}
                  />
                </VStack>

                <VStack gap="8px" align="stretch">
                  <Text fontSize="14px" fontWeight="600" color="gray.700">
                    Пароль
                  </Text>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    size="lg"
                    borderRadius="12px"
                    borderWidth="2px"
                    _focus={{
                      borderColor: 'brand.500',
                      boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
                    }}
                  />
                </VStack>

                <ModernButton variant="gradient" size="lg" fullWidth>
                  Войти
                </ModernButton>
              </VStack>
            </form>
          </VStack>
        </Box>
      </Box>
    );
  }

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
      >
        <Box p="24px" borderBottom="1px solid" borderBottomColor="gray.100">
          <HStack gap="12px">
            <Box
              w="40px"
              h="40px"
              borderRadius="12px"
              bgGradient="linear(to-br, brand.500, accent.600)"
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

        <VStack gap="4px" p="16px" flex={1} align="stretch">
          <HStack gap="12px" p="12px" borderRadius="12px" bg="brand.50" color="brand.700">
            <LuLayoutDashboard size={20} />
            <Text fontSize="14px" fontWeight="600">Обзор</Text>
          </HStack>
          <HStack gap="12px" p="12px" borderRadius="12px" color="gray.700" _hover={{ bg: 'gray.50' }}>
            <LuServer size={20} />
            <Text fontSize="14px" fontWeight="500">Виртуальные машины</Text>
          </HStack>
          <HStack gap="12px" p="12px" borderRadius="12px" color="gray.700" _hover={{ bg: 'gray.50' }}>
            <LuSettings size={20} />
            <Text fontSize="14px" fontWeight="500">Настройки</Text>
          </HStack>
        </VStack>

        <Box p="16px" borderTop="1px solid" borderTopColor="gray.100">
          <HStack justify="space-between">
            <VStack gap="0" align="start">
              <Text fontSize="14px" fontWeight="600">admin@uzcloud.uz</Text>
              <Text fontSize="12px" color="gray.500">Production</Text>
            </VStack>
            <ModernButton variant="ghost" size="sm" onClick={() => setIsLoggedIn(false)}>
              <LuLogOut size={16} />
            </ModernButton>
          </HStack>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flex={1} ml="280px" p="32px">
        <VStack gap="32px" align="stretch">
          <VStack gap="8px" align="start">
            <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">
              Обзор
            </Heading>
            <Text fontSize="16px" color="gray.600">
              Добро пожаловать в панель управления
            </Text>
          </VStack>

          {/* Stats Cards */}
          <Grid templateColumns="repeat(4, 1fr)" gap="24px">
            <GridItem>
              <ModernCard hover>
                <HStack gap="16px">
                  <Box
                    p="16px"
                    borderRadius="12px"
                    bgGradient="linear(to-br, blue.400, blue.600)"
                    color="white"
                  >
                    <LuServer size={28} />
                  </Box>
                  <VStack gap="4px" align="start">
                    <Text fontSize="14px" fontWeight="500" color="gray.600">
                      Всего ВМ
                    </Text>
                    <Text fontSize="36px" fontWeight="700" letterSpacing="-0.02em">
                      {mockVMs.length}
                    </Text>
                  </VStack>
                </HStack>
              </ModernCard>
            </GridItem>

            <GridItem>
              <ModernCard hover>
                <HStack gap="16px">
                  <Box
                    p="16px"
                    borderRadius="12px"
                    bgGradient="linear(to-br, green.400, green.600)"
                    color="white"
                  >
                    <LuPlay size={28} />
                  </Box>
                  <VStack gap="4px" align="start">
                    <Text fontSize="14px" fontWeight="500" color="gray.600">
                      Работают
                    </Text>
                    <Text fontSize="36px" fontWeight="700" letterSpacing="-0.02em">
                      {mockVMs.filter(vm => vm.status === 'running').length}
                    </Text>
                  </VStack>
                </HStack>
              </ModernCard>
            </GridItem>

            <GridItem>
              <ModernCard hover>
                <HStack gap="16px">
                  <Box
                    p="16px"
                    borderRadius="12px"
                    bgGradient="linear(to-br, red.400, red.600)"
                    color="white"
                  >
                    <LuSquare size={28} />
                  </Box>
                  <VStack gap="4px" align="start">
                    <Text fontSize="14px" fontWeight="500" color="gray.600">
                      Остановлены
                    </Text>
                    <Text fontSize="36px" fontWeight="700" letterSpacing="-0.02em">
                      {mockVMs.filter(vm => vm.status === 'stopped').length}
                    </Text>
                  </VStack>
                </HStack>
              </ModernCard>
            </GridItem>

            <GridItem>
              <ModernCard hover>
                <HStack gap="16px">
                  <Box
                    p="16px"
                    borderRadius="12px"
                    bgGradient="linear(to-br, purple.400, purple.600)"
                    color="white"
                  >
                    <LuWallet size={28} />
                  </Box>
                  <VStack gap="4px" align="start">
                    <Text fontSize="14px" fontWeight="500" color="gray.600">
                      Баланс
                    </Text>
                    <Text fontSize="24px" fontWeight="700" letterSpacing="-0.02em">
                      1,245,000
                    </Text>
                  </VStack>
                </HStack>
              </ModernCard>
            </GridItem>
          </Grid>

          {/* VM List */}
          <ModernCard title="Виртуальные машины" icon={<LuServer size={24} />}>
            <VStack gap="16px" align="stretch">
              <HStack justify="space-between">
                <Text fontSize="16px" fontWeight="600" color="gray.900">
                  Список виртуальных машин
                </Text>
                <ModernButton variant="gradient" size="md" icon={<LuPlus size={18} />}>
                  Создать ВМ
                </ModernButton>
              </HStack>

              <VStack gap="12px" align="stretch">
                {mockVMs.map((vm) => (
                  <HStack
                    key={vm.id}
                    p="16px"
                    borderRadius="12px"
                    border="1px solid"
                    borderColor="gray.200"
                    _hover={{ bg: 'gray.50', borderColor: 'brand.200' }}
                    transition="all 0.2s"
                  >
                    <Box
                      p="12px"
                      borderRadius="12px"
                      bgGradient="linear(to-br, brand.100, accent.100)"
                      color="brand.600"
                    >
                      <LuServer size={20} />
                    </Box>
                    <VStack gap="2px" align="start" flex={1}>
                      <Text fontSize="15px" fontWeight="600" color="gray.900">
                        {vm.name}
                      </Text>
                      <Text fontSize="13px" color="gray.500">
                        {vm.cpu} vCPU · {vm.ram} GB RAM
                      </Text>
                    </VStack>
                    <Text fontSize="14px" fontFamily="mono" color="gray.600">
                      {vm.ip}
                    </Text>
                    <Badge
                      colorPalette={statusColors[vm.status as keyof typeof statusColors]}
                      variant="subtle"
                      size="lg"
                      borderRadius="8px"
                      px="12px"
                      py="6px"
                      fontWeight="600"
                    >
                      {vm.status === 'running' ? 'Работает' : 'Остановлена'}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </ModernCard>
        </VStack>
      </Box>
    </Flex>
  );
}
