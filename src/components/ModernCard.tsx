import React from 'react';
import { Box, VStack, HStack, Text, Heading } from '@chakra-ui/react';

interface ModernCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  padding?: string;
  hover?: boolean;
  onClick?: () => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  title,
  subtitle,
  icon,
  padding = '24px',
  hover = false,
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Box
      bg="white"
      borderRadius="20px"
      padding={padding}
      boxShadow={hover && isHovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'}
      border="1px solid"
      borderColor="gray.100"
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      cursor={onClick ? 'pointer' : 'default'}
      transform={hover && isHovered ? 'translateY(-4px)' : 'none'}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      onClick={onClick}
    >
      {(title || icon) && (
        <VStack align="stretch" gap="16px" marginBottom="20px">
          <HStack gap="12px">
            {icon && (
              <Box
                p="12px"
                borderRadius="12px"
                bg="linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)"
                color="brand.600"
              >
                {icon}
              </Box>
            )}
            <VStack align="stretch" gap="4px" flex="1">
              {title && (
                <Heading size="xl" color="gray.900" fontWeight="700">
                  {title}
                </Heading>
              )}
              {subtitle && (
                <Text fontSize="14px" color="gray.500" fontWeight="500">
                  {subtitle}
                </Text>
              )}
            </VStack>
          </HStack>
        </VStack>
      )}
      {children}
    </Box>
  );
};
