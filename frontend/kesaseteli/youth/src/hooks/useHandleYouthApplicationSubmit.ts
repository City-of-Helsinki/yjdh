import { isYouthApplicationCreationError } from 'kesaseteli/youth/utils/type-guards';
import CreatedYouthApplication from 'kesaseteli-shared/types/created-youth-application';
import { useRouter } from 'next/router';
import React from 'react';
import isRealIntegrationsEnabled from 'shared/flags/is-real-integrations-enabled';
import useErrorHandler from 'shared/hooks/useErrorHandler';
import useGoToPage from 'shared/hooks/useGoToPage';
import useLocale from 'shared/hooks/useLocale';
import { assertUnreachable } from 'shared/utils/typescript.utils';

type ReturnType = {
  handleSaveSuccess: (application: CreatedYouthApplication) => void;
  handleErrorResponse: (error: Error | unknown) => void;
  showErrorNotification: boolean;
};

const useHandleYouthApplicationSubmit = (): ReturnType => {
  const router = useRouter();
  const locale = useLocale();
  const goToPage = useGoToPage();
  const handleDefaultError = useErrorHandler(false);

  const [showErrorNotification, setShowErrorNotification] =
    React.useState(true);

  return {
    handleSaveSuccess: (application: CreatedYouthApplication): void => {
      const url =
        isRealIntegrationsEnabled() || !application.id
          ? '/thankyou'
          : `/thankyou?id=${application.id}`;
      goToPage(url);
    },
    handleErrorResponse: (error: Error | unknown): void => {
      if (isYouthApplicationCreationError(error)) {
        const errorCode = error.response.data.code;
        console.log('errorCode', errorCode);
        switch (errorCode) {
          case 'already_assigned':
          case 'email_in_use':
          case 'inadmissible_data':
            // eslint-disable-next-line no-console
            void router.push(`${locale}/${encodeURIComponent(errorCode)}`);
            return;

          case 'please_recheck_data':
            setShowErrorNotification(true);
            return;

          default:
            assertUnreachable(errorCode);
        }
      } else {
        handleDefaultError(error);
      }
    },
    showErrorNotification,
  };
};

export default useHandleYouthApplicationSubmit;
