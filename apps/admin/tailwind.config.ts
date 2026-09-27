import type { Config } from 'tailwindcss';
import baseConfig from '@my-cambo/config/tailwind';

const config: Config = {
  ...baseConfig,
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
};

export default config;