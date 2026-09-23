import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Heading, Grid, GridItem, Badge } from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';
import { api } from '../api/client';
import { ModernCard } from '../components/ModernCard';
import type { VirtualMachine, AccountBalance, Invoice } from '../api/types';
import { LuServer, LuPlay, LuSquare, LuWallet, LuActivity } from 'react-icons/lu';

export const DashboardPage: React.FC = () => {
  const [vms, setVms] = useState<VirtualMachine[]>([]);
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('Loading dashboard data with VM details...');
        const [vmsData, balanceData, invoicesData] = await Promise.all([
          api.virtualMachines.list(undefined, true), // loadDetails=true для полной конфигурации
          api.billing.getBalance(),
          api.billing.getInvoices(),
        ]);
        console.log('Dashboard data loaded:', { vms: vmsData.length, balance: balanceData, invoices: invoicesData.length });
        setVms(vmsData);
        setBalance(balanceData);
        setInvoices(invoicesData);
      } catch (err) {
        console.error('Dashboard load error, using demo data:', err);
        // Демо данные для preview
        setVms([
          {
            id: 1,
            slug: 'web-server-01',
            name: 'Web Server 01',
            hostname: 'web-01.uzcloud.uz',
            status: 'running',
            cpu: 4,
            ram: 8,
            disk: 100,
            ip_address: '10.0.1.15',
            zone: 'Tashkent-1',
            template: 'Ubuntu 22.04 LTS',
            project_slug: 'default',
            created_at: '2026-01-15T10:30:00Z',
          },
          {
            id: 2,
            slug: 'api-server-01',
            name: 'API Server 01',
            hostname: 'api-01.uzcloud.uz',
            status: 'running',
            cpu: 8,
            ram: 16,
            disk: 200,
            ip_address: '10.0.1.22',
            zone: 'Tashkent-1',
            template: 'Ubuntu 22.04 LTS',
            project_slug: 'default',
            created_at: '2026-02-20T14:20:00Z',
          },
        ]);
        setBalance({ balance: 1245000, currency: 'UZS' });
        setInvoices([
          {
            id: 1,
            invoice_number: 'INV-2026-09',
            date: '2026-09-01',
            total: 387200,
            status: 'paid',
            currency: 'UZS',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'UZS') => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + (currency === 'UZS' ? ' сўм' : ` ${currency}`);
  };

  const runningVMs = vms.filter(vm => vm.status === 'running');
  const stoppedVMs = vms.filter(vm => vm.status === 'stopped');

  return (
    <Box>
      <VStack gap="32px" align="stretch">
        <VStack gap="8px" align="start">
          <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">
            Обзор
          </Heading>
          <Text fontSize="16px" color="gray.600">
            Обзор вашей облачной инфраструктуры
          </Text>
        </VStack>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap="24px">
          <GridItem>
            <ModernCard hover>
              <HStack gap="16px">
                <Box
                  p="16px"
                  borderRadius="12px"
                  bgGradient="linear(to-br, #3b82f6, #1d4ed8)"
                  color="white"
                >
                  <LuServer size={28} />
                </Box>
                <VStack gap="4px" align="start">
                  <Text fontSize="14px" fontWeight="500" color="gray.600">
                    Всего ВМ
                  </Text>
                  <Text fontSize="36px" fontWeight="700" letterSpacing="-0.02em">
                    {vms.length}
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
                  bgGradient="linear(to-br, #22c55e, #16a34a)"
                  color="white"
                >
                  <LuPlay size={28} />
                </Box>
                <VStack gap="4px" align="start">
                  <Text fontSize="14px" fontWeight="500" color="gray.600">
                    Работают
                  </Text>
                  <Text fontSize="36px" fontWeight="700" letterSpacing="-0.02em">
                    {runningVMs.length}
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
                  bgGradient="linear(to-br, #ef4444, #dc2626)"
                  color="white"
                >
                  <LuSquare size={28} />
                </Box>
                <VStack gap="4px" align="start">
                  <Text fontSize="14px" fontWeight="500" color="gray.600">
                    Остановлены
                  </Text>
                  <Text fontSize="36px" fontWeight="700" letterSpacing="-0.02em">
                    {stoppedVMs.length}
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
                  bgGradient="linear(to-br, #a855f7, #9333ea)"
                  color="white"
                >
                  <LuWallet size={28} />
                </Box>
                <VStack gap="4px" align="start">
                  <Text fontSize="14px" fontWeight="500" color="gray.600">
                    Баланс
                  </Text>
                  <Text fontSize="24px" fontWeight="700" letterSpacing="-0.02em">
                    {balance ? formatCurrency(balance.balance, balance.currency) : '—'}
                  </Text>
                </VStack>
              </HStack>
            </ModernCard>
          </GridItem>
        </Grid>

        {/* Recent Invoices */}
        <ModernCard title="Последние счета" icon={<LuActivity size={24} />}>
          <VStack gap="12px" align="stretch">
            {invoices.slice(0, 4).map((invoice) => (
              <HStack
                key={invoice.id}
                p="16px"
                borderRadius="12px"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ bg: 'gray.50' }}
                transition="all 0.2s"
              >
                <VStack gap="2px" align="start" flex={1}>
                  <Text fontSize="15px" fontWeight="600" fontFamily="mono">
                    {invoice.invoice_number}
                  </Text>
                  <Text fontSize="13px" color="gray.500">
                    {invoice.date}
                  </Text>
                </VStack>
                <Text fontSize="15px" fontWeight="600">
                  {formatCurrency(invoice.total, invoice.currency)}
                </Text>
                <Badge
                  colorPalette={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'danger'}
                  variant="subtle"
                  size="lg"
                  borderRadius="8px"
                  px="12px"
                  py="6px"
                  fontWeight="600"
                >
                  {invoice.status === 'paid' ? 'Оплачен' : invoice.status === 'pending' ? 'Ожидает' : 'Просрочен'}
                </Badge>
              </HStack>
            ))}
          </VStack>
        </ModernCard>
      </VStack>
    </Box>
  );
};
