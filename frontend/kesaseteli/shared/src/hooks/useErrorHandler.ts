import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
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
  const pathname = usePathname();
  const goToPage = useGoToPage();

  return (error: Error | unknown) =>
    handleError({ error, t, pathname, goToPage, ...props });
};

export default useErrorHandler;
