import { useTranslation } from 'benefit/applicant/i18n';
import { TermsProp, User } from 'benefit-shared/types/application';
import { TFunction } from 'next-i18next';
import React from 'react';
import { Language } from 'shared/i18n/i18n';
import { setLocalStorageItem } from 'shared/utils/localstorage.utils';
import { capitalize } from 'shared/utils/string.utils';
import { DefaultTheme, useTheme } from 'styled-components';

import { LOCAL_STORAGE_KEYS } from '../constants';
import useLocale from './useLocale';
import useUserQuery from './useUserQuery';

type ExtendedComponentProps = {
  locale: Language;
  theme: DefaultTheme;
  t: TFunction;
  termsInEffectUrl?: string;
  termsInEffectMarkdown?: string;
  user: User | undefined;
  approveTermsOfService: () => void;
};

const useTermsOfServiceData = (
  setIsTermsOfServiceApproved: (isTermsOfServiceApproved: boolean) => void
): ExtendedComponentProps => {
  const locale = useLocale();
  const textLocale = capitalize(locale);
  const theme = useTheme();
  const { t } = useTranslation();

  const userQuery = useUserQuery();
  const { data: user } = userQuery;

  const termsInEffectUrl = React.useMemo(
    () =>
      user?.termsOfServiceInEffect?.[`termsPdf${textLocale}` as TermsProp] ??
      '',
    [user?.termsOfServiceInEffect, textLocale]
  );

  const approveTermsOfService = (): void => {
    setIsTermsOfServiceApproved(true);
    // eslint-disable-next-line scanjs-rules/identifier_localStorage
    setLocalStorageItem(
      LOCAL_STORAGE_KEYS.IS_TERMS_OF_SERVICE_APPROVED,
      'true'
    );
  };

  const getTermsMarkdownByLanguage = (): string => {
    if (!user?.termsOfServiceInEffect) {
      return '';
    }
    switch (locale) {
      case 'fi':
        return String(user.termsOfServiceInEffect?.termsMdFi);

      case 'sv':
        return String(user.termsOfServiceInEffect?.termsMdSv);

      case 'en':
        return String(user.termsOfServiceInEffect?.termsMdSv);

      default:
        return '';
    }
  };

  const termsInEffectMarkdown = getTermsMarkdownByLanguage();

  return {
    locale,
    theme,
    t,
    termsInEffectUrl,
    termsInEffectMarkdown,
    user,
    approveTermsOfService,
  };
};

export default useTermsOfServiceData;
