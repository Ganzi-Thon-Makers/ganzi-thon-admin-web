import { createCn } from 'cn/config';

/**
 * Tailwind 클래스를 병합한다.
 *
 * 커스텀 타이포그래피 스케일과 텍스트 색상 클래스 간의 cn 병합 충돌을 해결한다.
 *
 * @param inputs 결합할 클래스명 목록
 * @returns 병합된 클래스명 문자열
 */
export const cn = createCn({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-sb-36',
            'display-sb-32',
            'display-sb-28',
            'title-sb-24',
            'title-m-24',
            'title-sb-20',
            'title-m-20',
            'title-r-20',
            'title-sb-18',
            'title-m-18',
            'title-r-18',
            'body-sb-16',
            'body-m-16',
            'body-r-16',
            'body-sb-14',
            'body-m-14',
            'body-r-14',
            'caption-sb-12',
            'caption-m-12',
            'caption-r-12',
            'caption-m-10',
          ],
        },
      ],
    },
  },
});
