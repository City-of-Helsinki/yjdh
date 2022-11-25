import { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { LinkedEventsError } from 'tet-shared/types/linkedevents';

type ErrorHandlerFn = (error: AxiosError<LinkedEventsError>) => void;

type Props = {
  errorTitle: string;
  errorMessage: string;
};

const useLinkedEventsErrorHandler = ({ errorTitle, errorMessage }: Props): ErrorHandlerFn => {
  const { t } = useTranslation();
  const router = useRouter();

  return (error) => {
    if (!error.response) {
      // We didn't get anything back from the backend, display general error message
      showErrorToast(t('common:upload.errorTitle'), t('common:upload.errorMessage'));
    } else if (error.response.status === 401) {
      void router.push('/login');
      // TODO showErrorToast login expired?
    } else {
      const msg = error.response.data;
      showErrorToast(errorTitle, `${errorMessage} (${JSON.stringify(msg)})`);
    }
  };
};

export default useLinkedEventsErrorHandler;
