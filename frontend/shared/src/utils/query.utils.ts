import isServerSide from 'shared/server/is-server-side';

export const getCurrentUrl = (): string =>
  isServerSide()
    ? ''
    : `${globalThis.location.protocol}//${globalThis.location.host}${globalThis.location.pathname}`;

export const setQueryParameter = (name: string, value: string): void => {
  if (!isServerSide()) {
    const params = new URLSearchParams(globalThis.location.search);
    params.set(name, value);
    const path = `${getCurrentUrl()}?${params.toString()}`;
    globalThis.history.replaceState({ path }, '', path);
  }
};

export const clearQueryParams = (): void => {
  if (!isServerSide()) {
    const path = getCurrentUrl();
    globalThis.history.replaceState({ path }, '', path);
  }
};
