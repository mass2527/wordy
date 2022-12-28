import { styled } from '../styles/stitches.config';

export const Text = styled('span', {
  // Reset
  fontVariantNumeric: 'tabular-nums',
  fontWeight: '$400',

  variants: {
    size: {
      '12': {
        fontSize: '$12',
      },
      '14': {
        fontSize: '$14',
      },
      '16': {
        fontSize: '$16',
      },
      '18': {
        fontSize: '$18',
      },
      '20': {
        fontSize: '$20',
      },
    },
    color: {
      primary: {
        color: '$primary',
      },
      secondary: {
        color: '$secondary',
      },
      neutral800: {
        color: '$neutral800',
      },
      neutral700: {
        color: '$neutral700',
      },
      neutral600: {
        color: '$neutral600',
      },
      neutral500: {
        color: '$neutral500',
      },
      neutral400: {
        color: '$neutral400',
      },
      neutral300: {
        color: '$neutral300',
      },
      neutral200: {
        color: '$neutral200',
      },
      neutral100: {
        color: '$neutral100',
      },
    },
  },
  defaultVariants: {
    size: '16',
    color: 'neutral800',
  },
});
