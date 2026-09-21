import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Heading, Input, Badge } from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';
import { api } from '../api/client';
import { ModernCard } from '../components/ModernCard';
import { ModernButton } from '../components/ModernButton';
import type { VirtualMachine } from '../api/types';
import { LuPlus, LuPlay, LuSquare, LuRotateCw, LuServer, LuSearch } from 'react-icons/lu';

interface VMListPageProps {
  onSelectVM: (vm: VirtualMachine) => void;
  onCreateVM: () => void;
}

export const VMListPage: React.FC<VMListPageProps> = ({ onSelectVM, onCreateVM }) => {
  const [vms, setVms] = useState<VirtualMachine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadVMs = async () => {
    setLoading(true);
    try {
      const data = await api.virtualMachines.list();
      setVms(data);
    } catch (err) {
      console.error('Failed to load VMs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVMs();
  }, []);

  const handleVMAction = async (action: string, slug: string) => {
    try {
      switch (action) {
        case 'start': await api.virtualMachines.start(slug); break;
        case 'stop': await api.virtualMachines.stop(slug); break;
        case 'reboot': await api.virtualMachines.reboot(slug); break;
      }
      await loadVMs();
    } catch (err) {
      console.error(`VM action ${action} failed:`, err);
    }
  };

  const filteredVMs = vms.filter((vm) => {
    return vm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           vm.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (vm.ip_address && vm.ip_address.includes(searchQuery));
  });

  const statusColors = {
    running: 'success',
    stopped: 'danger',
    starting: 'warning',
    stopping: 'warning',
    error: 'danger',
  };

  return (
    <Box>
      <VStack gap="32px" align="stretch">
        <HStack justify="space-between" align="center">
          <VStack gap="8px" align="start">
            <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">
              Виртуальные машины
            </Heading>
            <Text fontSize="16px" color="gray.600">
              Управление виртуальными машинами
            </Text>
          </VStack>
          <ModernButton variant="gradient" size="lg" icon={<LuPlus size={18} />} onClick={onCreateVM}>
            Создать ВМ
          </ModernButton>
        </HStack>

        {/* Search */}
        <ModernCard>
          <HStack gap="12px">
            <Box position="relative" flex={1}>
              <Box position="absolute" left="16px" top="50%" transform="translateY(-50%)" color="gray.400">
                <LuSearch size={18} />
              </Box>
              <Input
                placeholder="Поиск по имени, hostname или IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="lg"
                pl="48px"
                borderRadius="12px"
                borderWidth="2px"
                _focus={{
                  borderColor: '#0ea5e9',
                  boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
                }}
              />
            </Box>
          </HStack>
        </ModernCard>

        {/* VM List */}
        <VStack gap="12px" align="stretch">
          {filteredVMs.map((vm) => (
            <ModernCard key={vm.id} hover onClick={() => onSelectVM(vm)}>
              <HStack gap="16px">
                <Box
                  p="12px"
                  borderRadius="12px"
                  bgGradient="linear(to-br, #e0f2fe, #f3e8ff)"
                  color="#0284c7"
                >
                  <LuServer size={24} />
                </Box>
                <VStack gap="2px" align="start" flex={1}>
                  <Text fontSize="16px" fontWeight="600" color="gray.900">
                    {vm.name}
                  </Text>
                  <Text fontSize="13px" color="gray.500" fontFamily="mono">
                    {vm.hostname}
                  </Text>
                </VStack>
                <VStack gap="2px" align="end">
                  <Text fontSize="14px" fontWeight="600" color="gray.700">
                    {vm.cpu} vCPU · {vm.ram} GB
                  </Text>
                  <Text fontSize="13px" fontFamily="mono" color="gray.600">
                    {vm.ip_address || '—'}
                  </Text>
                </VStack>
                <Badge
                  colorPalette={statusColors[vm.status]}
                  variant="subtle"
                  size="lg"
                  borderRadius="8px"
                  px="12px"
                  py="6px"
                  fontWeight="600"
                >
                  {vm.status === 'running' ? 'Работает' : vm.status === 'stopped' ? 'Остановлена' : vm.status}
                </Badge>
                <HStack gap="4px">
                  {vm.status === 'stopped' && (
                    <Box onClick={(e) => e.stopPropagation()}>
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVMAction('start', vm.slug)}
                      >
                        <LuPlay size={16} />
                      </ModernButton>
                    </Box>
                  )}
                  {vm.status === 'running' && (
                    <HStack gap="4px" onClick={(e) => e.stopPropagation()}>
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVMAction('stop', vm.slug)}
                      >
                        <LuSquare size={16} />
                      </ModernButton>
                      <ModernButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVMAction('reboot', vm.slug)}
                      >
                        <LuRotateCw size={16} />
                      </ModernButton>
                    </HStack>
                  )}
                </HStack>
              </HStack>
            </ModernCard>
          ))}
        </VStack>

        {filteredVMs.length === 0 && (
          <ModernCard>
            <VStack gap="16px" py="64px">
              <Box
                p="24px"
                borderRadius="full"
                bgGradient="linear(to-br, #f1f5f9, #e2e8f0)"
                color="gray.400"
              >
                <LuServer size={48} />
              </Box>
              <VStack gap="8px">
                <Text fontSize="18px" fontWeight="600" color="gray.700">
                  Виртуальные машины не найдены
                </Text>
                <Text fontSize="14px" color="gray.500">
                  {searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Создайте первую виртуальную машину'}
                </Text>
              </VStack>
            </VStack>
          </ModernCard>
        )}
      </VStack>
    </Box>
  );
};
