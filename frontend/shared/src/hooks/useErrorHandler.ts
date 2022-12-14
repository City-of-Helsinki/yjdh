import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import handleError from 'shared/error-handler/error-handler';
import useGoToPage from 'shared/hooks/useGoToPage';

type ErrorHandlerFunction = (error: Error | unknown) => void;

const useErrorHandler = (): ErrorHandlerFunction => {
  const { t } = useTranslation();
  const goToPage = useGoToPage();
  const { asPath } = useRouter();
  const onLoginPage = asPath?.startsWith('/login') ?? false;

  return (error: Error | unknown) =>
    handleError(error, t, goToPage, onLoginPage);
};

export default useErrorHandler;
