import isServerSide from 'shared/server/is-server-side';

export const isTabActive = (pathname: string): boolean => (
  !isServerSide() && window.location.pathname.startsWith(pathname)
);