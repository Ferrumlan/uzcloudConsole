import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Heading, Grid, GridItem, Badge, Separator } from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';
import { api } from '../api/client';
import { ModernCard } from '../components/ModernCard';
import type { AccountBalance, Invoice } from '../api/types';
import { LuWallet, LuTrendingUp, LuFileText } from 'react-icons/lu';

export const BillingPage: React.FC = () => {
  const [balance, setBalance] = useState<AccountBalance | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [balanceData, invoicesData] = await Promise.all([
          api.billing.getBalance(),
          api.billing.getInvoices(),
        ]);
        setBalance(balanceData);
        setInvoices(invoicesData);
      } catch (err) {
        console.error('Failed to load billing:', err);
        setBalance(null);
        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const formatCurrency = (amount: number, currency: string = 'UZS') => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + (currency === 'UZS' ? ' сўм' : ` ${currency}`);
  };

  const monthlyTotal = invoices.length > 0 ? invoices[0].total : 0;

  return (
    <Box>
      <VStack gap="32px" align="stretch">
        <VStack gap="8px" align="start">
          <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">
            Финансы
          </Heading>
          <Text fontSize="16px" color="gray.600">
            Управление балансом и счетами
          </Text>
        </VStack>

        {/* Balance Cards */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="24px">
          <GridItem>
            <ModernCard>
              <HStack gap="16px">
                <Box
                  p="20px"
                  borderRadius="16px"
                  bgGradient="linear(to-br, #0ea5e9, #0284c7)"
                  color="white"
                >
                  <LuWallet size={32} />
                </Box>
                <VStack gap="4px" align="start">
                  <Text fontSize="14px" fontWeight="500" color="gray.600">
                    Баланс
                  </Text>
                  <Text fontSize="32px" fontWeight="700" letterSpacing="-0.02em">
                    {balance ? formatCurrency(balance.balance, balance.currency) : '—'}
                  </Text>
                </VStack>
              </HStack>
            </ModernCard>
          </GridItem>

          <GridItem>
            <ModernCard>
              <HStack gap="16px">
                <Box
                  p="20px"
                  borderRadius="16px"
                  bgGradient="linear(to-br, #22c55e, #16a34a)"
                  color="white"
                >
                  <LuTrendingUp size={32} />
                </Box>
                <VStack gap="4px" align="start">
                  <Text fontSize="14px" fontWeight="500" color="gray.600">
                    Расход за месяц
                  </Text>
                  <Text fontSize="32px" fontWeight="700" letterSpacing="-0.02em">
                    {formatCurrency(monthlyTotal)}
                  </Text>
                </VStack>
              </HStack>
            </ModernCard>
          </GridItem>
        </Grid>

        {/* Invoices */}
        <ModernCard title="Счета" icon={<LuFileText size={24} />}>
          <VStack gap="12px" align="stretch">
            {invoices.map((invoice) => (
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
                <Text fontSize="16px" fontWeight="700">
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
