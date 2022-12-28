import { ComponentProps, ElementRef, forwardRef } from 'react';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { CSS, styled, VariantProps } from '../styles/stitches.config';

const StyledThumb = styled(SwitchPrimitive.Thumb, {
  position: 'absolute',
  left: 0,
  width: 16,
  height: 16,
  backgroundColor: '$neutral100',
  borderRadius: '$round',
  boxShadow: 'rgba(0, 0, 0, 0.3) 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 1px 2px;',
  transition: 'transform 1000ms cubic-bezier(0.22, 1, 0.36, 1)',
  transform: 'translateX(2px)',
  willChange: 'transform',

  '&[data-state="checked"]': {
    transform: 'translateX(22px)',
  },
});

const StyledSwitch = styled(SwitchPrimitive.Root, {
  all: 'unset',
  boxSizing: 'border-box',
  userSelect: 'none',
  '&::before': {
    boxSizing: 'border-box',
  },
  '&::after': {
    boxSizing: 'border-box',
  },

  // Reset
  alignItems: 'center',
  display: 'inline-flex',
  justifyContent: 'center',
  lineHeight: '1',
  margin: '0',
  outline: 'none',
  WebkitTapHighlightColor: 'rgba(0,0,0,0)',

  backgroundColor: '$secondary',
  transition: 'background-color 0.3s',
  willChange: 'background',
  borderRadius: '$12',
  position: 'relative',

  '&[data-state="checked"]': {
    backgroundColor: '$primary',
  },

  variants: {
    size: {
      '1': {
        width: '$40',
        height: '$20',
      },
    },
  },
  defaultVariants: {
    size: '1',
  },
});

type SwitchVariants = VariantProps<typeof StyledSwitch>;
type SwitchPrimitiveProps = ComponentProps<typeof SwitchPrimitive.Root>;
type SwitchProps = SwitchPrimitiveProps & SwitchVariants & { css?: CSS };

export const Switch = forwardRef<ElementRef<typeof StyledSwitch>, SwitchProps>(
  (props, forwardedRef) => (
    <StyledSwitch {...props} ref={forwardedRef}>
      <StyledThumb />
    </StyledSwitch>
  ),
);
