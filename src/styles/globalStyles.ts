import { globalCss } from './stitches.config';

export const globalStyles = globalCss({
  '*': { margin: 0, padding: 0 },
  html: {},
  body: {
    color: '$neutral800',
    fontSize: '$16',
  },
});
