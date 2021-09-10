import isServerSide from 'shared/server/is-server-side';

export const getCurrentUrl = (): string =>
  !isServerSide()
    ? `${window.location.protocol}//${window.location.host}${window.location.pathname}`
    : '';

export const setQueryParameter = (name: string, value: string): void => {
  if (!isServerSide()) {
    const params = new URLSearchParams(window.location.search);
    params.set(name, value);
    const path = `${getCurrentUrl()}?${params.toString()}`;
    window.history.replaceState({ path }, '', path);
  }
};

export const clearQueryParams = (): void => {
  if (!isServerSide()) {
    const path = getCurrentUrl();
    window.history.replaceState({ path }, '', path);
  }
};
