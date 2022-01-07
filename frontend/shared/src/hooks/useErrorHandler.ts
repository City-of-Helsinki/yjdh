import { useTranslation } from 'next-i18next';
import handleError from 'shared/error-handler/error-handler';
import useGoToPage from 'shared/hooks/useGoToPage';

type ErrorHandlerFunction = (error: Error | unknown) => void;

const useErrorHandler = (redirectUnauthorized = true): ErrorHandlerFunction => {
  const { t } = useTranslation();
  const goToPage = useGoToPage();
  return (error: Error | unknown) =>
    handleError(error, t, goToPage, redirectUnauthorized);
};

export default useErrorHandler;
