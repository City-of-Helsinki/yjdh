import RealAuthProvider from 'kesaseteli/handler/auth/AuthProvider';
import Header from 'kesaseteli/handler/components/header/Header';
import { UserProvider } from 'kesaseteli/handler/contexts/UserContext';
import { expectAuthorizedReply } from 'kesaseteli-shared/__tests__/utils/backend/backend-nocks';
import renderPageF from 'kesaseteli-shared/__tests__/utils/render-component/render-page';
import { getBackendDomain } from 'kesaseteli-shared/backend-api/backend-api';
import { ROUTES_FOR_ANONYMOUS_USERS } from 'kesaseteli-shared/constants/routes';
import React from 'react';

const AppProviders: React.FC<React.PropsWithChildren> = ({ children }) => (
  <RealAuthProvider>
    <UserProvider>{children}</UserProvider>
  </RealAuthProvider>
);

const render = renderPageF({
  backendUrl: getBackendDomain(),
  Header,
  confirmDialog: true,
  AuthProvider: AppProviders,
});

const renderPage = (
  ...params: Parameters<typeof render>
): ReturnType<typeof render> => {
  const [, router] = params;
  const skipAuthCheck = ROUTES_FOR_ANONYMOUS_USERS.includes(
    router?.route ?? ''
  );

  if (!skipAuthCheck) {
    expectAuthorizedReply({
      id: 'test-user-id',
      name: 'Test User',
      given_name: 'Test',
      family_name: 'User',
      is_staff: true,
    }).persist();
  }

  return render(...params);
};

export default renderPage;
