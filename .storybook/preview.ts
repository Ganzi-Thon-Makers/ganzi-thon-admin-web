// 전역 스타일 및 Storybook 캔버스 전용 폰트 스타일을 적용한다.
import '../src/app/globals.css';
import './preview.css';

import type { Preview } from '@storybook/nextjs-vite';

/** Storybook 전역 렌더링 설정 객체 */
const preview: Preview = {
  parameters: {
    // Next.js App Router 호환 모드를 활성화한다.
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;
