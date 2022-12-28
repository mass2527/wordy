import { globalCss } from './stitches.config';

export const globalStyles = globalCss({
  '*': { margin: 0, padding: 0 },
  '*, *::before, *::after': { boxSizing: 'border-box' },
  html: {},
  body: {
    color: '$neutral800',
    fontFamily: '$untitled',
    fontSize: '$16',
    '-webkit-font-smoothing': 'antialiased',
    lineHeight: '1.5',
  },
});
