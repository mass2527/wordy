import { createStitches } from '@stitches/react';

// https://www.figma.com/file/McyxmzOQELwvHO9W5jzwwV/Free-Placeholder-Logos-%7C-BRIX-Templates-(Community)?node-id=2%3A35&t=rj9WCJHh559yH8fX-0
export const { styled, globalCss } = createStitches({
  theme: {
    colors: {
      primary: '#4A3AFF',
      secondary: '#F3F1FF',
      neutral800: '#170F49',
      neutral700: '#4E4B66',
      neutral600: '#6E7191',
      neutral500: '#A0A3BD',
      neutral400: '#D9DBE9',
      neutral300: '#EFF0F6',
      neutral200: '#D9DBE9',
      neutral100: '#FFFFFF',
    },
    fontSizes: {
      12: '0.75rem',
      14: '0.875rem',
      16: '1rem',
      18: '1.125rem',
      20: '1.25rem',
    },
    space: {
      4: '0.25rem',
      8: '0.5rem',
      16: '1rem',
    },
    fonts: {
      untitled: 'Untitled Sans, -apple-system, system-ui, sans-serif',
    },
  },
});
