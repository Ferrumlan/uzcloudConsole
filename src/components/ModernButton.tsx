import React, { useState } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';

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
      borderRadius: '10px',
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
            ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: 'white',
          boxShadow: isHovered && !disabled && !loading
            ? '0 8px 24px rgba(59, 130, 246, 0.45)'
            : '0 4px 14px rgba(59, 130, 246, 0.35)',
        };
      case 'outline':
        return {
          ...baseStyles,
          background: isHovered && !disabled && !loading ? 'var(--bg-secondary)' : 'transparent',
          color: '#3b82f6',
          border: '2px solid',
          borderColor: isHovered && !disabled && !loading ? '#3b82f6' : '#bfdbfe',
          boxShadow: isHovered && !disabled && !loading ? '0 4px 12px rgba(59, 130, 246, 0.15)' : 'none',
        };
      case 'ghost':
        return {
          ...baseStyles,
          background: isHovered && !disabled && !loading ? 'var(--bg-secondary)' : 'transparent',
          color: isHovered && !disabled && !loading ? 'var(--text-primary)' : 'var(--text-secondary)',
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
            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          boxShadow: isHovered && !disabled && !loading
            ? '0 8px 24px rgba(16, 185, 129, 0.45)'
            : '0 4px 14px rgba(16, 185, 129, 0.35)',
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
          <Text>Loading...</Text>
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
