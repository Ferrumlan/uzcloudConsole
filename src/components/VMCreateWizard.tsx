import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Heading, Input, Grid, GridItem, Separator } from '@chakra-ui/react';
import { ModernButton } from './ModernButton';
import { useApp } from '../contexts/AppContext';
import { api } from '../api/client';
import { LuMapPin, LuFolder, LuImage, LuCpu, LuHardDrive, LuNetwork, LuTag, LuPlus, LuCheck, LuChevronRight, LuChevronLeft, LuX } from 'react-icons/lu';

interface VMCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const locations = [
  { id: 'production', name: 'Production', region: 'Tashkent-1' },
  { id: 'staging', name: 'Staging', region: 'Tashkent-1' },
];

const images = [
  { id: 'ubuntu-24', name: 'Ubuntu 24.04 LTS', icon: '🐧', os: 'Linux' },
  { id: 'ubuntu-22', name: 'Ubuntu 22.04 LTS', icon: '🐧', os: 'Linux' },
  { id: 'centos-7', name: 'CentOS-7', icon: '🎩', os: 'Linux' },
  { id: 'centos-9', name: 'CentOS-9', icon: '🎩', os: 'Linux' },
  { id: 'centos-stream-10', name: 'CentOS Stream 10', icon: '🎩', os: 'Linux' },
  { id: 'debian-13', name: 'Debian 13', icon: '🌀', os: 'Linux' },
  { id: 'debian-12', name: 'Debian-12', icon: '🌀', os: 'Linux' },
  { id: 'debian-11', name: 'Debian 11', icon: '🌀', os: 'Linux' },
  { id: 'rocky-9', name: 'Rocky Linux 9.7', icon: '🪨', os: 'Linux' },
  { id: 'rocky-8', name: 'Rocky Linux 8', icon: '🪨', os: 'Linux' },
  { id: 'alma-9', name: 'AlmaLinux-9', icon: '🦬', os: 'Linux' },
  { id: 'alma-8', name: 'AlmaLinux-8', icon: '🦬', os: 'Linux' },
  { id: 'suse-16', name: 'SUSE-16', icon: '🦎', os: 'Linux' },
  { id: 'windows-2025', name: 'Windows Server 2025', icon: '🪟', os: 'Windows' },
  { id: 'windows-2022', name: 'Windows Server 2022', icon: '🪟', os: 'Windows' },
  { id: 'windows-2019', name: 'Windows server 2019', icon: '🪟', os: 'Windows' },
  { id: 'freebsd', name: 'FREEPBX', icon: '📞', os: 'Linux' },
  { id: 'opnsense', name: 'OPNsense-26.1.6', icon: '🔥', os: 'Linux' },
  { id: 'issabel4', name: 'ISSABEL4', icon: '📞', os: 'Linux' },
  { id: 'pfsense', name: 'Pfsense.2.7', icon: '🔥', os: 'Linux' },
];

const instanceConfigs = [
  { id: 'start-1', name: 'Start-1', cpu: 1, ram: 1, price: 0 },
  { id: 'plan-2', name: 'Plan-2', cpu: 2, ram: 4, price: 0 },
  { id: '2c-8g', name: '2C 8G', cpu: 2, ram: 8, price: 0 },
];

const volumeSizes = [50, 100, 200, 500, 1000];

export const VMCreateWizard: React.FC<VMCreateWizardProps> = ({ isOpen, onClose }) => {
  const { projects } = useApp();
  
  // Загрузка сохраненного состояния из localStorage
  const loadSavedState = () => {
    try {
      const saved = localStorage.getItem('vmCreateWizardState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load wizard state:', e);
    }
    return null;
  };

  const savedState = loadSavedState();
  
  const [currentStep, setCurrentStep] = useState(savedState?.currentStep || 1);
  const [formData, setFormData] = useState(savedState?.formData || {
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
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Сохранение состояния в localStorage при изменениях
  useEffect(() => {
    if (isOpen) {
      try {
        localStorage.setItem('vmCreateWizardState', JSON.stringify({
          currentStep,
          formData,
        }));
      } catch (e) {
        console.error('Failed to save wizard state:', e);
      }
    }
  }, [currentStep, formData, isOpen]);

  // Сброс состояния при закрытии
  const handleClose = () => {
    try {
      localStorage.removeItem('vmCreateWizardState');
    } catch (e) {
      console.error('Failed to clear wizard state:', e);
    }
    onClose();
  };

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

  // Реальные ID из API (получены через curl)
  const CLOUD_PROVIDER_NIMBO = 'a127f722-d4bd-4715-a627-b549ea112fdf';
  const REGION_STAGING = 'a2155064-1f9f-4369-8932-951aaa3ea724';
  const REGION_PRODUCTION = 'a127f724-c39c-45a0-a3bd-ceafa350e9b2';
  const PROJECT_DEFAULT = 'a21d2d63-e747-497d-8abd-bea57f57dd8a';

  // Templates ID (все из API)
  const TEMPLATES: Record<string, string> = {
    'ubuntu-24': 'a145bd0b-43d7-40f9-a0e3-423eff08e9f4',
    'ubuntu-22': 'a14fb343-50df-4c98-9db8-51d223722c88',
    'centos-7': 'a162551d-e581-4493-b7a0-881dcf133464',
    'centos-9': 'a1664afb-a68a-4dfa-bdfd-2887c21f0b3d',
    'centos-stream-10': 'a1663930-a5d5-48b4-b6ed-940d8e2f507a',
    'debian-13': 'a155e997-40fb-4fe1-8e34-d489ab4ceaf5',
    'debian-12': 'a16bf518-ae91-4eb6-9bf5-aef9f1fd2d6b',
    'debian-11': 'a216f38f-59e9-4d2f-b4fd-0c8d8b322a86',
    'rocky-9': 'a15415b5-30c5-4175-84a4-e001588becc0',
    'rocky-8': 'a16be268-878c-4f45-883b-6355d4643a0e',
    'alma-9': 'a16635ac-a223-4f19-8d57-f8348913ddf3',
    'alma-8': 'a1663536-7e99-469b-b27e-9b493e7f0f50',
    'suse-16': 'a149f526-9d31-4139-ac7c-eded0b2569fe',
    'windows-2025': 'a1603364-b3a2-4961-86e4-1804fb019f3f',
    'windows-2022': 'a1624bd7-bb1b-4770-9406-6748a4a9a51c',
    'windows-2019': 'a1623e4d-5010-4d7a-877b-26f8cec58673',
    'freebsd': 'a1880e27-0da5-4dfe-a852-ea465b5bcef5',
    'opnsense': 'a1f13a77-f36f-4e04-8517-592ad6e28b6d',
    'issabel4': 'a18815ff-813b-44dd-9eff-0b4b8f4d5fd0',
    'pfsense': 'a198a36f-f9e2-4f19-b405-cf13ed0c22ec',
  };

  // Plans ID
  const PLANS: Record<string, string> = {
    'start-1': 'a165cb8e-0cef-47a9-9c18-e1270d6b607b',
    'plan-2': 'a1300a00-bac5-451f-be77-6b074b26a6a7',
    '2c-8g': 'a21557d2-4c1c-4d72-9de1-3efc91f5e1c4',
  };

  // Маппинг regions
  const getRegionId = (locationId: string): string => {
    const mapping: Record<string, string> = {
      'production': REGION_PRODUCTION,
      'staging': REGION_STAGING,
    };
    return mapping[locationId] || REGION_STAGING;
  };

  // Маппинг проектов
  const getProjectId = (projectSlug: string): string => {
    return PROJECT_DEFAULT;
  };

  // Маппинг templates
  const getTemplateId = (imageId: string): string => {
    return TEMPLATES[imageId] || TEMPLATES['ubuntu-22'];
  };

  // Маппинг plans
  const getPlanId = (configId: string): string => {
    return PLANS[configId] || PLANS['start-1'];
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.image || !formData.instanceConfig) {
      setCreateError('Заполните все обязательные поля');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const vmData = {
        name: formData.name,
        hostname: formData.name.toLowerCase().replace(/\s+/g, '-'),
        cloud_provider: CLOUD_PROVIDER_NIMBO,
        region: getRegionId(formData.location),
        project: getProjectId(formData.project),
        template: getTemplateId(formData.image),
        plan: getPlanId(formData.instanceConfig),
        disk_size: formData.volumeSize,
        public_ip: formData.publicIp,
      };

      console.log('Creating VM with data:', vmData);
      
      await api.virtualMachines.create(vmData);
      
      // Успешное создание - очищаем состояние
      try {
        localStorage.removeItem('vmCreateWizardState');
      } catch (e) {
        console.error('Failed to clear wizard state:', e);
      }
      
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
      
      // TODO: Обновить список ВМ на странице
      window.location.reload(); // Временно перезагружаем страницу
    } catch (error) {
      console.error('Failed to create VM:', error);
      setCreateError(error instanceof Error ? error.message : 'Ошибка создания ВМ');
    } finally {
      setIsCreating(false);
    }
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
            <HStack justify="space-between" align="center">
              <Heading size="xl" fontWeight="700">
                Создать виртуальную машину
              </Heading>
              <ModernButton variant="ghost" size="sm" onClick={handleClose}>
                <LuX size={20} />
              </ModernButton>
            </HStack>
            
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
              <Grid templateColumns="repeat(4, 1fr)" gap="12px">
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
          <VStack gap="12px" align="stretch">
            {createError && (
              <Box p="12px" borderRadius="8px" bg="red.50" border="1px solid" borderColor="red.200">
                <Text fontSize="13px" color="red.700" fontWeight="500">
                  {createError}
                </Text>
              </Box>
            )}
            <HStack justify="space-between">
              <ModernButton 
                variant="outline" 
                size="md" 
                onClick={handleBack} 
                disabled={currentStep === 1 || isCreating}
              >
                <LuChevronLeft size={18} />
                Назад
              </ModernButton>
              {currentStep < 7 ? (
                <ModernButton variant="gradient" size="md" onClick={handleNext}>
                  Далее
                  <LuChevronRight size={18} />
                </ModernButton>
              ) : (
                <ModernButton 
                  variant="success" 
                  size="md" 
                  onClick={handleCreate}
                  loading={isCreating}
                >
                  <LuCheck size={18} />
                  {isCreating ? 'Создание...' : 'Создать ВМ'}
                </ModernButton>
              )}
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};
