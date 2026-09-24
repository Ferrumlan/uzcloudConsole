import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Heading, Grid, GridItem, Badge } from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';
import { api } from '../api/client';
import { ModernCard } from '../components/ModernCard';
import type { VirtualMachine, AccountBalance, Invoice } from '../api/types';
import { LuServer, LuCpu, LuMemoryStick, LuHardDrive, LuActivity, LuDollarSign, LuTrendingUp } from 'react-icons/lu';

export const DashboardPage: React.FC = () => {
  const [vms, setVms] = useState<VirtualMachine[]>([]);
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [vmsData, balanceData, invoicesData] = await Promise.all([
          api.virtualMachines.list(),
          api.billing.getBalance(),
          api.billing.getInvoices(),
        ]);
        setVms(vmsData);
        setBalance(balanceData);
        setInvoices(invoicesData);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const runningVMs = vms.filter(vm => vm.status === 'running');
  const stoppedVMs = vms.filter(vm => vm.status === 'stopped');
  
  // Mock данные для графиков
  const cpuUsage = 45;
  const ramUsage = 62;
  const storageUsage = 38;
  const networkTraffic = 125; // GB
  const monthlyCost = 387.50;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box>
      <VStack gap="32px" align="stretch">
        {/* Header */}
        <VStack gap="8px" align="start">
          <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em" color="var(--text-primary)">
            Dashboard
          </Heading>
          <Text fontSize="16px" color="var(--text-secondary)">
            Overview of your cloud infrastructure
          </Text>
        </VStack>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap="20px">
          <GridItem>
            <ModernCard hover>
              <HStack gap="16px">
                <Box
                  p="14px"
                  borderRadius="12px"
                  bg="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                  color="white"
                >
                  <LuServer size={24} />
                </Box>
                <VStack gap="4px" align="start" flex={1}>
                  <Text fontSize="13px" fontWeight="500" color="var(--text-secondary)">
                    Running VMs
                  </Text>
                  <Text fontSize="32px" fontWeight="700" letterSpacing="-0.02em" color="var(--text-primary)">
                    {runningVMs.length}
                  </Text>
                  <Text fontSize="12px" color="var(--text-tertiary)">
                    of {vms.length} total
                  </Text>
                </VStack>
              </HStack>
            </ModernCard>
          </GridItem>

          <GridItem>
            <ModernCard hover>
              <HStack gap="16px">
                <Box
                  p="14px"
                  borderRadius="12px"
                  bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  color="white"
                >
                  <LuCpu size={24} />
                </Box>
                <VStack gap="4px" align="start" flex={1}>
                  <Text fontSize="13px" fontWeight="500" color="var(--text-secondary)">
                    CPU Usage
                  </Text>
                  <Text fontSize="32px" fontWeight="700" letterSpacing="-0.02em" color="var(--text-primary)">
                    {cpuUsage}%
                  </Text>
                  <Box w="100%" h="4px" bg="var(--bg-tertiary)" borderRadius="full" overflow="hidden">
                    <Box w={`${cpuUsage}%`} h="100%" bg="linear-gradient(90deg, #10b981 0%, #059669 100%)" />
                  </Box>
                </VStack>
              </HStack>
            </ModernCard>
          </GridItem>

          <GridItem>
            <ModernCard hover>
              <HStack gap="16px">
                <Box
                  p="14px"
                  borderRadius="12px"
                  bg="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                  color="white"
                >
                  <LuMemoryStick size={24} />
                </Box>
                <VStack gap="4px" align="start" flex={1}>
                  <Text fontSize="13px" fontWeight="500" color="var(--text-secondary)">
                    RAM Usage
                  </Text>
                  <Text fontSize="32px" fontWeight="700" letterSpacing="-0.02em" color="var(--text-primary)">
                    {ramUsage}%
                  </Text>
                  <Box w="100%" h="4px" bg="var(--bg-tertiary)" borderRadius="full" overflow="hidden">
                    <Box w={`${ramUsage}%`} h="100%" bg="linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)" />
                  </Box>
                </VStack>
              </HStack>
            </ModernCard>
          </GridItem>

          <GridItem>
            <ModernCard hover>
              <HStack gap="16px">
                <Box
                  p="14px"
                  borderRadius="12px"
                  bg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  color="white"
                >
                  <LuDollarSign size={24} />
                </Box>
                <VStack gap="4px" align="start" flex={1}>
                  <Text fontSize="13px" fontWeight="500" color="var(--text-secondary)">
                    Monthly Cost
                  </Text>
                  <Text fontSize="32px" fontWeight="700" letterSpacing="-0.02em" color="var(--text-primary)">
                    {formatCurrency(monthlyCost)}
                  </Text>
                  <HStack gap="4px">
                    <LuTrendingUp size={12} color="#10b981" />
                    <Text fontSize="12px" color="#10b981" fontWeight="600">
                      +12%
                    </Text>
                  </HStack>
                </VStack>
              </HStack>
            </ModernCard>
          </GridItem>
        </Grid>

        {/* Resource Usage */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap="20px">
          <GridItem>
            <ModernCard title="Resource Usage" icon={<LuActivity size={20} />}>
              <VStack gap="20px" align="stretch">
                <VStack gap="8px" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                      Storage Usage
                    </Text>
                    <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                      {storageUsage}%
                    </Text>
                  </HStack>
                  <Box w="100%" h="8px" bg="var(--bg-tertiary)" borderRadius="full" overflow="hidden">
                    <Box 
                      w={`${storageUsage}%`} 
                      h="100%" 
                      bg="linear-gradient(90deg, #f59e0b 0%, #d97706 100%)"
                      borderRadius="full"
                    />
                  </Box>
                  <Text fontSize="12px" color="var(--text-tertiary)">
                    380 GB of 1 TB used
                  </Text>
                </VStack>

                <VStack gap="8px" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                      Network Traffic
                    </Text>
                    <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                      {networkTraffic} GB
                    </Text>
                  </HStack>
                  <Box w="100%" h="8px" bg="var(--bg-tertiary)" borderRadius="full" overflow="hidden">
                    <Box 
                      w="62%" 
                      h="100%" 
                      bg="linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)"
                      borderRadius="full"
                    />
                  </Box>
                  <Text fontSize="12px" color="var(--text-tertiary)">
                    62% of monthly limit
                  </Text>
                </VStack>
              </VStack>
            </ModernCard>
          </GridItem>

          <GridItem>
            <ModernCard title="Recent Activity" icon={<LuActivity size={20} />}>
              <VStack gap="12px" align="stretch">
                {vms.slice(0, 5).map((vm) => (
                  <HStack 
                    key={vm.id}
                    p="12px"
                    borderRadius="8px"
                    bg="var(--bg-secondary)"
                    _hover={{ bg: 'var(--bg-tertiary)' }}
                    transition="all 0.2s"
                  >
                    <Box
                      p="8px"
                      borderRadius="8px"
                      bg={vm.status === 'running' ? '#dcfce7' : '#fee2e2'}
                      color={vm.status === 'running' ? '#16a34a' : '#dc2626'}
                    >
                      <LuServer size={16} />
                    </Box>
                    <VStack gap="2px" align="start" flex={1}>
                      <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                        {vm.name}
                      </Text>
                      <Text fontSize="12px" color="var(--text-tertiary)">
                        {vm.status === 'running' ? 'Started' : 'Stopped'} 2 hours ago
                      </Text>
                    </VStack>
                    <Badge
                      colorPalette={vm.status === 'running' ? 'success' : 'danger'}
                      variant="subtle"
                      size="sm"
                      borderRadius="6px"
                      px="8px"
                      py="4px"
                      fontWeight="600"
                    >
                      {vm.status === 'running' ? 'Running' : 'Stopped'}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </ModernCard>
          </GridItem>
        </Grid>

        {/* VMs Overview */}
        <ModernCard title="Virtual Machines" icon={<LuServer size={20} />}>
          <VStack gap="12px" align="stretch">
            {vms.slice(0, 6).map((vm) => (
              <HStack
                key={vm.id}
                p="16px"
                borderRadius="12px"
                border="1px solid"
                borderColor="var(--border-color)"
                _hover={{ 
                  borderColor: 'var(--brand-500)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <Box
                  p="10px"
                  borderRadius="10px"
                  bg="linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)"
                  color="#2563eb"
                >
                  <LuServer size={20} />
                </Box>
                <VStack gap="2px" align="start" flex={1}>
                  <Text fontSize="15px" fontWeight="600" color="var(--text-primary)">
                    {vm.name}
                  </Text>
                  <Text fontSize="13px" color="var(--text-tertiary)">
                    {vm.cpu} vCPU · {vm.ram} GB RAM · {vm.disk} GB Disk
                  </Text>
                </VStack>
                <VStack gap="2px" align="end">
                  <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                    {vm.ip_address || '—'}
                  </Text>
                  <Text fontSize="12px" color="var(--text-tertiary)">
                    {vm.zone}
                  </Text>
                </VStack>
                <Badge
                  colorPalette={vm.status === 'running' ? 'success' : 'danger'}
                  variant="subtle"
                  size="lg"
                  borderRadius="8px"
                  px="12px"
                  py="6px"
                  fontWeight="600"
                >
                  {vm.status === 'running' ? 'Running' : 'Stopped'}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </ModernCard>
      </VStack>
    </Box>
  );
};
