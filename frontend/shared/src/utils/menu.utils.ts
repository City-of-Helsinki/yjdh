import isServerSide from 'shared/server/is-server-side';

export const isTabActive = (pathname: string): boolean => {
  if (!isServerSide()) {
    if (globalThis.location.pathname === '/' && pathname === '/') {
      return true;
    }
    if (pathname !== '/') {
      return globalThis.location.pathname.startsWith(pathname);
    }
  }
  return false;
};
