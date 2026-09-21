import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Heading, Input, Grid, GridItem, Separator } from '@chakra-ui/react';
import { ModernButton } from './ModernButton';
import { useApp } from '../contexts/AppContext';
import { LuServer, LuCpu, LuMemoryStick, LuHardDrive, LuCheck, LuChevronRight, LuChevronLeft, LuFolder } from 'react-icons/lu';

interface VMCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const templates = [
  { id: 'ubuntu-22', name: 'Ubuntu 22.04 LTS', icon: '🐧' },
  { id: 'ubuntu-24', name: 'Ubuntu 24.04 LTS', icon: '🐧' },
  { id: 'centos-9', name: 'CentOS 9', icon: '🎩' },
  { id: 'debian-12', name: 'Debian 12', icon: '🌀' },
  { id: 'windows-2022', name: 'Windows Server 2022', icon: '🪟' },
];

const plans = [
  { id: 'small', name: 'Small', cpu: 2, ram: 4, disk: 50, price: 22000 },
  { id: 'medium', name: 'Medium', cpu: 4, ram: 8, disk: 100, price: 45000 },
  { id: 'large', name: 'Large', cpu: 8, ram: 16, disk: 200, price: 89000 },
  { id: 'xlarge', name: 'XLarge', cpu: 16, ram: 32, disk: 500, price: 156000 },
];

export const VMCreateWizard: React.FC<VMCreateWizardProps> = ({ isOpen, onClose }) => {
  const { projects } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    template: '',
    plan: '',
    project: projects.find(p => p.is_default)?.slug || projects[0]?.slug || 'production',
  });

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCreate = () => {
    console.log('Creating VM:', formData);
    onClose();
    setCurrentStep(1);
    setFormData({ 
      name: '', 
      hostname: '', 
      template: '', 
      plan: '',
      project: projects.find(p => p.is_default)?.slug || projects[0]?.slug || 'production',
    });
  };

  const selectedTemplate = templates.find(t => t.id === formData.template);
  const selectedPlan = plans.find(p => p.id === formData.plan);

  return (
    <Box
      position="fixed"
      inset={0}
      bg="blackAlpha.600"
      zIndex={9999}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p="24px"
      onClick={onClose}
    >
      <Box
        bg="white"
        borderRadius="24px"
        w="100%"
        maxW="800px"
        maxH="90vh"
        overflow="hidden"
        display="flex"
        flexDirection="column"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Box p="24px" borderBottom="1px solid" borderBottomColor="gray.100">
          <VStack gap="16px" align="stretch">
            <Heading size="xl" fontWeight="700">
              Создать виртуальную машину
            </Heading>
            
            {/* Steps */}
            <HStack gap="8px">
              {['Базовые', 'Ресурсы', 'Сеть', 'Подтверждение'].map((label, idx) => (
                <React.Fragment key={idx}>
                  <HStack
                    gap="8px"
                    px="12px"
                    py="8px"
                    borderRadius="10px"
                    bg={currentStep === idx + 1 ? 'brand.50' : currentStep > idx + 1 ? 'success.50' : 'gray.50'}
                    color={currentStep === idx + 1 ? 'brand.700' : currentStep > idx + 1 ? 'success.700' : 'gray.500'}
                  >
                    <Box
                      p="6px"
                      borderRadius="8px"
                      bg={currentStep === idx + 1 ? 'brand.100' : currentStep > idx + 1 ? 'success.100' : 'gray.100'}
                    >
                      {currentStep > idx + 1 ? <LuCheck size={14} /> : <Text fontSize="12px" fontWeight="700">{idx + 1}</Text>}
                    </Box>
                    <Text fontSize="13px" fontWeight="600">{label}</Text>
                  </HStack>
                  {idx < 3 && <Box flex={1} h="2px" bg={currentStep > idx + 1 ? 'success.200' : 'gray.200'} />}
                </React.Fragment>
              ))}
            </HStack>
          </VStack>
        </Box>

        {/* Content */}
        <Box p="24px" overflowY="auto" flex={1}>
          {currentStep === 1 && (
            <VStack gap="24px" align="stretch">
              <VStack gap="8px" align="stretch">
                <Text fontSize="14px" fontWeight="600" color="gray.700">
                  Проект
                </Text>
                <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap="12px">
                  {projects.map((project) => (
                    <GridItem key={project.slug}>
                      <Box
                        p="16px"
                        borderRadius="12px"
                        borderWidth="2px"
                        borderColor={formData.project === project.slug ? '#0ea5e9' : 'gray.200'}
                        bg={formData.project === project.slug ? '#f0f9ff' : 'white'}
                        cursor="pointer"
                        onClick={() => setFormData({ ...formData, project: project.slug })}
                        transition="all 0.2s"
                        _hover={{
                          borderColor: '#38bdf8',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <HStack gap="12px">
                          <Box
                            p="8px"
                            borderRadius="8px"
                            bg={formData.project === project.slug ? 'brand.100' : 'gray.100'}
                            color={formData.project === project.slug ? 'brand.600' : 'gray.600'}
                          >
                            <LuFolder size={20} />
                          </Box>
                          <VStack gap="2px" align="start" flex={1}>
                            <Text fontSize="14px" fontWeight="600" color="gray.900">
                              {project.name}
                            </Text>
                            {project.is_default && (
                              <Text fontSize="11px" color="gray.500">
                                По умолчанию
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </VStack>

              <VStack gap="8px" align="stretch">
                <Text fontSize="14px" fontWeight="600" color="gray.700">
                  Имя виртуальной машины
                </Text>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="my-web-server"
                  size="lg"
                  borderRadius="12px"
                  borderWidth="2px"
                />
              </VStack>

              <VStack gap="8px" align="stretch">
                <Text fontSize="14px" fontWeight="600" color="gray.700">
                  Hostname
                </Text>
                <Input
                  value={formData.hostname}
                  onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                  placeholder="web.example.com"
                  size="lg"
                  borderRadius="12px"
                  borderWidth="2px"
                />
              </VStack>

              <VStack gap="12px" align="stretch">
                <Text fontSize="14px" fontWeight="600" color="gray.700">
                  Операционная система
                </Text>
                <Grid templateColumns="repeat(3, 1fr)" gap="12px">
                  {templates.map((template) => (
                    <GridItem key={template.id}>
                      <Box
                        p="16px"
                        borderRadius="12px"
                        borderWidth="2px"
                        borderColor={formData.template === template.id ? '#0ea5e9' : 'gray.200'}
                        bg={formData.template === template.id ? '#f0f9ff' : 'white'}
                        cursor="pointer"
                        onClick={() => setFormData({ ...formData, template: template.id })}
                        transition="all 0.2s"
                        _hover={{
                          borderColor: '#38bdf8',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <VStack gap="8px">
                          <Text fontSize="32px">{template.icon}</Text>
                          <Text fontSize="13px" fontWeight="600" textAlign="center">
                            {template.name}
                          </Text>
                        </VStack>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </VStack>
            </VStack>
          )}

          {currentStep === 2 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Тарифный план
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap="16px">
                {plans.map((plan) => (
                  <GridItem key={plan.id}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.plan === plan.id ? '#0ea5e9' : 'gray.200'}
                      bg={formData.plan === plan.id ? '#f0f9ff' : 'white'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, plan: plan.id })}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: '#38bdf8',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <VStack gap="12px" align="stretch">
                        <HStack justify="space-between">
                          <Text fontSize="18px" fontWeight="700" color="gray.900">
                            {plan.name}
                          </Text>
                          <Text fontSize="14px" fontWeight="600" color="brand.600">
                            {plan.price.toLocaleString()} сўм/мес
                          </Text>
                        </HStack>
                        <Separator borderColor="gray.200" />
                        <HStack gap="16px">
                          <HStack gap="4px">
                            <LuCpu size={16} color="#64748b" />
                            <Text fontSize="13px" fontWeight="600" color="gray.600">
                              {plan.cpu} vCPU
                            </Text>
                          </HStack>
                          <HStack gap="4px">
                            <LuMemoryStick size={16} color="#64748b" />
                            <Text fontSize="13px" fontWeight="600" color="gray.600">
                              {plan.ram} GB
                            </Text>
                          </HStack>
                          <HStack gap="4px">
                            <LuHardDrive size={16} color="#64748b" />
                            <Text fontSize="13px" fontWeight="600" color="gray.600">
                              {plan.disk} GB
                            </Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          )}

          {currentStep === 3 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Сетевые настройки
              </Text>
              <Box p="20px" borderRadius="12px" bg="gray.50" border="2px solid" borderColor="gray.200">
                <VStack gap="12px" align="stretch">
                  <HStack gap="8px">
                    <Box p="8px" borderRadius="8px" bg="brand.100" color="brand.600">
                      <LuServer size={20} />
                    </Box>
                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                      Default Network
                    </Text>
                  </HStack>
                  <Text fontSize="13px" color="gray.600">
                    Автоматическое назначение IP адреса из пула 10.0.0.0/24
                  </Text>
                </VStack>
              </Box>
            </VStack>
          )}

          {currentStep === 4 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Подтверждение создания
              </Text>
              <Box p="24px" borderRadius="12px" bg="gray.50" border="2px solid" borderColor="gray.200">
                <VStack gap="16px" align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Проект:</Text>
                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                      {projects.find(p => p.slug === formData.project)?.name || '—'}
                    </Text>
                  </HStack>
                  <Separator borderColor="gray.200" />
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Имя:</Text>
                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                      {formData.name || '—'}
                    </Text>
                  </HStack>
                  <Separator borderColor="gray.200" />
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Hostname:</Text>
                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                      {formData.hostname || '—'}
                    </Text>
                  </HStack>
                  <Separator borderColor="gray.200" />
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">ОС:</Text>
                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                      {selectedTemplate?.name || '—'}
                    </Text>
                  </HStack>
                  <Separator borderColor="gray.200" />
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Тариф:</Text>
                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                      {selectedPlan?.name || '—'}
                    </Text>
                  </HStack>
                  {selectedPlan && (
                    <>
                      <Separator borderColor="gray.200" />
                      <HStack justify="space-between">
                        <Text fontSize="14px" color="gray.600">Стоимость:</Text>
                        <Text fontSize="14px" fontWeight="700" color="brand.600">
                          {selectedPlan.price.toLocaleString()} сўм/мес
                        </Text>
                      </HStack>
                    </>
                  )}
                </VStack>
              </Box>
            </VStack>
          )}
        </Box>

        {/* Footer */}
        <Box p="24px" borderTop="1px solid" borderTopColor="gray.100">
          <HStack justify="space-between">
            <ModernButton variant="outline" size="md" onClick={handleBack} disabled={currentStep === 1}>
              <LuChevronLeft size={18} />
              Назад
            </ModernButton>
            {currentStep < 4 ? (
              <ModernButton variant="gradient" size="md" onClick={handleNext}>
                Далее
                <LuChevronRight size={18} />
              </ModernButton>
            ) : (
              <ModernButton variant="success" size="md" onClick={handleCreate}>
                <LuCheck size={18} />
                Создать ВМ
              </ModernButton>
            )}
          </HStack>
        </Box>
      </Box>
    </Box>
  );
};
