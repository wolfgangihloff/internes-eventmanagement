import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/docs/**/*.mdx'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  async viteFinal(config, { configType }) {
    if (configType !== 'PRODUCTION') {
      return config;
    }

    return mergeConfig(config, {
      base: '/storybook/',
    });
  },
};
export default config;
