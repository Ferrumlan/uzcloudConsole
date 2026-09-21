import React from 'react';
import { Box, VStack, Text, Heading, Badge } from '@chakra-ui/react';
import { ModernCard } from '../components/ModernCard';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description, icon }) => {
  return (
    <Box>
      <VStack gap="32px" align="stretch">
        <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">
          {title}
        </Heading>
        <ModernCard>
          <VStack gap="24px" py="64px">
            <Box color="gray.300" fontSize="64px">
              {icon}
            </Box>
            <VStack gap="12px">
              <Heading size="lg" fontWeight="700" color="gray.700">
                Раздел в разработке
              </Heading>
              <Text fontSize="16px" color="gray.500" textAlign="center" maxW="500px">
                {description}
              </Text>
              <Badge colorPalette="orange" variant="subtle" borderRadius="8px" px="12px" py="6px" fontSize="14px" fontWeight="600">
                Заблокировано вендором
              </Badge>
            </VStack>
          </VStack>
        </ModernCard>
      </VStack>
    </Box>
  );
};
