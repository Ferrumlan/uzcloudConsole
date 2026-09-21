import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Heading, Input, Grid, GridItem, Separator } from '@chakra-ui/react';
import { ModernButton } from './ModernButton';
import { useApp } from '../contexts/AppContext';
import { LuMapPin, LuFolder, LuImage, LuCpu, LuHardDrive, LuNetwork, LuTag, LuPlus, LuCheck, LuChevronRight, LuChevronLeft } from 'react-icons/lu';

interface VMCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const locations = [
  { id: 'production', name: 'Production', region: 'Tashkent-1' },
  { id: 'staging', name: 'Staging', region: 'Tashkent-1' },
];

const images = [
  { id: 'ubuntu-22', name: 'Ubuntu 22.04 LTS', icon: '🐧', os: 'Linux' },
  { id: 'ubuntu-24', name: 'Ubuntu 24.04 LTS', icon: '🐧', os: 'Linux' },
  { id: 'centos-9', name: 'CentOS 9', icon: '🎩', os: 'Linux' },
  { id: 'debian-12', name: 'Debian 12', icon: '🌀', os: 'Linux' },
  { id: 'windows-2022', name: 'Windows Server 2022', icon: '🪟', os: 'Windows' },
];

const instanceConfigs = [
  { id: 'small', name: 'Small', cpu: 2, ram: 4, price: 22000 },
  { id: 'medium', name: 'Medium', cpu: 4, ram: 8, price: 45000 },
  { id: 'large', name: 'Large', cpu: 8, ram: 16, price: 89000 },
  { id: 'xlarge', name: 'XLarge', cpu: 16, ram: 32, price: 156000 },
];

const volumeSizes = [50, 100, 200, 500, 1000];

export const VMCreateWizard: React.FC<VMCreateWizardProps> = ({ isOpen, onClose }) => {
  const { projects } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    location: 'production',
    project: 'default',
    newProjectName: '',
    image: '',
    instanceConfig: '',
    volumeSize: 100,
    networkType: 'isolated',
    publicIp: false,
    name: '',
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  if (!isOpen) return null;

  const steps = [
    { id: 1, label: 'Location', icon: LuMapPin },
    { id: 2, label: 'Project', icon: LuFolder },
    { id: 3, label: 'Image', icon: LuImage },
    { id: 4, label: 'Instance', icon: LuCpu },
    { id: 5, label: 'Volume', icon: LuHardDrive },
    { id: 6, label: 'Network', icon: LuNetwork },
    { id: 7, label: 'Name', icon: LuTag },
  ];

  const handleNext = () => {
    if (currentStep < 7) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCreate = () => {
    console.log('Creating VM:', formData);
    onClose();
    setCurrentStep(1);
    setFormData({
      location: 'production',
      project: 'default',
      newProjectName: '',
      image: '',
      instanceConfig: '',
      volumeSize: 100,
      networkType: 'isolated',
      publicIp: false,
      name: '',
    });
    setIsCreatingProject(false);
  };

  const selectedLocation = locations.find(l => l.id === formData.location);
  const selectedImage = images.find(i => i.id === formData.image);
  const selectedConfig = instanceConfigs.find(c => c.id === formData.instanceConfig);
  const selectedProject = isCreatingProject ? formData.newProjectName : formData.project;

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
        maxW="900px"
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
            <HStack gap="4px" overflowX="auto" pb="4px">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <React.Fragment key={step.id}>
                    <HStack
                      gap="6px"
                      px="10px"
                      py="6px"
                      borderRadius="8px"
                      bg={isActive ? 'brand.50' : isCompleted ? 'success.50' : 'gray.50'}
                      color={isActive ? 'brand.700' : isCompleted ? 'success.700' : 'gray.500'}
                      flexShrink={0}
                    >
                      <Box
                        p="4px"
                        borderRadius="6px"
                        bg={isActive ? 'brand.100' : isCompleted ? 'success.100' : 'gray.100'}
                      >
                        {isCompleted ? <LuCheck size={12} /> : <Icon size={12} />}
                      </Box>
                      <Text fontSize="12px" fontWeight="600" whiteSpace="nowrap">
                        {step.label}
                      </Text>
                    </HStack>
                    {idx < steps.length - 1 && (
                      <Box w="16px" h="2px" bg={isCompleted ? 'success.200' : 'gray.200'} flexShrink={0} />
                    )}
                  </React.Fragment>
                );
              })}
            </HStack>
          </VStack>
        </Box>

        {/* Content */}
        <Box p="24px" overflowY="auto" flex={1}>
          {/* Step 1: Location */}
          {currentStep === 1 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Выберите регион
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap="16px">
                {locations.map((location) => (
                  <GridItem key={location.id}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.location === location.id ? '#0ea5e9' : 'gray.200'}
                      bg={formData.location === location.id ? '#f0f9ff' : 'white'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, location: location.id })}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: '#38bdf8',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <VStack gap="12px" align="start">
                        <HStack gap="12px">
                          <Box
                            p="12px"
                            borderRadius="10px"
                            bg={formData.location === location.id ? 'brand.100' : 'gray.100'}
                            color={formData.location === location.id ? 'brand.600' : 'gray.600'}
                          >
                            <LuMapPin size={24} />
                          </Box>
                          <VStack gap="4px" align="start">
                            <Text fontSize="18px" fontWeight="700" color="gray.900">
                              {location.name}
                            </Text>
                            <Text fontSize="13px" color="gray.600">
                              {location.region}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          )}

          {/* Step 2: Project */}
          {currentStep === 2 && (
            <VStack gap="24px" align="stretch">
              <HStack justify="space-between">
                <Text fontSize="14px" fontWeight="600" color="gray.700">
                  Выберите проект или создайте новый
                </Text>
                <ModernButton
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreatingProject(!isCreatingProject)}
                  icon={<LuPlus size={16} />}
                >
                  {isCreatingProject ? 'Выбрать существующий' : 'Создать новый'}
                </ModernButton>
              </HStack>

              {!isCreatingProject ? (
                <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap="12px">
                  <GridItem>
                    <Box
                      p="16px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.project === 'default' ? '#0ea5e9' : 'gray.200'}
                      bg={formData.project === 'default' ? '#f0f9ff' : 'white'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, project: 'default' })}
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
                          bg={formData.project === 'default' ? 'brand.100' : 'gray.100'}
                          color={formData.project === 'default' ? 'brand.600' : 'gray.600'}
                        >
                          <LuFolder size={20} />
                        </Box>
                        <VStack gap="2px" align="start" flex={1}>
                          <Text fontSize="14px" fontWeight="600" color="gray.900">
                            Default
                          </Text>
                          <Text fontSize="11px" color="gray.500">
                            По умолчанию
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  </GridItem>
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
                          </VStack>
                        </HStack>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              ) : (
                <VStack gap="12px" align="stretch">
                  <Text fontSize="14px" fontWeight="600" color="gray.700">
                    Название нового проекта
                  </Text>
                  <Input
                    value={formData.newProjectName}
                    onChange={(e) => setFormData({ ...formData, newProjectName: e.target.value })}
                    placeholder="Например: application, api, database"
                    size="lg"
                    borderRadius="12px"
                    borderWidth="2px"
                  />
                </VStack>
              )}
            </VStack>
          )}

          {/* Step 3: Image */}
          {currentStep === 3 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Выберите образ операционной системы
              </Text>
              <Grid templateColumns="repeat(3, 1fr)" gap="12px">
                {images.map((image) => (
                  <GridItem key={image.id}>
                    <Box
                      p="16px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.image === image.id ? '#0ea5e9' : 'gray.200'}
                      bg={formData.image === image.id ? '#f0f9ff' : 'white'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, image: image.id })}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: '#38bdf8',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <VStack gap="8px">
                        <Text fontSize="32px">{image.icon}</Text>
                        <Text fontSize="13px" fontWeight="600" textAlign="center">
                          {image.name}
                        </Text>
                        <Text fontSize="11px" color="gray.500">
                          {image.os}
                        </Text>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          )}

          {/* Step 4: Instance Configuration */}
          {currentStep === 4 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Конфигурация инстанса
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap="16px">
                {instanceConfigs.map((config) => (
                  <GridItem key={config.id}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.instanceConfig === config.id ? '#0ea5e9' : 'gray.200'}
                      bg={formData.instanceConfig === config.id ? '#f0f9ff' : 'white'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, instanceConfig: config.id })}
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
                            {config.name}
                          </Text>
                          <Text fontSize="14px" fontWeight="600" color="brand.600">
                            {config.price.toLocaleString()} сўм/мес
                          </Text>
                        </HStack>
                        <Separator borderColor="gray.200" />
                        <HStack gap="24px">
                          <HStack gap="8px">
                            <LuCpu size={20} color="#64748b" />
                            <VStack gap="0" align="start">
                              <Text fontSize="11px" color="gray.500">vCPU</Text>
                              <Text fontSize="16px" fontWeight="700" color="gray.900">
                                {config.cpu}
                              </Text>
                            </VStack>
                          </HStack>
                          <HStack gap="8px">
                            <LuCpu size={20} color="#64748b" />
                            <VStack gap="0" align="start">
                              <Text fontSize="11px" color="gray.500">vRAM</Text>
                              <Text fontSize="16px" fontWeight="700" color="gray.900">
                                {config.ram} GB
                              </Text>
                            </VStack>
                          </HStack>
                        </HStack>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          )}

          {/* Step 5: Volume Configuration */}
          {currentStep === 5 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Конфигурация тома (Volume)
              </Text>
              <VStack gap="16px" align="stretch">
                <Text fontSize="14px" color="gray.600">
                  Размер диска
                </Text>
                <Grid templateColumns="repeat(5, 1fr)" gap="12px">
                  {volumeSizes.map((size) => (
                    <GridItem key={size}>
                      <Box
                        p="16px"
                        borderRadius="12px"
                        borderWidth="2px"
                        borderColor={formData.volumeSize === size ? '#0ea5e9' : 'gray.200'}
                        bg={formData.volumeSize === size ? '#f0f9ff' : 'white'}
                        cursor="pointer"
                        onClick={() => setFormData({ ...formData, volumeSize: size })}
                        transition="all 0.2s"
                        textAlign="center"
                        _hover={{
                          borderColor: '#38bdf8',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        }}
                      >
                        <VStack gap="4px">
                          <LuHardDrive size={24} color={formData.volumeSize === size ? '#0ea5e9' : '#64748b'} />
                          <Text fontSize="18px" fontWeight="700" color={formData.volumeSize === size ? 'brand.600' : 'gray.900'}>
                            {size} GB
                          </Text>
                        </VStack>
                      </Box>
                    </GridItem>
                  ))}
                </Grid>
              </VStack>
            </VStack>
          )}

          {/* Step 6: Network */}
          {currentStep === 6 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Выберите тип сети
              </Text>
              <Grid templateColumns="repeat(2, 1fr)" gap="16px">
                <GridItem>
                  <Box
                    p="20px"
                    borderRadius="12px"
                    borderWidth="2px"
                    borderColor={formData.networkType === 'isolated' ? '#0ea5e9' : 'gray.200'}
                    bg={formData.networkType === 'isolated' ? '#f0f9ff' : 'white'}
                    cursor="pointer"
                    onClick={() => setFormData({ ...formData, networkType: 'isolated' })}
                    transition="all 0.2s"
                    _hover={{
                      borderColor: '#38bdf8',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <VStack gap="12px" align="start">
                      <HStack gap="12px">
                        <Box
                          p="12px"
                          borderRadius="10px"
                          bg={formData.networkType === 'isolated' ? 'brand.100' : 'gray.100'}
                          color={formData.networkType === 'isolated' ? 'brand.600' : 'gray.600'}
                        >
                          <LuNetwork size={24} />
                        </Box>
                        <VStack gap="4px" align="start">
                          <Text fontSize="18px" fontWeight="700" color="gray.900">
                            Isolated
                          </Text>
                          <Text fontSize="13px" color="gray.600">
                            Изолированная приватная сеть
                          </Text>
                        </VStack>
                      </HStack>
                      <Text fontSize="12px" color="gray.500">
                        Полная изоляция, доступ только через VPN или bastion host
                      </Text>
                    </VStack>
                  </Box>
                </GridItem>

                <GridItem>
                  <Box
                    p="20px"
                    borderRadius="12px"
                    borderWidth="2px"
                    borderColor={formData.networkType === 'vpc' ? '#0ea5e9' : 'gray.200'}
                    bg={formData.networkType === 'vpc' ? '#f0f9ff' : 'white'}
                    cursor="pointer"
                    onClick={() => setFormData({ ...formData, networkType: 'vpc' })}
                    transition="all 0.2s"
                    _hover={{
                      borderColor: '#38bdf8',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    <VStack gap="12px" align="start">
                      <HStack gap="12px">
                        <Box
                          p="12px"
                          borderRadius="10px"
                          bg={formData.networkType === 'vpc' ? 'brand.100' : 'gray.100'}
                          color={formData.networkType === 'vpc' ? 'brand.600' : 'gray.600'}
                        >
                          <LuNetwork size={24} />
                        </Box>
                        <VStack gap="4px" align="start">
                          <Text fontSize="18px" fontWeight="700" color="gray.900">
                            VPC
                          </Text>
                          <Text fontSize="13px" color="gray.600">
                            Virtual Private Cloud
                          </Text>
                        </VStack>
                      </HStack>
                      <Text fontSize="12px" color="gray.500">
                        VPC в регионе {selectedLocation?.region} с гибкой настройкой
                      </Text>
                    </VStack>
                  </Box>
                </GridItem>
              </Grid>

              <Box 
                p="16px" 
                borderRadius="12px" 
                border="2px solid" 
                borderColor={formData.publicIp ? "brand.200" : "gray.200"}
                bg={formData.publicIp ? "brand.50" : "white"}
                cursor="pointer"
                onClick={() => setFormData({ ...formData, publicIp: !formData.publicIp })}
                transition="all 0.2s"
              >
                <HStack justify="space-between">
                  <VStack gap="4px" align="start">
                    <Text fontSize="14px" fontWeight="600" color="gray.900">
                      Публичный IP адрес
                    </Text>
                    <Text fontSize="13px" color="gray.600">
                      Назначить публичный IP для доступа из интернета
                    </Text>
                  </VStack>
                  <Box
                    w="24px"
                    h="24px"
                    borderRadius="6px"
                    border="2px solid"
                    borderColor={formData.publicIp ? "brand.500" : "gray.300"}
                    bg={formData.publicIp ? "brand.500" : "white"}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {formData.publicIp && <LuCheck size={16} color="white" />}
                  </Box>
                </HStack>
              </Box>
            </VStack>
          )}

          {/* Step 7: Name */}
          {currentStep === 7 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Имя виртуальной машины
              </Text>
              <VStack gap="12px" align="stretch">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: web-server-01, api-instance, db-primary"
                  size="lg"
                  borderRadius="12px"
                  borderWidth="2px"
                />
                <Text fontSize="13px" color="gray.500">
                  Используйте понятное имя для идентификации сервера
                </Text>
              </VStack>

              {/* Summary */}
              <Box p="24px" borderRadius="12px" bg="gray.50" border="2px solid" borderColor="gray.200">
                <VStack gap="12px" align="stretch">
                  <Text fontSize="16px" fontWeight="700" color="gray.900">
                    Итого:
                  </Text>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Location:</Text>
                    <Text fontSize="14px" fontWeight="600">{selectedLocation?.name}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Project:</Text>
                    <Text fontSize="14px" fontWeight="600">{selectedProject || '—'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Image:</Text>
                    <Text fontSize="14px" fontWeight="600">{selectedImage?.name || '—'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Instance:</Text>
                    <Text fontSize="14px" fontWeight="600">
                      {selectedConfig ? `${selectedConfig.cpu} vCPU / ${selectedConfig.ram} GB RAM` : '—'}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Volume:</Text>
                    <Text fontSize="14px" fontWeight="600">{formData.volumeSize} GB</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Network:</Text>
                    <Text fontSize="14px" fontWeight="600">
                      {formData.networkType === 'isolated' ? 'Isolated' : 'VPC'} {formData.publicIp ? '+ Public IP' : ''}
                    </Text>
                  </HStack>
                  {selectedConfig && (
                    <>
                      <Separator borderColor="gray.200" />
                      <HStack justify="space-between">
                        <Text fontSize="14px" color="gray.600">Стоимость:</Text>
                        <Text fontSize="16px" fontWeight="700" color="brand.600">
                          {selectedConfig.price.toLocaleString()} сўм/мес
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
            {currentStep < 7 ? (
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
