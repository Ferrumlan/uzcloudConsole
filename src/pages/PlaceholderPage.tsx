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
        <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em" color="var(--text-primary)">
          {title}
        </Heading>
        <ModernCard>
          <VStack gap="24px" py="64px">
            <Box color="var(--text-tertiary)" fontSize="64px">
              {icon}
            </Box>
            <VStack gap="12px">
              <Heading size="lg" fontWeight="700" color="var(--text-primary)">
                Coming Soon
              </Heading>
              <Text fontSize="16px" color="var(--text-secondary)" textAlign="center" maxW="500px">
                {description}
              </Text>
              <Badge colorPalette="blue" variant="subtle" borderRadius="8px" px="12px" py="6px" fontSize="14px" fontWeight="600">
                In Development
              </Badge>
            </VStack>
          </VStack>
        </ModernCard>
      </VStack>
    </Box>
  );
};
