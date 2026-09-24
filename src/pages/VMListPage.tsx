import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Heading, Input, Grid, GridItem, Badge, Button, IconButton, Menu } from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';
import { api } from '../api/client';
import { ModernCard } from '../components/ModernCard';
import type { VirtualMachine } from '../api/types';
import { LuPlus, LuPlay, LuSquare, LuRotateCw, LuServer, LuSearch, LuTerminal, LuHardDrive, LuCamera, LuTrash2, LuEllipsisVertical, LuMaximize2, LuArchive } from 'react-icons/lu';

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
    deploying: 'info',
  };

  // Mock данные для стоимости
  const getMonthlyCost = (vm: VirtualMachine) => {
    const baseCost = vm.cpu * 10 + vm.ram * 5 + vm.disk * 0.5;
    return baseCost;
  };

  const getHourlyCost = (vm: VirtualMachine) => {
    return getMonthlyCost(vm) / 730; // 730 hours in a month
  };

  return (
    <Box>
      <VStack gap="32px" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <VStack gap="8px" align="start">
            <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em" color="var(--text-primary)">
              Virtual Machines
            </Heading>
            <Text fontSize="16px" color="var(--text-secondary)">
              Manage and monitor your virtual machines
            </Text>
          </VStack>
          <Button
            size="lg"
            bg="linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
            color="white"
            borderRadius="10px"
            px="20px"
            fontWeight="600"
            onClick={onCreateVM}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
            }}
          >
            <LuPlus size={18} />
            Create VM
          </Button>
        </HStack>

        {/* Search */}
        <ModernCard>
          <HStack gap="12px">
            <Box position="relative" flex={1}>
              <Box position="absolute" left="16px" top="50%" transform="translateY(-50%)" color="var(--text-tertiary)">
                <LuSearch size={18} />
              </Box>
              <Input
                placeholder="Search by name, hostname, or IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="lg"
                pl="48px"
                borderRadius="10px"
                borderWidth="2px"
                borderColor="var(--border-color)"
                _focus={{
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                }}
              />
            </Box>
          </HStack>
        </ModernCard>

        {/* VM Cards Grid */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="20px">
          {filteredVMs.map((vm) => (
            <GridItem key={vm.id}>
              <ModernCard hover onClick={() => onSelectVM(vm)}>
                <VStack gap="16px" align="stretch">
                  {/* Header */}
                  <HStack justify="space-between" align="start">
                    <HStack gap="12px">
                      <Box
                        p="12px"
                        borderRadius="12px"
                        bg="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                        color="#2563eb"
                      >
                        <LuServer size={24} />
                      </Box>
                      <VStack gap="4px" align="start">
                        <Text fontSize="18px" fontWeight="700" color="var(--text-primary)">
                          {vm.name}
                        </Text>
                        <Text fontSize="13px" color="var(--text-tertiary)" fontFamily="mono">
                          {vm.hostname}
                        </Text>
                      </VStack>
                    </HStack>
                    <Badge
                      colorPalette={statusColors[vm.status]}
                      variant="subtle"
                      size="lg"
                      borderRadius="8px"
                      px="12px"
                      py="6px"
                      fontWeight="600"
                    >
                      {vm.status === 'running' ? 'Running' : vm.status === 'stopped' ? 'Stopped' : vm.status}
                    </Badge>
                  </HStack>

                  {/* Specs */}
                  <Grid templateColumns="repeat(3, 1fr)" gap="12px">
                    <Box p="12px" borderRadius="8px" bg="var(--bg-secondary)">
                      <VStack gap="4px" align="start">
                        <Text fontSize="11px" color="var(--text-tertiary)" fontWeight="600" textTransform="uppercase">
                          CPU
                        </Text>
                        <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
                          {vm.cpu || 0} vCPU
                        </Text>
                      </VStack>
                    </Box>
                    <Box p="12px" borderRadius="8px" bg="var(--bg-secondary)">
                      <VStack gap="4px" align="start">
                        <Text fontSize="11px" color="var(--text-tertiary)" fontWeight="600" textTransform="uppercase">
                          RAM
                        </Text>
                        <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
                          {vm.ram || 0} GB
                        </Text>
                      </VStack>
                    </Box>
                    <Box p="12px" borderRadius="8px" bg="var(--bg-secondary)">
                      <VStack gap="4px" align="start">
                        <Text fontSize="11px" color="var(--text-tertiary)" fontWeight="600" textTransform="uppercase">
                          Storage
                        </Text>
                        <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
                          {vm.disk || 0} GB
                        </Text>
                      </VStack>
                    </Box>
                  </Grid>

                  {/* IPs */}
                  <VStack gap="8px" align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="13px" color="var(--text-tertiary)">Public IP</Text>
                      <Text fontSize="13px" fontWeight="600" color="var(--text-primary)" fontFamily="mono">
                        {vm.ip_address || '—'}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="13px" color="var(--text-tertiary)">Region</Text>
                      <Text fontSize="13px" fontWeight="600" color="var(--text-primary)">
                        {vm.zone}
                      </Text>
                    </HStack>
                  </VStack>

                  {/* Pricing */}
                  <HStack justify="space-between" p="12px" borderRadius="8px" bg="var(--bg-secondary)">
                    <VStack gap="2px" align="start">
                      <Text fontSize="11px" color="var(--text-tertiary)" fontWeight="600">
                        HOURLY
                      </Text>
                      <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
                        ${getHourlyCost(vm).toFixed(4)}
                      </Text>
                    </VStack>
                    <VStack gap="2px" align="end">
                      <Text fontSize="11px" color="var(--text-tertiary)" fontWeight="600">
                        MONTHLY
                      </Text>
                      <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
                        ${getMonthlyCost(vm).toFixed(2)}
                      </Text>
                    </VStack>
                  </HStack>

                  {/* Quick Actions */}
                  <HStack gap="8px" justify="space-between" pt="8px" borderTop="1px solid" borderColor="var(--border-color)">
                    {vm.status === 'stopped' && (
                      <IconButton
                        title="Start"
                        aria-label="Start"
                        size="sm"
                        colorPalette="success"
                        variant="ghost"
                        borderRadius="8px"
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleVMAction('start', vm.slug); }}
                        _hover={{ bg: 'success.50' }}
                      >
                        <LuPlay size={18} />
                      </IconButton>
                    )}
                    {vm.status === 'running' && (
                      <>
                        <IconButton
                          title="Stop"
                          aria-label="Stop"
                          size="sm"
                          colorPalette="danger"
                          variant="ghost"
                          borderRadius="8px"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleVMAction('stop', vm.slug); }}
                          _hover={{ bg: 'danger.50' }}
                        >
                          <LuSquare size={18} />
                        </IconButton>
                        <IconButton
                          title="Restart"
                          aria-label="Restart"
                          size="sm"
                          colorPalette="warning"
                          variant="ghost"
                          borderRadius="8px"
                          onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleVMAction('reboot', vm.slug); }}
                          _hover={{ bg: 'warning.50' }}
                        >
                          <LuRotateCw size={18} />
                        </IconButton>
                      </>
                    )}
                    <IconButton
                      title="Console"
                      aria-label="Console"
                      size="sm"
                      variant="ghost"
                      borderRadius="8px"
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}
                      _hover={{ bg: 'var(--bg-tertiary)' }}
                    >
                      <LuTerminal size={18} />
                    </IconButton>
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <IconButton
                          title="More actions"
                          aria-label="More actions"
                          size="sm"
                          variant="ghost"
                          borderRadius="8px"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                          _hover={{ bg: 'var(--bg-tertiary)' }}
                        >
                          <LuEllipsisVertical size={18} />
                        </IconButton>
                      </Menu.Trigger>
                      <Menu.Positioner>
                        <Menu.Content>
                          <Menu.Item value="resize" onClick={(e: any) => e.stopPropagation()}>
                            <HStack gap="8px">
                              <LuMaximize2 size={16} />
                              <Text>Resize</Text>
                            </HStack>
                          </Menu.Item>
                          <Menu.Item value="snapshot" onClick={(e: any) => e.stopPropagation()}>
                            <HStack gap="8px">
                              <LuCamera size={16} />
                              <Text>Snapshot</Text>
                            </HStack>
                          </Menu.Item>
                          <Menu.Item value="backup" onClick={(e: any) => e.stopPropagation()}>
                            <HStack gap="8px">
                              <LuArchive size={16} />
                              <Text>Backup</Text>
                            </HStack>
                          </Menu.Item>
                          <Menu.Separator />
                          <Menu.Item value="delete" color="red.600" onClick={(e: any) => e.stopPropagation()}>
                            <HStack gap="8px">
                              <LuTrash2 size={16} />
                              <Text>Delete</Text>
                            </HStack>
                          </Menu.Item>
                        </Menu.Content>
                      </Menu.Positioner>
                    </Menu.Root>
                  </HStack>
                </VStack>
              </ModernCard>
            </GridItem>
          ))}
        </Grid>

        {filteredVMs.length === 0 && (
          <ModernCard>
            <VStack gap="16px" py="64px">
              <Box
                p="24px"
                borderRadius="full"
                bg="var(--bg-tertiary)"
                color="var(--text-tertiary)"
              >
                <LuServer size={48} />
              </Box>
              <VStack gap="8px">
                <Text fontSize="18px" fontWeight="600" color="var(--text-primary)">
                  No virtual machines found
                </Text>
                <Text fontSize="14px" color="var(--text-secondary)">
                  {searchQuery ? 'Try adjusting your search' : 'Create your first virtual machine to get started'}
                </Text>
              </VStack>
            </VStack>
          </ModernCard>
        )}
      </VStack>
    </Box>
  );
};
