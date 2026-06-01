import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import handleError from 'shared/error-handler/error-handler';
import useGoToPage from 'shared/hooks/useGoToPage';

/**
 * Function type returned by the useErrorHandler hook to process errors.
 */
type ErrorHandlerFunction = (error: Error | unknown) => void;

/**
 * Optional handlers to override default error handling behaviors.
 */
type Props = {
  /** Callback triggered on authentication error (HTTP 401/403). */
  onAuthError?: () => void;
  /** Callback triggered on server error (HTTP 5xx). */
  onServerError?: () => void;
  /** Callback triggered on other errors. */
  onCommonError?: () => void;
};

/**
 * Custom React hook that returns an error handling function.
 * The returned function integrates with the application router and translation context,
 * delegating actual handling to the `handleError` utility.
 *
 * @param props - Custom callbacks to override default error responses.
 * @returns A function that accepts an error and executes the appropriate error response flow.
 */
const useErrorHandler = (props: Props = {}): ErrorHandlerFunction => {
  const { t } = useTranslation();
  const { pathname } = useRouter();
  const goToPage = useGoToPage();

  return (error: Error | unknown) =>
    handleError({ error, t, pathname, goToPage, ...props });
};

export default useErrorHandler;
