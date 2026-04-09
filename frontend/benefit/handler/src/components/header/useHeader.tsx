import NumberTag from 'benefit/handler/components/header/NumberTag';
import { ROUTES, SUPPORTED_LANGUAGES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import useApplicationAlterationsQuery from 'benefit/handler/hooks/useApplicationAlterationsQuery';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { BackendEndpoint } from 'benefit-shared/backend-api/backend-api';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';
import AuthContext from 'shared/auth/AuthContext';
import useBackendAPI from 'shared/hooks/useBackendAPI';
import { NavigationItem, OptionType } from 'shared/types/common';
import { getLanguageOptions } from 'shared/utils/common';

type ExtendedComponentProps = {
  t: TFunction;
  languageOptions: OptionType<string>[];
  isNavigationVisible?: boolean;
  navigationItems?: NavigationItem[];
  handleLanguageChange: (newLanguage: string) => void;
  handleNavigationItemClick: (pathname: string) => void;
  handleTitleClick: () => void;
};

const useHeader = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isNavigationVisible } = React.useContext(AppContext);
  const isNewAhjoMode = useDetermineAhjoMode();
  const { axios } = useBackendAPI();
  const { isAuthenticated } = React.useContext(AuthContext);

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'supportedLanguages'),
    [t]
  );

  useEffect(() => {
    // The handler UI is currently Finnish-only so it's set here.
    // Only when authenticated so there is no 403 error.
    if (isAuthenticated) {
      void axios.get(BackendEndpoint.USER_OPTIONS, {
        params: { lang: SUPPORTED_LANGUAGES.FI },
      });
    }
  }, [isAuthenticated]);

  const { data: alterationData, isLoading: isAlterationListLoading } =
    useApplicationAlterationsQuery();

  const items = {
    default: [
      { label: t('common:header.navigation.applications'), url: ROUTES.HOME },
      {
        label: (
          <>
            {t('common:header.navigation.alterations')}
            {!isAlterationListLoading && (alterationData?.length ?? 0) > 0 && (
              <NumberTag count={alterationData?.length ?? 0} />
            )}
          </>
        ),
        url: ROUTES.ALTERATIONS,
      },
      {
        label: t('common:header.navigation.batches'),
        url: ROUTES.APPLICATIONS_BATCHES,
      },
      {
        label: t('common:header.navigation.archive'),
        url: ROUTES.APPLICATIONS_ARCHIVE,
      },
      {
        label: t('common:header.navigation.reports'),
        url: ROUTES.APPLICATIONS_REPORTS,
      },
    ],
    newAhjo: [
      { label: t('common:header.navigation.applications'), url: ROUTES.HOME },
      {
        label: (
          <>
            {t('common:header.navigation.alterations')}
            {!isAlterationListLoading && (
              <NumberTag count={alterationData?.length ?? 0} />
            )}
          </>
        ),
        url: ROUTES.ALTERATIONS,
      },
      {
        label: t('common:header.navigation.archive'),
        url: ROUTES.APPLICATIONS_ARCHIVE,
      },
      {
        label: t('common:header.navigation.reports'),
        url: ROUTES.APPLICATIONS_REPORTS,
      },
    ],
  };

  const navigationItems = React.useMemo(
    (): NavigationItem[] => (isNewAhjoMode ? items.newAhjo : items.default),
    [items.default, items.newAhjo, isNewAhjoMode]
  );

  const handleLanguageChange = (newLanguage: string): void => {
    void router.push('/', '/', { locale: newLanguage });
  };

  const handleNavigationItemClick = (pathname: string): void => {
    void router.push(pathname);
  };

  const handleTitleClick = (): void => handleNavigationItemClick('/');

  return {
    t,
    languageOptions,
    isNavigationVisible,
    navigationItems,
    handleLanguageChange,
    handleNavigationItemClick,
    handleTitleClick,
  };
};

// For consistency with hooks from .ts files
// eslint-disable-next-line import/prefer-default-export
export { useHeader };
