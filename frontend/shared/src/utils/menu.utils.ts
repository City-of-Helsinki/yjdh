import isServerSide from 'shared/server/is-server-side';

export const isTabActive = (pathname: string): boolean => {
  if (!isServerSide()) {
    if (window.location.pathname === '/' && pathname === '/') {
      return true;
    }
    if (pathname !== '/') {
      return window.location.pathname.startsWith(pathname);
    }
  }
  return false;
};
