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
  const statusColors = {
    running: 'success',
    stopped: 'danger',
    starting: 'warning',
    stopping: 'warning',
    error: 'danger',
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

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
                  {vm.name}
                </Heading>
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
              </HStack>
              <Text fontSize="14px" color="gray.500" fontFamily="mono">
                {vm.hostname}
              </Text>
            </VStack>
          </HStack>

          <HStack gap="8px">
            {vm.status === 'stopped' && (
              <ModernButton variant="success" size="md" icon={<LuPlay size={18} />}>
                Запустить
              </ModernButton>
            )}
            {vm.status === 'running' && (
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
                  {vm.cpu} vCPU
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
                  {vm.ram} GB
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
                  {vm.disk} GB
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
                  {vm.ip_address || '—'}
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
                  {vm.zone}
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
                  {formatDate(vm.created_at)}
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
              <Text fontSize="14px" fontWeight="600">{vm.template}</Text>
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
