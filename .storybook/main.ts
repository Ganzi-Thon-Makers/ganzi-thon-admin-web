import type { StorybookConfig } from '@storybook/nextjs-vite';
import tailwindcss from '@tailwindcss/vite';

/** Storybook 환경 설정 객체 */
const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.tsx'],
  addons: [],
  framework: {
    name: '@storybook/nextjs-vite',
  },
  staticDirs: ['../public'],
  core: {
    disableTelemetry: true,
  },
  /**
   * Tailwind CSS v4 플러그인을 Vite 번들러 설정에 병합한다.
   * @param config Storybook 기본 Vite 설정 객체
   * @returns Tailwind CSS 플러그인이 추가된 Vite 설정 객체
   */
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');

    return mergeConfig(config, {
      plugins: [tailwindcss()],
    });
  },
};

export default config;
