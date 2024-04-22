import NumberTag from 'benefit/handler/components/header/NumberTag';
import { ROUTES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import useApplicationAlterationsQuery from 'benefit/handler/hooks/useApplicationAlterationsQuery';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import { NavigationItem, OptionType } from 'shared/types/common';
import { getLanguageOptions } from 'shared/utils/common';

type ExtendedComponentProps = {
  t: TFunction;
  languageOptions: OptionType<string>[];
  isNavigationVisible?: boolean;
  navigationItems?: NavigationItem[];
  handleLanguageChange: (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType<string>
  ) => void;
  handleNavigationItemClick: (pathname: string) => void;
  handleTitleClick: () => void;
};

const useHeader = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const { isNavigationVisible } = React.useContext(AppContext);
  const isNewAhjoMode = useDetermineAhjoMode();

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'supportedLanguages'),
    [t]
  );

  const { data: alterationData, isLoading: isAlterationListLoading } =
    useApplicationAlterationsQuery();

  const items = {
    default: [
      { label: t('common:header.navigation.applications'), url: ROUTES.HOME },
      {
        label: (
          <>
            {t('common:header.navigation.alterations')}
            {!isAlterationListLoading && (
              <NumberTag count={alterationData.length} />
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
              <NumberTag count={alterationData.length} />
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

  const handleLanguageChange = (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType<string>
  ): void => {
    e.preventDefault();
    void router.push('/', '/', { locale: newLanguage.value });
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
