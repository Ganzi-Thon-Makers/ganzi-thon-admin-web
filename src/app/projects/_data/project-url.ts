/** 선택 입력된 서비스 주소를 안전한 HTTP(S) 주소로 정규화합니다.
 * @param value 입력값 또는 기존 상세 조회 값
 * @returns 사용할 수 있는 전체 주소, 빈 값이나 잘못된 주소는 null
 */
export function normalizeProjectServiceUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      !url.hostname ||
      (!url.hostname.includes('.') && url.hostname !== 'localhost') ||
      url.username ||
      url.password
    )
      return null;
    return url.href;
  } catch {
    return null;
  }
}
