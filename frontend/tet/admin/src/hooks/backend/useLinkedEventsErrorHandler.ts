import { LinkedEventsError } from 'tet/admin/types/linkedevents';
import showErrorToast from 'shared/components/toast/show-error-toast';
import { useTranslation } from 'next-i18next';
import { AxiosError } from 'axios';
import { useRouter } from 'next/router';

type ErrorHandlerFn = (error: AxiosError<LinkedEventsError>) => void;

const useLinkedEventsErrorHandler = (): ErrorHandlerFn => {
  const { t } = useTranslation();
  const router = useRouter();

  return (error) => {
    if (!error.response) {
      // We didn't get anything back from the backend, display general error message
      showErrorToast(t('common:upload.errorTitle'), t('common:upload.errorMessage'));
    } else if (error.response.status === 401 || error.response.status === 403) {
      void router.push('/login');
      // TODO showErrorToast login expired?
    } else {
      const msg = error.response.data;
      showErrorToast(t('common:upload.errorTitle'), `Virheilmoitus taustajärjestelmästä: ${JSON.stringify(msg)}`);
    }
  };
};

export default useLinkedEventsErrorHandler;
