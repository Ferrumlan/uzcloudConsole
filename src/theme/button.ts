import { defineRecipe } from '@chakra-ui/react';

export const buttonRecipe = defineRecipe({
  className: 'chakra-button',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    borderRadius: 'lg',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    '&:focus-visible': {
      boxShadow: '0 0 0 3px rgba(14, 165, 233, 0.3)',
    },
    '&:disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    '&:active:not(:disabled)': {
      transform: 'scale(0.98)',
    },
  },
  variants: {
    size: {
      xs: {
        h: '32px',
        px: '12px',
        fontSize: '13px',
        gap: '6px',
      },
      sm: {
        h: '36px',
        px: '16px',
        fontSize: '14px',
        gap: '8px',
      },
      md: {
        h: '42px',
        px: '20px',
        fontSize: '15px',
        gap: '8px',
      },
      lg: {
        h: '48px',
        px: '28px',
        fontSize: '16px',
        gap: '10px',
      },
      xl: {
        h: '56px',
        px: '36px',
        fontSize: '17px',
        gap: '12px',
      },
    },
    variant: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
        '&:hover:not(:disabled)': {
          bg: 'brand.600',
          boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)',
          transform: 'translateY(-2px)',
        },
      },
      gradient: {
        bgGradient: 'to-r',
        gradientFrom: 'brand.500',
        gradientTo: 'accent.500',
        color: 'white',
        boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
        '&:hover:not(:disabled)': {
          bgGradient: 'to-r',
          gradientFrom: 'brand.600',
          gradientTo: 'accent.600',
          boxShadow: '0 8px 24px rgba(14, 165, 233, 0.45)',
          transform: 'translateY(-3px)',
        },
      },
      outline: {
        bg: 'transparent',
        color: 'brand.600',
        borderWidth: '2px',
        borderColor: 'brand.200',
        '&:hover:not(:disabled)': {
          bg: 'brand.50',
          borderColor: 'brand.400',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)',
        },
      },
      ghost: {
        bg: 'transparent',
        color: 'gray.700',
        '&:hover:not(:disabled)': {
          bg: 'gray.100',
          color: 'gray.900',
        },
      },
      danger: {
        bg: 'danger.500',
        color: 'white',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        '&:hover:not(:disabled)': {
          bg: 'danger.600',
          boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
          transform: 'translateY(-2px)',
        },
      },
      success: {
        bg: 'success.500',
        color: 'white',
        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)',
        '&:hover:not(:disabled)': {
          bg: 'success.600',
          boxShadow: '0 6px 20px rgba(34, 197, 94, 0.4)',
          transform: 'translateY(-2px)',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
  },
});
