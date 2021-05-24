import useAuthentication from 'kesaseteli/employer/hooks/useAuth';

const useIsAuthenticated = (): boolean => {
  const client = useAuthentication();
  return client.isAuthenticated;
};
export default useIsAuthenticated;
