import { useTranslation } from 'benefit/applicant/i18n';
import { TFunction } from 'next-i18next';
import React from 'react';
import { Language } from 'shared/i18n/i18n';
import { capitalize } from 'shared/utils/string.utils';
import { DefaultTheme, useTheme } from 'styled-components';

import { LOCAL_STORAGE_KEYS } from '../constants';
import { TermsProp, User } from '../types/application';
import useLocale from './useLocale';
import useUserQuery from './useUserQuery';

type ExtendedComponentProps = {
  locale: Language;
  theme: DefaultTheme;
  t: TFunction;
  termsInEffectUrl: string;
  user: User | undefined;
  approveTermsOfService: () => void;
};

const useTermsOfServiceData = (
  setIsTermsOfSerivceApproved: (isTermsOfServiceApproved: boolean) => void
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
    setIsTermsOfSerivceApproved(true);
    // eslint-disable-next-line scanjs-rules/identifier_localStorage
    localStorage.setItem(
      LOCAL_STORAGE_KEYS.IS_TERMS_OF_SERVICE_APPROVED,
      'true'
    );
  };

  return {
    locale,
    theme,
    t,
    termsInEffectUrl,
    user,
    approveTermsOfService,
  };
};

export default useTermsOfServiceData;
