import { useTranslation } from 'next-i18next';
import React from 'react';
import Toast from 'shared/components/toast/Toast';

const useShowToastIfError = (errorMessage?: string): void => {
  const { t } = useTranslation();
  React.useEffect(() => {
    if (errorMessage) {
      Toast({
        autoDismiss: true,
        autoDismissTime: 5000,
        type: 'error',
        translated: true,
        labelText: t('common:application.common_error'),
        text: errorMessage,
      });
    }
  }, [t, errorMessage]);
};

export default useShowToastIfError;
