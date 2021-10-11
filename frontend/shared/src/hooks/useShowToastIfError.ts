import { useTranslation } from 'next-i18next';
import React from 'react';
import Toast from 'shared/components/toast/Toast';

const useShowToastIfError = (errorMessage?: string): void => {
  const { t } = useTranslation();
  React.useEffect(() => {
    if (errorMessage) {
      Toast({
        autoDismissTime: 5000,
        type: 'error',
        labelText: t('common:application.common_error'),
        text: errorMessage,
      });
    }
  }, [t, errorMessage]);
};

export default useShowToastIfError;
