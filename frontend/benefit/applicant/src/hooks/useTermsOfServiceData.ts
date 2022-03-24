import { useTranslation } from 'benefit/applicant/i18n';
import { getBackendDomain } from 'benefit-shared/backend-api/backend-api';
import camelcaseKeys from 'camelcase-keys';
import { TFunction } from 'next-i18next';
import React from 'react';
import { Language } from 'shared/i18n/i18n';
import { capitalize } from 'shared/utils/string.utils';
import { DefaultTheme, useTheme } from 'styled-components';

import { TermsProp, User } from '../types/application';
import useLocale from './useLocale';
import useUserQuery from './useUserQuery';

type ExtendedComponentProps = {
  locale: Language;
  theme: DefaultTheme;
  t: TFunction;
  termsInEffectUrl: string;
  userData: User | undefined;
};

const useTermsOfServiceData = (): ExtendedComponentProps => {
  const locale = useLocale();
  const textLocale = capitalize(locale);
  const theme = useTheme();
  const { t } = useTranslation();

  const userQuery = useUserQuery(undefined, (data) =>
    camelcaseKeys(data, { deep: true })
  );
  const { data: userData } = userQuery;

  const termsInEffectUrl = React.useMemo(() => {
    if (
      userData?.termsOfServiceInEffect &&
      userData?.termsOfServiceInEffect[`termsPdf${textLocale}` as TermsProp]
    )
      return `${getBackendDomain()}${
        userData.termsOfServiceInEffect[`termsPdf${textLocale}` as TermsProp]
      }`;
    return '';
  }, [userData?.termsOfServiceInEffect, textLocale]);

  return { locale, theme, t, termsInEffectUrl, userData };
};

export default useTermsOfServiceData;
