export const isTabActive = (pathname: string): boolean => (
  typeof window !== 'undefined' &&
  window.location.pathname.startsWith(pathname)
);