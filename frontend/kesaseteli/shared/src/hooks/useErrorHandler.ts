import { useRouter } from 'next/compat/router';
import { useTranslation } from 'next-i18next';
import handleError from 'shared/error-handler/error-handler';
import useGoToPage from 'kesaseteli-shared/hooks/useGoToPage';

type ErrorHandlerFunction = (error: Error | unknown) => void;

type Props = {
  onAuthError?: () => void;
  onServerError?: () => void;
  onCommonError?: () => void;
};

const useErrorHandler = (props: Props = {}): ErrorHandlerFunction => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = router?.pathname || '';
  const goToPage = useGoToPage();

  return (error: Error | unknown) =>
    handleError({ error, t, pathname, goToPage, ...props });
};

export default useErrorHandler;
