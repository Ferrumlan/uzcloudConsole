import React, { useState } from 'react';
import { HStack, Text } from '@chakra-ui/react';

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'gradient' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  onClick,
  variant = 'gradient',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  fullWidth = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const sizeStyles = {
    sm: { height: '36px', padding: '0 16px', fontSize: '14px' },
    md: { height: '44px', padding: '0 24px', fontSize: '15px' },
    lg: { height: '52px', padding: '0 32px', fontSize: '16px' },
  };

  const getVariantStyles = () => {
    const baseStyles = {
      height: sizeStyles[size].height,
      padding: sizeStyles[size].padding,
      fontSize: sizeStyles[size].fontSize,
      fontWeight: 600,
      borderRadius: '12px',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative' as const,
      overflow: 'hidden',
      userSelect: 'none' as const,
      width: fullWidth ? '100%' : 'auto',
      border: 'none',
      outline: 'none',
      transform: isActive ? 'scale(0.98)' : isHovered && !disabled && !loading ? 'translateY(-2px)' : 'none',
    };

    switch (variant) {
      case 'gradient':
        return {
          ...baseStyles,
          background: isHovered && !disabled && !loading
            ? 'linear-gradient(135deg, #0284c7 0%, #9333ea 100%)'
            : 'linear-gradient(135deg, #0ea5e9 0%, #a855f7 100%)',
          color: 'white',
          boxShadow: isHovered && !disabled && !loading
            ? '0 8px 24px rgba(14, 165, 233, 0.45)'
            : '0 4px 14px rgba(14, 165, 233, 0.35)',
        };
      case 'outline':
        return {
          ...baseStyles,
          background: isHovered && !disabled && !loading ? '#f0f9ff' : 'transparent',
          color: '#0284c7',
          border: '2px solid',
          borderColor: isHovered && !disabled && !loading ? '#38bdf8' : '#bae6fd',
          boxShadow: isHovered && !disabled && !loading ? '0 4px 12px rgba(14, 165, 233, 0.15)' : 'none',
        };
      case 'ghost':
        return {
          ...baseStyles,
          background: isHovered && !disabled && !loading ? '#f3f4f6' : 'transparent',
          color: isHovered && !disabled && !loading ? '#111827' : '#374151',
        };
      case 'danger':
        return {
          ...baseStyles,
          background: isHovered && !disabled && !loading
            ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          boxShadow: isHovered && !disabled && !loading
            ? '0 8px 24px rgba(239, 68, 68, 0.45)'
            : '0 4px 14px rgba(239, 68, 68, 0.35)',
        };
      case 'success':
        return {
          ...baseStyles,
          background: isHovered && !disabled && !loading
            ? 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)'
            : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white',
          boxShadow: isHovered && !disabled && !loading
            ? '0 8px 24px rgba(34, 197, 94, 0.45)'
            : '0 4px 14px rgba(34, 197, 94, 0.35)',
        };
      default:
        return baseStyles;
    }
  };

  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsActive(false); }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      disabled={disabled || loading}
      style={getVariantStyles()}
    >
      {loading ? (
        <HStack gap="8px">
          <div
            style={{
              width: '16px',
              height: '16px',
              border: '2px solid currentColor',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <Text>Загрузка...</Text>
        </HStack>
      ) : (
        <HStack gap="8px">
          {icon && <span>{icon}</span>}
          <Text>{children}</Text>
        </HStack>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};
