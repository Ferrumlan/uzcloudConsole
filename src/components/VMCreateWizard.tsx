import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Heading, Input, Grid, GridItem, Separator, Spinner } from '@chakra-ui/react';
import { ModernButton } from './ModernButton';
import { useApp } from '../contexts/AppContext';
import { api } from '../api/client';
import type { Project, Region, Template, Plan } from '../api/types';
import { LuMapPin, LuFolder, LuImage, LuCpu, LuMemoryStick, LuHardDrive, LuNetwork, LuTag, LuPlus, LuCheck, LuChevronRight, LuChevronLeft, LuX, LuCircleAlert } from 'react-icons/lu';

interface VMCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const volumeSizes = [20, 50, 100, 200, 500, 1000];

export const VMCreateWizard: React.FC<VMCreateWizardProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    location: '',
    project: '',
    newProjectName: '',
    image: '',
    instanceConfig: '',
    volumeSize: 20,
    networkType: 'Isolated',
    publicIp: false,
    storageCategory: '',
    billingCycle: '',
    name: '',
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Данные из API
  const [regions, setRegions] = useState<Region[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [storageCategories, setStorageCategories] = useState<any[]>([]);
  const [billingCycles, setBillingCycles] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Загрузка данных из API при открытии wizard
  useEffect(() => {
    if (isOpen) {
      loadAPIData();
    }
  }, [isOpen]);

  const loadAPIData = async () => {
    setLoadingData(true);
    setLoadError(null);
    
    try {
      // Параллельная загрузка всех данных
      const [regionsData, projectsData, templatesData, plansData, storageCategoriesData, billingCyclesData] = await Promise.all([
        api.regions.list(),
        api.projects.list(),
        api.templates.list(),
        api.plans.listVMPlans(),
        api.storageCategories.list(),
        api.billingCycles.list(),
      ]);

      // Нормализуем планы - извлекаем CPU/RAM из attribute
      const normalizedPlans = plansData.map((plan: any) => ({
        ...plan,
        cpu: plan.attribute?.cpu || plan.cpu || 0,
        ram: plan.attribute?.memory 
          ? Math.round(plan.attribute.memory / 1024)  // MB → GB
          : (plan.memory ? Math.round(plan.memory / 1024) : 0),
        price: plan.monthly_price || 0,
      }));

      setRegions(regionsData);
      setProjects(projectsData);
      setTemplates(templatesData);
      setPlans(normalizedPlans);
      setStorageCategories(storageCategoriesData);
      setBillingCycles(billingCyclesData);

      // Установить первые значения по умолчанию
      if (!formData.location && regionsData.length > 0) {
        setFormData(prev => ({ ...prev, location: regionsData[0].slug }));
      }
      if (!formData.project && projectsData.length > 0) {
        setFormData(prev => ({ ...prev, project: projectsData[0].slug }));
      }
      if (!formData.storageCategory && storageCategoriesData.length > 0) {
        setFormData(prev => ({ ...prev, storageCategory: storageCategoriesData[0].slug }));
      }
      if (!formData.billingCycle && billingCyclesData.length > 0) {
        setFormData(prev => ({ ...prev, billingCycle: billingCyclesData[0].slug }));
      }

      console.log('API Data loaded:', {
        regions: regionsData.length,
        projects: projectsData.length,
        templates: templatesData.length,
        plans: plansData.length,
      });
    } catch (error) {
      console.error('Failed to load API data:', error);
      setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить данные из API');
    } finally {
      setLoadingData(false);
    }
  };

  // Сброс состояния при закрытии
  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      location: '',
      project: '',
      newProjectName: '',
      image: '',
      instanceConfig: '',
      volumeSize: 20,
      networkType: 'Isolated',
      publicIp: false,
      storageCategory: '',
      billingCycle: '',
      name: '',
    });
    setIsCreatingProject(false);
    setCreateError(null);
    onClose();
  };

  if (!isOpen) return null;

  const steps = [
    { id: 1, label: 'Location', icon: LuMapPin },
    { id: 2, label: 'Project', icon: LuFolder },
    { id: 3, label: 'Image', icon: LuImage },
    { id: 4, label: 'Instance', icon: LuCpu },
    { id: 5, label: 'Storage', icon: LuHardDrive },
    { id: 6, label: 'Billing', icon: LuTag },
    { id: 7, label: 'Network', icon: LuNetwork },
    { id: 8, label: 'Name', icon: LuTag },
  ];

  const handleNext = () => {
    if (currentStep < 8) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.image || !formData.instanceConfig || !formData.location || !formData.project || !formData.storageCategory || !formData.billingCycle) {
      setCreateError('Заполните все обязательные поля');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      // Используем реальные slug из API
      const vmData = {
        name: formData.name,
        hostname: formData.name.toLowerCase().replace(/\s+/g, '-'),
        cloud_provider: 'nimbo', // Cloud provider для VM
        region: formData.location, // slug из regions API
        project: formData.project, // slug из projects API
        template: formData.image, // slug из templates API
        plan: formData.instanceConfig, // slug из plans API
        disk_size: formData.volumeSize,
        network_type: formData.networkType, // 'isolated' или 'vpc'
        public_ip: formData.publicIp, // boolean, преобразуется в массив в client.ts
        storage_category: formData.storageCategory, // slug из storage categories API
        billing_cycle: formData.billingCycle, // slug из billing cycles API
      };

      console.log('Creating VM with data:', vmData);
      
      await api.virtualMachines.create(vmData);
      
      // Успешное создание - закрываем wizard
      handleClose();
      setCurrentStep(1);
      setFormData({
        location: '',
        project: '',
        newProjectName: '',
        image: '',
        instanceConfig: '',
        volumeSize: 20,
        networkType: 'isolated',
        publicIp: false,
        storageCategory: '',
        billingCycle: '',
        name: '',
      });
      setIsCreatingProject(false);
      
      // Обновить список ВМ на странице
      window.location.reload();
    } catch (error) {
      console.error('Failed to create VM:', error);
      setCreateError(error instanceof Error ? error.message : 'Ошибка создания ВМ');
    } finally {
      setIsCreating(false);
    }
  };

  const selectedRegion = regions.find(r => r.slug === formData.location);
  const selectedProject = projects.find(p => p.slug === formData.project);
  const selectedTemplate = templates.find(t => t.slug === formData.image);
  const selectedPlan = plans.find(p => p.slug === formData.instanceConfig);

  // Экран загрузки данных
  if (loadingData) {
    return (
      <Box
        position="fixed"
        inset={0}
        bg="blackAlpha.600"
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
        onClick={onClose}
      >
        <Box
          bg="white"
          borderRadius="24px"
          p="48px"
          onClick={(e) => e.stopPropagation()}
        >
          <VStack gap="24px">
            <Spinner size="xl" color="brand.500" borderWidth="3px" />
            <Text fontSize="18px" fontWeight="600" color="gray.700">
              Загрузка данных из API...
            </Text>
          </VStack>
        </Box>
      </Box>
    );
  }

  // Экран ошибки загрузки
  if (loadError) {
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
          p="48px"
          maxW="500px"
          onClick={(e) => e.stopPropagation()}
        >
          <VStack gap="24px" align="center">
            <Box
              w="72px"
              h="72px"
              borderRadius="20px"
              bg="red.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="red.500"
            >
              <LuCircleAlert size={40} />
            </Box>
            <VStack gap="12px">
              <Text fontSize="24px" fontWeight="700" color="gray.900">
                Ошибка загрузки
              </Text>
              <Text fontSize="16px" color="gray.600" textAlign="center">
                {loadError}
              </Text>
            </VStack>
            <HStack gap="12px">
              <ModernButton variant="outline" size="md" onClick={handleClose}>
                Закрыть
              </ModernButton>
              <ModernButton variant="gradient" size="md" onClick={loadAPIData}>
                Попробовать снова
              </ModernButton>
            </HStack>
          </VStack>
        </Box>
      </Box>
    );
  }

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
              <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap="16px">
                {regions.map((region) => (
                  <GridItem key={region.slug}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.location === region.slug ? '#0ea5e9' : 'gray.200'}
                      bg={formData.location === region.slug ? '#f0f9ff' : 'white'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, location: region.slug })}
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
                            bg={formData.location === region.slug ? 'brand.100' : 'gray.100'}
                            color={formData.location === region.slug ? 'brand.600' : 'gray.600'}
                          >
                            <LuMapPin size={24} />
                          </Box>
                          <VStack gap="4px" align="start">
                            <Text fontSize="18px" fontWeight="700" color="gray.900">
                              {region.name}
                            </Text>
                            {region.cloud_provider && (
                              <Text fontSize="13px" color="gray.600">
                                {region.cloud_provider.name}
                              </Text>
                            )}
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
                {templates.map((template) => (
                  <GridItem key={template.slug}>
                    <Box
                      p="16px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.image === template.slug ? '#0ea5e9' : 'gray.200'}
                      bg={formData.image === template.slug ? '#f0f9ff' : 'white'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, image: template.slug })}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: '#38bdf8',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <VStack gap="8px">
                        <Text fontSize="32px">🐧</Text>
                        <Text fontSize="13px" fontWeight="600" textAlign="center">
                          {template.name}
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
                {plans.map((plan) => (
                  <GridItem key={plan.slug}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.instanceConfig === plan.slug ? '#0ea5e9' : 'gray.200'}
                      bg={formData.instanceConfig === plan.slug ? '#f0f9ff' : 'white'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, instanceConfig: plan.slug })}
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
                          {plan.price && plan.price > 0 && (
                            <Text fontSize="14px" fontWeight="600" color="brand.600">
                              {plan.price.toLocaleString()} сўм/мес
                            </Text>
                          )}
                        </HStack>
                        <Separator borderColor="gray.200" />
                        <HStack gap="24px">
                          <HStack gap="8px">
                            <LuCpu size={20} color="#64748b" />
                            <VStack gap="0" align="start">
                              <Text fontSize="11px" color="gray.500">vCPU</Text>
                              <Text fontSize="16px" fontWeight="700" color="gray.900">
                                {plan.cpu || '?'}
                              </Text>
                            </VStack>
                          </HStack>
                          <HStack gap="8px">
                            <LuMemoryStick size={20} color="#64748b" />
                            <VStack gap="0" align="start">
                              <Text fontSize="11px" color="gray.500">vRAM</Text>
                              <Text fontSize="16px" fontWeight="700" color="gray.900">
                                {plan.ram || '?'} GB
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

          {/* Step 5: Storage Configuration */}
          {currentStep === 5 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Тип хранилища
              </Text>
              <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap="16px">
                {storageCategories.map((category) => (
                  <GridItem key={category.slug}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.storageCategory === category.slug ? '#0ea5e9' : 'gray.200'}
                      bg={formData.storageCategory === category.slug ? '#f0f9ff' : 'white'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, storageCategory: category.slug })}
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
                            bg={formData.storageCategory === category.slug ? 'brand.100' : 'gray.100'}
                            color={formData.storageCategory === category.slug ? 'brand.600' : 'gray.600'}
                          >
                            <LuHardDrive size={24} />
                          </Box>
                          <VStack gap="4px" align="start">
                            <Text fontSize="18px" fontWeight="700" color="gray.900">
                              {category.name}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>

              <Text fontSize="14px" fontWeight="600" color="gray.700" mt="16px">
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
          )}

          {/* Step 6: Billing Cycle */}
          {currentStep === 6 && (
            <VStack gap="24px" align="stretch">
              <Text fontSize="14px" fontWeight="600" color="gray.700">
                Цикл оплаты
              </Text>
              <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap="16px">
                {billingCycles.map((cycle) => (
                  <GridItem key={cycle.slug}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.billingCycle === cycle.slug ? '#0ea5e9' : 'gray.200'}
                      bg={formData.billingCycle === cycle.slug ? '#f0f9ff' : 'white'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, billingCycle: cycle.slug })}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: '#38bdf8',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <VStack gap="12px" align="start">
                        <Text fontSize="18px" fontWeight="700" color="gray.900">
                          {cycle.name}
                        </Text>
                        {cycle.description && (
                          <Text fontSize="13px" color="gray.600">
                            {cycle.description}
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          )}

          {/* Step 7: Network */}
          {currentStep === 7 && (
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
                    borderColor={formData.networkType === 'Isolated' ? '#0ea5e9' : 'gray.200'}
                    bg={formData.networkType === 'Isolated' ? '#f0f9ff' : 'white'}
                    cursor="pointer"
                    onClick={() => setFormData({ ...formData, networkType: 'Isolated' })}
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
                          bg={formData.networkType === 'Isolated' ? 'brand.100' : 'gray.100'}
                          color={formData.networkType === 'Isolated' ? 'brand.600' : 'gray.600'}
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
                    borderColor={formData.networkType === 'VPC' ? '#0ea5e9' : 'gray.200'}
                    bg={formData.networkType === 'VPC' ? '#f0f9ff' : 'white'}
                    cursor="pointer"
                    onClick={() => setFormData({ ...formData, networkType: 'VPC' })}
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
                          bg={formData.networkType === 'VPC' ? 'brand.100' : 'gray.100'}
                          color={formData.networkType === 'VPC' ? 'brand.600' : 'gray.600'}
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
                        VPC в регионе {selectedRegion?.name} с гибкой настройкой
                      </Text>
                    </VStack>
                  </Box>
                </GridItem>
              </Grid>

              <div 
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `2px solid ${formData.publicIp ? '#0ea5e9' : '#e5e7eb'}`,
                  backgroundColor: formData.publicIp ? '#f0f9ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => setFormData({ ...formData, publicIp: !formData.publicIp })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = formData.publicIp ? '#0284c7' : '#d1d5db';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = formData.publicIp ? '#0ea5e9' : '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '4px' }}>
                      Публичный IP адрес
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      Назначить публичный IP для доступа из интернета
                    </div>
                  </div>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      border: `2px solid ${formData.publicIp ? '#0ea5e9' : '#d1d5db'}`,
                      backgroundColor: formData.publicIp ? '#0ea5e9' : 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {formData.publicIp && <LuCheck size={18} color="white" strokeWidth={3} />}
                  </div>
                </div>
              </div>
            </VStack>
          )}

          {/* Step 8: Name */}
          {currentStep === 8 && (
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
                    <Text fontSize="14px" fontWeight="600">{selectedRegion?.name || '—'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Project:</Text>
                    <Text fontSize="14px" fontWeight="600">{selectedProject?.name || '—'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Image:</Text>
                    <Text fontSize="14px" fontWeight="600">{selectedTemplate?.name || '—'}</Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Instance:</Text>
                    <Text fontSize="14px" fontWeight="600">
                      {selectedPlan ? `${selectedPlan.cpu || '?'} vCPU / ${selectedPlan.ram || '?'} GB RAM` : '—'}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Storage:</Text>
                    <Text fontSize="14px" fontWeight="600">
                      {storageCategories.find(c => c.slug === formData.storageCategory)?.name || '—'} ({formData.volumeSize} GB)
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Billing:</Text>
                    <Text fontSize="14px" fontWeight="600">
                      {billingCycles.find(c => c.slug === formData.billingCycle)?.name || '—'}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="14px" color="gray.600">Network:</Text>
                    <Text fontSize="14px" fontWeight="600">
                      {formData.networkType} {formData.publicIp ? '+ Public IP' : ''}
                    </Text>
                  </HStack>
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
              {currentStep < 8 ? (
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
