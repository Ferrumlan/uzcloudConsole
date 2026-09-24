import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Heading, Input, Grid, GridItem, Separator, Button, IconButton } from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';
import { api } from '../api/client';
import type { Project, Region, Template, Plan } from '../api/types';
import { LuX, LuChevronRight, LuChevronLeft, LuCheck, LuServer, LuCpu, LuMemoryStick, LuHardDrive, LuMapPin, LuDollarSign } from 'react-icons/lu';

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

  // Загрузка данных из API при открытии wizard
  useEffect(() => {
    if (isOpen) {
      loadAPIData();
    }
  }, [isOpen]);

  const loadAPIData = async () => {
    setLoadingData(true);
    try {
      const [regionsData, projectsData, templatesData, plansData, storageCategoriesData, billingCyclesData] = await Promise.all([
        api.regions.list(),
        api.projects.list(),
        api.templates.list(),
        api.plans.listVMPlans(),
        api.storageCategories.list(),
        api.billingCycles.list(),
      ]);

      const normalizedPlans = plansData.map((plan: any) => ({
        ...plan,
        cpu: plan.attribute?.cpu || plan.cpu || 0,
        ram: plan.attribute?.memory ? Math.round(plan.attribute.memory / 1024) : 0,
        price: plan.monthly_price || 0,
      }));

      setRegions(regionsData);
      setProjects(projectsData);
      setTemplates(templatesData);
      setPlans(normalizedPlans);
      setStorageCategories(storageCategoriesData);
      setBillingCycles(billingCyclesData);

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
    } catch (error) {
      console.error('Failed to load API data:', error);
    } finally {
      setLoadingData(false);
    }
  };

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
    setCreateError(null);
    onClose();
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.image || !formData.instanceConfig || !formData.location || !formData.project) {
      setCreateError('Заполните все обязательные поля');
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const networkPlan = formData.networkType === 'Isolated' 
        ? (formData.location === 'staging' ? 'default-isolated' : 'isolated')
        : 'isolated';

      const vmData = {
        name: formData.name,
        hostname: formData.name.toLowerCase().replace(/\s+/g, '-'),
        cloud_provider: 'nimbo',
        region: formData.location,
        project: formData.project,
        template: formData.image,
        plan: formData.instanceConfig,
        disk_size: formData.volumeSize,
        network_type: formData.networkType,
        network_plan: networkPlan,
        public_ip: formData.publicIp,
        storage_category: formData.storageCategory,
        billing_cycle: formData.billingCycle,
      };

      await api.virtualMachines.create(vmData);
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error('Failed to create VM:', error);
      setCreateError(error instanceof Error ? error.message : 'Ошибка создания ВМ');
    } finally {
      setIsCreating(false);
    }
  };

  // Расчёт стоимости
  const selectedPlan = plans.find(p => p.slug === formData.instanceConfig);
  const hourlyPrice = selectedPlan ? (selectedPlan.price || 0) / 730 : 0;
  const monthlyPrice = selectedPlan?.price || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!isOpen) return null;

  const steps = [
    { id: 1, label: 'Region', icon: LuMapPin },
    { id: 2, label: 'Project', icon: LuServer },
    { id: 3, label: 'Image', icon: LuServer },
    { id: 4, label: 'Size', icon: LuCpu },
    { id: 5, label: 'Storage', icon: LuHardDrive },
    { id: 6, label: 'Network', icon: LuServer },
    { id: 7, label: 'Name', icon: LuServer },
  ];

  return (
    <Box
      position="fixed"
      inset={0}
      bg="var(--bg-secondary)"
      zIndex={9999}
      display="flex"
      flexDirection="column"
    >
      {/* Header */}
      <Box
        bg="var(--card-bg)"
        borderBottom="1px solid"
        borderBottomColor="var(--border-color)"
        px="24px"
        py="16px"
      >
        <HStack justify="space-between">
          <HStack gap="16px">
            <IconButton
              aria-label="Close"
              variant="ghost"
              size="sm"
              onClick={handleClose}
              borderRadius="8px"
            >
              <LuX size={20} />
            </IconButton>
            <VStack gap="0" align="start">
              <Heading size="lg" fontWeight="700" color="var(--text-primary)">
                Create Virtual Machine
              </Heading>
              <Text fontSize="14px" color="var(--text-secondary)">
                Step {currentStep} of {steps.length}
              </Text>
            </VStack>
          </HStack>
          <HStack gap="12px">
            <Button
              variant="outline"
              size="md"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              borderRadius="8px"
            >
              <LuChevronLeft size={18} />
              Back
            </Button>
            {currentStep < steps.length ? (
              <Button
                bg="linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
                color="white"
                size="md"
                onClick={() => setCurrentStep(currentStep + 1)}
                borderRadius="8px"
              >
                Next
                <LuChevronRight size={18} />
              </Button>
            ) : (
              <Button
                bg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                color="white"
                size="md"
                onClick={handleCreate}
                loading={isCreating}
                borderRadius="8px"
              >
                <LuCheck size={18} />
                Create VM
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} display="flex" overflow="hidden">
        {/* Left: Steps */}
        <Box flex={1} overflowY="auto" p="32px">
          {createError && (
            <Box mb="24px" p="16px" borderRadius="12px" bg="red.50" border="1px solid" borderColor="red.200">
              <Text fontSize="14px" color="red.700" fontWeight="500">
                {createError}
              </Text>
            </Box>
          )}

          {/* Step 1: Region */}
          {currentStep === 1 && (
            <VStack gap="24px" align="stretch">
              <Heading size="md" fontWeight="700" color="var(--text-primary)">
                Select Region
              </Heading>
              <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap="16px">
                {regions.map((region) => (
                  <GridItem key={region.slug}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.location === region.slug ? '#3b82f6' : 'var(--border-color)'}
                      bg={formData.location === region.slug ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, location: region.slug })}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: '#3b82f6',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <VStack gap="12px" align="start">
                        <LuMapPin size={24} color={formData.location === region.slug ? '#3b82f6' : 'var(--text-secondary)'} />
                        <Text fontSize="16px" fontWeight="600" color="var(--text-primary)">
                          {region.name}
                        </Text>
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
              <Heading size="md" fontWeight="700" color="var(--text-primary)">
                Select Project
              </Heading>
              <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap="16px">
                {projects.map((project) => (
                  <GridItem key={project.slug}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.project === project.slug ? '#3b82f6' : 'var(--border-color)'}
                      bg={formData.project === project.slug ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, project: project.slug })}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: '#3b82f6',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <VStack gap="12px" align="start">
                        <LuServer size={24} color={formData.project === project.slug ? '#3b82f6' : 'var(--text-secondary)'} />
                        <Text fontSize="16px" fontWeight="600" color="var(--text-primary)">
                          {project.name}
                        </Text>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          )}

          {/* Step 3: Image */}
          {currentStep === 3 && (
            <VStack gap="24px" align="stretch">
              <Heading size="md" fontWeight="700" color="var(--text-primary)">
                Select Operating System
              </Heading>
              <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap="16px">
                {templates.map((template) => (
                  <GridItem key={template.slug}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.image === template.slug ? '#3b82f6' : 'var(--border-color)'}
                      bg={formData.image === template.slug ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, image: template.slug })}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: '#3b82f6',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <VStack gap="12px" align="start">
                        <Text fontSize="32px">🐧</Text>
                        <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                          {template.name}
                        </Text>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          )}

          {/* Step 4: Size */}
          {currentStep === 4 && (
            <VStack gap="24px" align="stretch">
              <Heading size="md" fontWeight="700" color="var(--text-primary)">
                Select Instance Size
              </Heading>
              <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap="16px">
                {plans.map((plan) => (
                  <GridItem key={plan.slug}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.instanceConfig === plan.slug ? '#3b82f6' : 'var(--border-color)'}
                      bg={formData.instanceConfig === plan.slug ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, instanceConfig: plan.slug })}
                      transition="all 0.2s"
                      _hover={{
                        borderColor: '#3b82f6',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <VStack gap="12px" align="start">
                        <HStack justify="space-between" w="100%">
                          <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
                            {plan.name}
                          </Text>
                          <Text fontSize="14px" fontWeight="600" color="#3b82f6">
                            {formatCurrency(plan.price || 0)}/mo
                          </Text>
                        </HStack>
                        <Separator borderColor="var(--border-color)" />
                        <HStack gap="16px">
                          <HStack gap="4px">
                            <LuCpu size={16} color="var(--text-secondary)" />
                            <Text fontSize="13px" fontWeight="600" color="var(--text-primary)">
                              {plan.cpu || '?'} vCPU
                            </Text>
                          </HStack>
                          <HStack gap="4px">
                            <LuMemoryStick size={16} color="var(--text-secondary)" />
                            <Text fontSize="13px" fontWeight="600" color="var(--text-primary)">
                              {plan.ram || '?'} GB
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

          {/* Step 5: Storage */}
          {currentStep === 5 && (
            <VStack gap="24px" align="stretch">
              <Heading size="md" fontWeight="700" color="var(--text-primary)">
                Select Storage Size
              </Heading>
              <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap="16px">
                {volumeSizes.map((size) => (
                  <GridItem key={size}>
                    <Box
                      p="20px"
                      borderRadius="12px"
                      borderWidth="2px"
                      borderColor={formData.volumeSize === size ? '#3b82f6' : 'var(--border-color)'}
                      bg={formData.volumeSize === size ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                      cursor="pointer"
                      onClick={() => setFormData({ ...formData, volumeSize: size })}
                      transition="all 0.2s"
                      textAlign="center"
                      _hover={{
                        borderColor: '#3b82f6',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      <VStack gap="8px">
                        <LuHardDrive size={24} color={formData.volumeSize === size ? '#3b82f6' : 'var(--text-secondary)'} />
                        <Text fontSize="18px" fontWeight="700" color="var(--text-primary)">
                          {size} GB
                        </Text>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>
          )}

          {/* Step 6: Network */}
          {currentStep === 6 && (
            <VStack gap="24px" align="stretch">
              <Heading size="md" fontWeight="700" color="var(--text-primary)">
                Network Configuration
              </Heading>
              <VStack gap="16px" align="stretch">
                <Text fontSize="14px" fontWeight="600" color="var(--text-secondary)">
                  Network Type
                </Text>
                <HStack gap="16px">
                  <Box
                    flex={1}
                    p="20px"
                    borderRadius="12px"
                    borderWidth="2px"
                    borderColor={formData.networkType === 'Isolated' ? '#3b82f6' : 'var(--border-color)'}
                    bg={formData.networkType === 'Isolated' ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                    cursor="pointer"
                    onClick={() => setFormData({ ...formData, networkType: 'Isolated' })}
                    transition="all 0.2s"
                  >
                    <VStack gap="8px" align="start">
                      <Text fontSize="16px" fontWeight="600" color="var(--text-primary)">
                        Isolated
                      </Text>
                      <Text fontSize="13px" color="var(--text-secondary)">
                        Private network
                      </Text>
                    </VStack>
                  </Box>
                  <Box
                    flex={1}
                    p="20px"
                    borderRadius="12px"
                    borderWidth="2px"
                    borderColor={formData.networkType === 'VPC' ? '#3b82f6' : 'var(--border-color)'}
                    bg={formData.networkType === 'VPC' ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                    cursor="pointer"
                    onClick={() => setFormData({ ...formData, networkType: 'VPC' })}
                    transition="all 0.2s"
                  >
                    <VStack gap="8px" align="start">
                      <Text fontSize="16px" fontWeight="600" color="var(--text-primary)">
                        VPC
                      </Text>
                      <Text fontSize="13px" color="var(--text-secondary)">
                        Virtual Private Cloud
                      </Text>
                    </VStack>
                  </Box>
                </HStack>

                <Box
                  p="16px"
                  borderRadius="12px"
                  borderWidth="2px"
                  borderColor={formData.publicIp ? '#3b82f6' : 'var(--border-color)'}
                  bg={formData.publicIp ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                  cursor="pointer"
                  onClick={() => setFormData({ ...formData, publicIp: !formData.publicIp })}
                  transition="all 0.2s"
                >
                  <HStack justify="space-between">
                    <VStack gap="4px" align="start">
                      <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                        Public IP Address
                      </Text>
                      <Text fontSize="13px" color="var(--text-secondary)">
                        Assign a public IP for internet access
                      </Text>
                    </VStack>
                    <Box
                      w="24px"
                      h="24px"
                      borderRadius="6px"
                      borderWidth="2px"
                      borderColor={formData.publicIp ? '#3b82f6' : 'var(--border-color)'}
                      bg={formData.publicIp ? '#3b82f6' : 'transparent'}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {formData.publicIp && <LuCheck size={16} color="white" />}
                    </Box>
                  </HStack>
                </Box>
              </VStack>
            </VStack>
          )}

          {/* Step 7: Name */}
          {currentStep === 7 && (
            <VStack gap="24px" align="stretch">
              <Heading size="md" fontWeight="700" color="var(--text-primary)">
                Name Your Virtual Machine
              </Heading>
              <VStack gap="12px" align="stretch">
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., web-server-01, api-instance"
                  size="lg"
                  borderRadius="12px"
                  borderWidth="2px"
                />
                <Text fontSize="13px" color="var(--text-secondary)">
                  Use a descriptive name to identify your server
                </Text>
              </VStack>
            </VStack>
          )}
        </Box>

        {/* Right: Summary Sidebar */}
        <Box
          w="400px"
          bg="var(--card-bg)"
          borderLeft="1px solid"
          borderLeftColor="var(--border-color)"
          p="32px"
          overflowY="auto"
        >
          <VStack gap="24px" align="stretch">
            <Heading size="md" fontWeight="700" color="var(--text-primary)">
              Configuration Summary
            </Heading>

            <VStack gap="16px" align="stretch">
              <HStack justify="space-between">
                <Text fontSize="14px" color="var(--text-secondary)">Region</Text>
                <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                  {regions.find(r => r.slug === formData.location)?.name || '—'}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="14px" color="var(--text-secondary)">Project</Text>
                <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                  {projects.find(p => p.slug === formData.project)?.name || '—'}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="14px" color="var(--text-secondary)">Image</Text>
                <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                  {templates.find(t => t.slug === formData.image)?.name || '—'}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="14px" color="var(--text-secondary)">Size</Text>
                <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                  {selectedPlan ? `${selectedPlan.cpu || '?'} vCPU / ${selectedPlan.ram || '?'} GB` : '—'}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="14px" color="var(--text-secondary)">Storage</Text>
                <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                  {formData.volumeSize} GB
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="14px" color="var(--text-secondary)">Network</Text>
                <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                  {formData.networkType} {formData.publicIp ? '+ Public IP' : ''}
                </Text>
              </HStack>
            </VStack>

            <Separator borderColor="var(--border-color)" />

            <VStack gap="12px" align="stretch">
              <HStack justify="space-between">
                <Text fontSize="14px" color="var(--text-secondary)">Estimated Hourly Cost</Text>
                <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
                  {formatCurrency(hourlyPrice)}
                </Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="14px" color="var(--text-secondary)">Estimated Monthly Cost</Text>
                <Text fontSize="20px" fontWeight="700" color="#3b82f6">
                  {formatCurrency(monthlyPrice)}
                </Text>
              </HStack>
            </VStack>

            <Box p="16px" borderRadius="12px" bg="var(--bg-secondary)">
              <VStack gap="8px" align="start">
                <HStack gap="8px">
                  <LuDollarSign size={16} color="#3b82f6" />
                  <Text fontSize="13px" fontWeight="600" color="var(--text-primary)">
                    Pricing is estimated
                  </Text>
                </HStack>
                <Text fontSize="12px" color="var(--text-secondary)">
                  Final price may vary based on actual usage and additional services.
                </Text>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
};
