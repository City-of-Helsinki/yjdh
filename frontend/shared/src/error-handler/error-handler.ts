import { TFunction } from 'next-i18next';
import showErrorToast from 'shared/components/toast/show-error-toast';
import GoToPageFunction from 'shared/types/go-to-page-function';
import { isError } from 'shared/utils/type-guards';

/**
 * Parameters for the handleError utility function.
 */
type Params = {
  /** The error object or unknown error value to handle. */
  error: Error | unknown;
  /** Translation function for internationalization. */
  t: TFunction;
  /** Current URL pathname. */
  pathname: string;
  /** Navigation function to transition between pages. */
  goToPage: GoToPageFunction;
  /** Custom callback for authentication errors (HTTP 401/403). Defaults to redirecting to login page. */
  onAuthError?: () => void;
  /** Custom callback for server errors (HTTP 5xx). Defaults to redirecting to /500 page. */
  onServerError?: () => void;
  /** Custom callback for other errors. Defaults to showing a generic error toast notification. */
  onCommonError?: () => void;
};

/**
 * Utility function to handle errors by inspecting the error message and executing the
 * appropriate callback (auth, server, or common generic error).
 *
 * @param args - The configuration parameters and the error object to handle.
 */
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
