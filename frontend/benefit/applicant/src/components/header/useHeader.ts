import { APPLICATION_STATUSES } from 'benefit/applicant/constants';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import useLocale from 'benefit/applicant/hooks/useLocale';
import { useTranslation } from 'benefit/applicant/i18n';
import { getLanguageOptions } from 'benefit/applicant/utils/common';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import { NavigationItem, OptionType } from 'shared/types/common';

type ExtendedComponentProps = {
  t: TFunction;
  languageOptions: OptionType<string>[];
  locale: string;
  navigationItems?: NavigationItem[];
  hasMessenger: boolean;
  handleLanguageChange: (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType<string>
  ) => void;
  handleNavigationItemClick: (url: string) => void;
};

const useHeader = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const locale = useLocale();
  const router = useRouter();
  const id = router?.query?.id?.toString() ?? '';
  const [hasMessenger, setHasMessenger] = useState<boolean>(false);
  const { pathname, asPath, query } = router;

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'supportedLanguages'),
    [t]
  );

  const { data: application } = useApplicationQuery(id);

  const status = React.useMemo(
    (): APPLICATION_STATUSES =>
      application?.status || APPLICATION_STATUSES.DRAFT,
    [application]
  );

  useEffect(() => {
    setHasMessenger(status === APPLICATION_STATUSES.INFO_REQUIRED);
  }, [status, setHasMessenger]);

  const handleLanguageChange = (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType<string>
  ): void => {
    e.preventDefault();

    void router.push({ pathname, query }, asPath, {
      locale: newLanguage.value,
    });
  };

  const handleNavigationItemClick = (url: string): void => {
    void router.push(url);
  };

  return {
    t,
    languageOptions,
    locale,
    handleLanguageChange,
    handleNavigationItemClick,
    hasMessenger,
  };
};

export { useHeader };
