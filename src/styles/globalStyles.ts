import { globalCss } from './stitches.config';

export const globalStyles = globalCss({
  '*, *::before, *::after': { boxSizing: 'border-box' },
  html: {},
  body: {
    margin: 0,
    color: '$neutral800',
    fontFamily: '$untitled',
    fontSize: '$16',
    '-webkit-font-smoothing': 'antialiased',
  },
});
