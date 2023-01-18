import { TFunction } from 'next-i18next';
import showErrorToast from 'shared/components/toast/show-error-toast';
import GoToPageFunction from 'shared/types/go-to-page-function';
import { isError } from 'shared/utils/type-guards';

type Params = {
  error: Error | unknown;
  t: TFunction;
  pathname: string;
  goToPage: GoToPageFunction;
  onAuthError?: () => void;
  onServerError?: () => void;
  onCommonError?: () => void;
};

const handleError = (args: Params): void => {
  const { error, t, pathname, goToPage } = args;
  const {
    onAuthError = () => {
      if (pathname !== '/login') {
        goToPage('/login?sessionExpired=true');
      }
    },
    onServerError = () => goToPage('/500'),
    onCommonError = () =>
      showErrorToast(
        t('common:error.generic.label'),
        t('common:error.generic.text')
      ),
  } = args;

  if (isError(error)) {
    if (/40[13]/.test(error.message)) {
      onAuthError();
    } else if (/5\d{2}/.test(error.message)) {
      onServerError();
    } else {
      onCommonError();
    }
  }
};

export default handleError;
