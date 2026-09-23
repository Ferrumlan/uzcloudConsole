import React from 'react';
import { Box, VStack, HStack, Text, Heading, Badge, Separator } from '@chakra-ui/react';
import { ModernCard } from '../components/ModernCard';
import { ModernButton } from '../components/ModernButton';
import type { VirtualMachine } from '../api/types';
import { LuArrowLeft, LuPlay, LuSquare, LuRotateCw, LuServer, LuCpu, LuMemoryStick, LuHardDrive, LuNetwork, LuMapPin, LuCalendar } from 'react-icons/lu';

interface VMDetailPageProps {
  vm: VirtualMachine;
  onBack: () => void;
}

export const VMDetailPage: React.FC<VMDetailPageProps> = ({ vm, onBack }) => {
  const statusColors: Record<string, string> = {
    running: 'success',
    stopped: 'danger',
    starting: 'warning',
    stopping: 'warning',
    error: 'danger',
    deploying: 'info',
  };

  // Защита от undefined значений
  if (!vm) {
    return (
      <Box p="32px" textAlign="center">
        <Text fontSize="18px" color="gray.600">Виртуальная машина не найдена</Text>
        <Box mt="16px">
          <ModernButton variant="outline" size="md" onClick={onBack}>
            Назад
          </ModernButton>
        </Box>
      </Box>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ru-RU', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return 'Неизвестно';
    }
  };

  // Fallback значения
  const vmName = vm.name || 'Без имени';
  const vmHostname = vm.hostname || '—';
  const vmStatus = vm.status || 'stopped';
  const vmCpu = vm.cpu || 0;
  const vmRam = vm.ram || 0;
  const vmDisk = vm.disk || 0;
  const vmIp = vm.ip_address || '—';
  const vmZone = vm.zone || '—';
  const vmTemplate = vm.template || '—';

  return (
    <Box>
      <VStack gap="32px" align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack gap="16px">
            <ModernButton variant="ghost" size="md" onClick={onBack}>
              <LuArrowLeft size={20} />
            </ModernButton>
            <VStack gap="4px" align="start">
              <HStack gap="12px">
                <Heading size="xl" fontWeight="700" letterSpacing="-0.02em">
                  {vmName}
                </Heading>
                <Badge
                  colorPalette={statusColors[vmStatus]}
                  variant="subtle"
                  size="lg"
                  borderRadius="8px"
                  px="12px"
                  py="6px"
                  fontWeight="600"
                >
                  {vmStatus === 'running' ? 'Работает' : vmStatus === 'stopped' ? 'Остановлена' : vmStatus}
                </Badge>
              </HStack>
              <Text fontSize="14px" color="gray.500" fontFamily="mono">
                {vmHostname}
              </Text>
            </VStack>
          </HStack>

          <HStack gap="8px">
            {vmStatus === 'stopped' && (
              <ModernButton variant="success" size="md" icon={<LuPlay size={18} />}>
                Запустить
              </ModernButton>
            )}
            {vmStatus === 'running' && (
              <>
                <ModernButton variant="danger" size="md" icon={<LuSquare size={18} />}>
                  Остановить
                </ModernButton>
                <ModernButton variant="outline" size="md" icon={<LuRotateCw size={18} />}>
                  Перезагрузить
                </ModernButton>
              </>
            )}
          </HStack>
        </HStack>

        {/* Info Grid */}
        <Box
          display="grid"
          gridTemplateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }}
          gap="24px"
        >
          <ModernCard>
            <HStack gap="12px">
              <Box p="12px" borderRadius="12px" bgGradient="linear(to-br, #dbeafe, #bfdbfe)" color="#1d4ed8">
                <LuCpu size={24} />
              </Box>
              <VStack gap="2px" align="start">
                <Text fontSize="12px" color="gray.500" fontWeight="600" textTransform="uppercase">
                  CPU
                </Text>
                <Text fontSize="20px" fontWeight="700">
                  {vmCpu} vCPU
                </Text>
              </VStack>
            </HStack>
          </ModernCard>

          <ModernCard>
            <HStack gap="12px">
              <Box p="12px" borderRadius="12px" bgGradient="linear(to-br, #f3e8ff, #e9d5ff)" color="#7e22ce">
                <LuMemoryStick size={24} />
              </Box>
              <VStack gap="2px" align="start">
                <Text fontSize="12px" color="gray.500" fontWeight="600" textTransform="uppercase">
                  Память
                </Text>
                <Text fontSize="20px" fontWeight="700">
                  {vmRam} GB
                </Text>
              </VStack>
            </HStack>
          </ModernCard>

          <ModernCard>
            <HStack gap="12px">
              <Box p="12px" borderRadius="12px" bgGradient="linear(to-br, #ffedd5, #fed7aa)" color="#c2410c">
                <LuHardDrive size={24} />
              </Box>
              <VStack gap="2px" align="start">
                <Text fontSize="12px" color="gray.500" fontWeight="600" textTransform="uppercase">
                  Диск
                </Text>
                <Text fontSize="20px" fontWeight="700">
                  {vmDisk} GB
                </Text>
              </VStack>
            </HStack>
          </ModernCard>

          <ModernCard>
            <HStack gap="12px">
              <Box p="12px" borderRadius="12px" bgGradient="linear(to-br, #dcfce7, #bbf7d0)" color="#15803d">
                <LuNetwork size={24} />
              </Box>
              <VStack gap="2px" align="start">
                <Text fontSize="12px" color="gray.500" fontWeight="600" textTransform="uppercase">
                  IP адрес
                </Text>
                <Text fontSize="20px" fontWeight="700" fontFamily="mono">
                  {vmIp}
                </Text>
              </VStack>
            </HStack>
          </ModernCard>

          <ModernCard>
            <HStack gap="12px">
              <Box p="12px" borderRadius="12px" bgGradient="linear(to-br, #ccfbf1, #99f6e4)" color="#0f766e">
                <LuMapPin size={24} />
              </Box>
              <VStack gap="2px" align="start">
                <Text fontSize="12px" color="gray.500" fontWeight="600" textTransform="uppercase">
                  Зона
                </Text>
                <Text fontSize="20px" fontWeight="700">
                  {vmZone}
                </Text>
              </VStack>
            </HStack>
          </ModernCard>

          <ModernCard>
            <HStack gap="12px">
              <Box p="12px" borderRadius="12px" bgGradient="linear(to-br, #f1f5f9, #e2e8f0)" color="#475569">
                <LuCalendar size={24} />
              </Box>
              <VStack gap="2px" align="start">
                <Text fontSize="12px" color="gray.500" fontWeight="600" textTransform="uppercase">
                  Создана
                </Text>
                <Text fontSize="16px" fontWeight="700">
                  {formatDate(vm.created_at || new Date().toISOString())}
                </Text>
              </VStack>
            </HStack>
          </ModernCard>
        </Box>

        {/* Details */}
        <ModernCard title="Информация" icon={<LuServer size={24} />}>
          <VStack gap="16px" align="stretch">
            <HStack justify="space-between">
              <Text fontSize="14px" color="gray.600">Шаблон</Text>
              <Text fontSize="14px" fontWeight="600">{vmTemplate}</Text>
            </HStack>
            <Separator />
            <HStack justify="space-between">
              <Text fontSize="14px" color="gray.600">Slug</Text>
              <Text fontSize="14px" fontWeight="600" fontFamily="mono">{vm.slug}</Text>
            </HStack>
            <Separator />
            <HStack justify="space-between">
              <Text fontSize="14px" color="gray.600">ID</Text>
              <Text fontSize="14px" fontWeight="600" fontFamily="mono">{vm.id}</Text>
            </HStack>
          </VStack>
        </ModernCard>
      </VStack>
    </Box>
  );
};
