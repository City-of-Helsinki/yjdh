import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { getLanguageOptions } from 'benefit/applicant/utils/common';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import React, { useEffect, useState } from 'react';
import useToggle from 'shared/hooks/useToggle';
import { NavigationItem, OptionType } from 'shared/types/common';

type ExtendedComponentProps = {
  t: TFunction;
  languageOptions: OptionType<string>[];
  navigationItems?: NavigationItem[];
  hasMessenger: boolean;
  handleLanguageChange: (
    e: React.SyntheticEvent<unknown>,
    newLanguage: OptionType<string>
  ) => void;
  handleNavigationItemClick: (url: string) => void;
  unreadMessagesCount: number | undefined | null;
  toggleMessagesDrawerVisiblity: () => void;
  isMessagesDrawerVisible: boolean;
};

const useHeader = (): ExtendedComponentProps => {
  const { t } = useTranslation();
  const router = useRouter();
  const id = router?.query?.id?.toString() ?? '';
  const [hasMessenger, setHasMessenger] = useState<boolean>(false);
  const [unreadMessagesCount, setUnredMessagesCount] = useState<
    number | undefined | null
  >(null);
  const [isMessagesDrawerVisible, toggleMessagesDrawerVisiblity] =
    useToggle(false);
  const { pathname, asPath, query } = router;

  const languageOptions = React.useMemo(
    (): OptionType<string>[] => getLanguageOptions(t, 'supportedLanguages'),
    [t]
  );

  const { data: application } = useApplicationQuery(id);

  useEffect(() => {
    if (application?.unread_messages_count) {
      setUnredMessagesCount(application?.unread_messages_count);
    } else {
      setUnredMessagesCount(null);
    }
  }, [application]);

  useEffect(() => {
    if (isMessagesDrawerVisible && Number(unreadMessagesCount) > 0) {
      setUnredMessagesCount(null);
    }
  }, [isMessagesDrawerVisible, unreadMessagesCount]);

  const status = React.useMemo(
    (): APPLICATION_STATUSES =>
      application?.status || APPLICATION_STATUSES.DRAFT,
    [application]
  );

  useEffect(() => {
    setHasMessenger(
      status === APPLICATION_STATUSES.INFO_REQUIRED ||
        status === APPLICATION_STATUSES.HANDLING
    );
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
    handleLanguageChange,
    handleNavigationItemClick,
    toggleMessagesDrawerVisiblity,
    languageOptions,
    hasMessenger,
    unreadMessagesCount,
    isMessagesDrawerVisible,
  };
};

export { useHeader };
