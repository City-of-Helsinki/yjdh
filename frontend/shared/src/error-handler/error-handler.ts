import { TFunction } from 'next-i18next';
import showErrorToast from 'shared/components/toast/show-error-toast';
import GoToPageFunction from 'shared/types/go-to-page-function';
import { isError } from 'shared/utils/type-guards';

const handleError = (
  error: Error | unknown,
  t: TFunction,
  goToPage: GoToPageFunction,
  redirectUnauthorized: boolean
): void => {
  if (isError(error)) {
    // eslint-disable-next-line no-console
    console.error('Unexpected backend error', error.message);
    if (/40[13]/.test(error.message)) {
      if (redirectUnauthorized) {
        void goToPage('/login?sessionExpired=true');
      }
    } else if (/5\d{2}/.test(error.message)) {
      void goToPage('/500');
    } else {
      showErrorToast(
        t('common:error.generic.label'),
        t('common:error.generic.text')
      );
    }
  }
};

export default handleError;
