import React, { useState } from 'react';
import { Box, VStack, HStack, Text, Heading, Input } from '@chakra-ui/react';
import { useApp } from '../contexts/AppContext';
import { ModernButton } from '../components/ModernButton';
import { LuCloud } from 'react-icons/lu';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bgGradient="linear(to-br, #f0f9ff, #faf5ff, #e0f2fe)"
      p="24px"
    >
      <Box
        bg="white"
        borderRadius="24px"
        p="48px"
        w="100%"
        maxW="440px"
        boxShadow="0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      >
        <VStack gap="32px" align="stretch">
          <VStack gap="16px">
            <Box
              w="72px"
              h="72px"
              borderRadius="20px"
              bgGradient="linear(to-br, #0ea5e9, #a855f7)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontSize="32px"
            >
              <LuCloud />
            </Box>
            <VStack gap="8px">
              <Heading size="2xl" fontWeight="800" letterSpacing="-0.03em">
                UzCloud Console
              </Heading>
              <Text fontSize="16px" color="gray.600" fontWeight="500">
                Управление облачной инфраструктурой
              </Text>
            </VStack>
          </VStack>

          <form onSubmit={handleSubmit}>
            <VStack gap="20px" align="stretch">
              <VStack gap="8px" align="stretch">
                <Text fontSize="14px" fontWeight="600" color="gray.700">
                  Email
                </Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.uz"
                  size="lg"
                  borderRadius="12px"
                  borderWidth="2px"
                  _focus={{
                    borderColor: '#0ea5e9',
                    boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
                  }}
                />
              </VStack>

              <VStack gap="8px" align="stretch">
                <Text fontSize="14px" fontWeight="600" color="gray.700">
                  Пароль
                </Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  size="lg"
                  borderRadius="12px"
                  borderWidth="2px"
                  _focus={{
                    borderColor: '#0ea5e9',
                    boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.1)',
                  }}
                />
              </VStack>

              <ModernButton variant="gradient" size="lg" fullWidth loading={isLoading}>
                Войти
              </ModernButton>
            </VStack>
          </form>
        </VStack>
      </Box>
    </Box>
  );
};
