import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Text, Heading, Input, Grid, GridItem, Separator, Button, IconButton } from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';
import { api } from '../api/client';
import type { Project, Region, Template, Plan } from '../api/types';
import { LuX, LuCheck, LuServer, LuCpu, LuMemoryStick, LuHardDrive, LuMapPin, LuDollarSign } from 'react-icons/lu';

interface VMCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const volumeSizes = [20, 50, 100, 200, 500, 1000];

// Структура образов по категориям и дистрибутивам
const imageCategories = {
  linux: {
    label: 'Linux',
    icon: '🐧',
    distributions: [
      {
        name: 'Ubuntu',
        icon: '🟠',
        versions: [
          { id: 'ubuntu-2404-lts-1', name: '24.04 LTS' },
          { id: 'ubuntu-2204-lts', name: '22.04 LTS' },
        ]
      },
      {
        name: 'CentOS',
        icon: '🎩',
        versions: [
          { id: 'centos-stream-10', name: 'Stream 10' },
          { id: 'centos-9', name: '9' },
          { id: 'centos-7-1', name: '7' },
        ]
      },
      {
        name: 'Debian',
        icon: '🌀',
        versions: [
          { id: 'debian-13', name: '13' },
          { id: 'debian-12-2', name: '12' },
          { id: 'debian-11', name: '11' },
        ]
      },
      {
        name: 'Rocky Linux',
        icon: '🪨',
        versions: [
          { id: 'rocky-linux-97', name: '9.7' },
          { id: 'rocky-linux-8', name: '8' },
        ]
      },
      {
        name: 'AlmaLinux',
        icon: '🦬',
        versions: [
          { id: 'almalinux-9-1', name: '9' },
          { id: 'almalinux-8', name: '8' },
        ]
      },
      {
        name: 'SUSE',
        icon: '🦎',
        versions: [
          { id: 'suse-16', name: '16' },
        ]
      },
    ]
  },
  windows: {
    label: 'Windows',
    icon: '🪟',
    distributions: [
      {
        name: 'Windows Server',
        icon: '🪟',
        versions: [
          { id: 'windows-server-2025', name: '2025' },
          { id: 'windows-server-2022', name: '2022' },
          { id: 'windows-server-2019', name: '2019' },
        ]
      },
    ]
  },
  marketplace: {
    label: 'Marketplace Apps',
    icon: '🛍️',
    distributions: [
      {
        name: 'PBX & Communication',
        icon: '📞',
        versions: [
          { id: 'freepbx', name: 'FREEPBX' },
          { id: 'issabel4', name: 'ISSABEL4' },
        ]
      },
      {
        name: 'Firewall & Security',
        icon: '🔥',
        versions: [
          { id: 'opnsense-2616', name: 'OPNsense 26.1.6' },
          { id: 'pfsense27', name: 'pfSense 2.7' },
        ]
      },
    ]
  }
};

export const VMCreateWizard: React.FC<VMCreateWizardProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    location: '',
    project: '',
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
  const [selectedCategory, setSelectedCategory] = useState<'linux' | 'windows' | 'marketplace'>('linux');

  // Данные из API
  const [regions, setRegions] = useState<Region[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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
      const [regionsData, projectsData, plansData, storageCategoriesData, billingCyclesData] = await Promise.all([
        api.regions.list(),
        api.projects.list(),
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
      console.error('Failed to load API ', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleClose = () => {
    setFormData({
      location: '',
      project: '',
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
            </VStack>
          </HStack>
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
        </HStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} display="flex" overflow="hidden">
        {/* Left: Configuration */}
        <Box flex={1} overflowY="auto" p="32px">
          {createError && (
            <Box mb="24px" p="16px" borderRadius="12px" bg="red.50" border="1px solid" borderColor="red.200">
              <Text fontSize="14px" color="red.700" fontWeight="500">
                {createError}
              </Text>
            </Box>
          )}

          <VStack gap="32px" align="stretch">
            {/* Region */}
            <VStack gap="16px" align="stretch">
              <Heading size="sm" fontWeight="700" color="var(--text-primary)">
                Region
              </Heading>
              <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap="12px">
                {regions.map((region) => (
                  <GridItem key={region.slug}>
                    <Box
                      p="16px"
                      borderRadius="10px"
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
                      <HStack gap="12px">
                        <LuMapPin size={20} color={formData.location === region.slug ? '#3b82f6' : 'var(--text-secondary)'} />
                        <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                          {region.name}
                        </Text>
                      </HStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>

            {/* Project */}
            <VStack gap="16px" align="stretch">
              <Heading size="sm" fontWeight="700" color="var(--text-primary)">
                Project
              </Heading>
              <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap="12px">
                {projects.map((project) => (
                  <GridItem key={project.slug}>
                    <Box
                      p="16px"
                      borderRadius="10px"
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
                      <HStack gap="12px">
                        <LuServer size={20} color={formData.project === project.slug ? '#3b82f6' : 'var(--text-secondary)'} />
                        <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                          {project.name}
                        </Text>
                      </HStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>

            {/* Operating System */}
            <VStack gap="16px" align="stretch">
              <Heading size="sm" fontWeight="700" color="var(--text-primary)">
                Operating System
              </Heading>
              
              {/* Category Tabs */}
              <HStack gap="8px">
                <Button
                  size="md"
                  variant={selectedCategory === 'linux' ? 'solid' : 'ghost'}
                  colorPalette={selectedCategory === 'linux' ? 'blue' : 'gray'}
                  onClick={() => setSelectedCategory('linux')}
                  borderRadius="8px"
                >
                  <HStack gap="8px">
                    <span>🐧</span>
                    <span>Linux</span>
                  </HStack>
                </Button>
                <Button
                  size="md"
                  variant={selectedCategory === 'windows' ? 'solid' : 'ghost'}
                  colorPalette={selectedCategory === 'windows' ? 'blue' : 'gray'}
                  onClick={() => setSelectedCategory('windows')}
                  borderRadius="8px"
                >
                  <HStack gap="8px">
                    <span>🪟</span>
                    <span>Windows</span>
                  </HStack>
                </Button>
                <Button
                  size="md"
                  variant={selectedCategory === 'marketplace' ? 'solid' : 'ghost'}
                  colorPalette={selectedCategory === 'marketplace' ? 'blue' : 'gray'}
                  onClick={() => setSelectedCategory('marketplace')}
                  borderRadius="8px"
                >
                  <HStack gap="8px">
                    <span>🛍️</span>
                    <span>Marketplace Apps</span>
                  </HStack>
                </Button>
              </HStack>

              {/* Distributions Grid */}
              <VStack gap="20px" align="stretch">
                {imageCategories[selectedCategory].distributions.map((dist: any) => (
                  <VStack key={dist.name} gap="12px" align="stretch">
                    <HStack gap="8px">
                      <Text fontSize="24px">{dist.icon}</Text>
                      <Text fontSize="16px" fontWeight="600" color="var(--text-primary)">
                        {dist.name}
                      </Text>
                    </HStack>
                    <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap="12px">
                      {dist.versions.map((version: any) => (
                        <GridItem key={version.id}>
                          <Box
                            p="16px"
                            borderRadius="10px"
                            borderWidth="2px"
                            borderColor={formData.image === version.id ? '#3b82f6' : 'var(--border-color)'}
                            bg={formData.image === version.id ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                            cursor="pointer"
                            onClick={() => setFormData({ ...formData, image: version.id })}
                            transition="all 0.2s"
                            textAlign="center"
                            _hover={{
                              borderColor: '#3b82f6',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            }}
                          >
                            <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                              {version.name}
                            </Text>
                          </Box>
                        </GridItem>
                      ))}
                    </Grid>
                  </VStack>
                ))}
              </VStack>
            </VStack>

            {/* Instance Size */}
            <VStack gap="16px" align="stretch">
              <Heading size="sm" fontWeight="700" color="var(--text-primary)">
                Instance Size
              </Heading>
              <Grid templateColumns="repeat(auto-fill, minmax(200px, 1fr))" gap="12px">
                {plans.map((plan) => (
                  <GridItem key={plan.slug}>
                    <Box
                      p="16px"
                      borderRadius="10px"
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
                          <Text fontSize="14px" fontWeight="700" color="var(--text-primary)">
                            {plan.name}
                          </Text>
                          <Text fontSize="13px" fontWeight="600" color="#3b82f6">
                            {formatCurrency(plan.price || 0)}/mo
                          </Text>
                        </HStack>
                        <Separator borderColor="var(--border-color)" />
                        <HStack gap="12px">
                          <HStack gap="4px">
                            <LuCpu size={14} color="var(--text-secondary)" />
                            <Text fontSize="12px" fontWeight="600" color="var(--text-primary)">
                              {plan.cpu || '?'} vCPU
                            </Text>
                          </HStack>
                          <HStack gap="4px">
                            <LuMemoryStick size={14} color="var(--text-secondary)" />
                            <Text fontSize="12px" fontWeight="600" color="var(--text-primary)">
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

            {/* Storage */}
            <VStack gap="16px" align="stretch">
              <Heading size="sm" fontWeight="700" color="var(--text-primary)">
                Storage Size
              </Heading>
              <Grid templateColumns="repeat(auto-fill, minmax(120px, 1fr))" gap="12px">
                {volumeSizes.map((size) => (
                  <GridItem key={size}>
                    <Box
                      p="16px"
                      borderRadius="10px"
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
                        <LuHardDrive size={20} color={formData.volumeSize === size ? '#3b82f6' : 'var(--text-secondary)'} />
                        <Text fontSize="16px" fontWeight="700" color="var(--text-primary)">
                          {size} GB
                        </Text>
                      </VStack>
                    </Box>
                  </GridItem>
                ))}
              </Grid>
            </VStack>

            {/* Network */}
            <VStack gap="16px" align="stretch">
              <Heading size="sm" fontWeight="700" color="var(--text-primary)">
                Network Configuration
              </Heading>
              <HStack gap="12px">
                <Box
                  flex={1}
                  p="16px"
                  borderRadius="10px"
                  borderWidth="2px"
                  borderColor={formData.networkType === 'Isolated' ? '#3b82f6' : 'var(--border-color)'}
                  bg={formData.networkType === 'Isolated' ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                  cursor="pointer"
                  onClick={() => setFormData({ ...formData, networkType: 'Isolated' })}
                  transition="all 0.2s"
                >
                  <VStack gap="8px" align="start">
                    <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                      Isolated
                    </Text>
                    <Text fontSize="12px" color="var(--text-secondary)">
                      Private network
                    </Text>
                  </VStack>
                </Box>
                <Box
                  flex={1}
                  p="16px"
                  borderRadius="10px"
                  borderWidth="2px"
                  borderColor={formData.networkType === 'VPC' ? '#3b82f6' : 'var(--border-color)'}
                  bg={formData.networkType === 'VPC' ? 'var(--bg-secondary)' : 'var(--card-bg)'}
                  cursor="pointer"
                  onClick={() => setFormData({ ...formData, networkType: 'VPC' })}
                  transition="all 0.2s"
                >
                  <VStack gap="8px" align="start">
                    <Text fontSize="14px" fontWeight="600" color="var(--text-primary)">
                      VPC
                    </Text>
                    <Text fontSize="12px" color="var(--text-secondary)">
                      Virtual Private Cloud
                    </Text>
                  </VStack>
                </Box>
              </HStack>

              <Box
                p="16px"
                borderRadius="10px"
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
                    <Text fontSize="12px" color="var(--text-secondary)">
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

            {/* VM Name */}
            <VStack gap="16px" align="stretch">
              <Heading size="sm" fontWeight="700" color="var(--text-primary)">
                Virtual Machine Name
              </Heading>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., web-server-01, api-instance"
                size="lg"
                borderRadius="10px"
                borderWidth="2px"
              />
            </VStack>
          </VStack>
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
                  {(() => {
                    for (const cat of Object.values(imageCategories)) {
                      for (const dist of cat.distributions) {
                        const version = dist.versions.find((v: any) => v.id === formData.image);
                        if (version) return `${dist.name} ${version.name}`;
                      }
                    }
                    return '—';
                  })()}
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
