import { NextRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { Language } from 'shared/i18n/i18n';

const handleError = (
  error: Error,
  t: TFunction,
  router: NextRouter,
  locale: Language
): void => {
  // eslint-disable-next-line no-console
  console.error('Unexpected backend error', error);
  if (/40[13]/.test(error.message)) {
    void router.push(`${locale}/login?sessionExpired=true`);
  } else if (/5\d{2}/.test(error.message)) {
    void router.push(`${locale}/500`);
  } else {
    showErrorToast(
      t('common:error.generic.label'),
      t('common:error.generic.text')
    );
  }
};

export default handleError;
