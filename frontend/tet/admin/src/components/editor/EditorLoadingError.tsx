import { ErrorSummary } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';

type Props = {
  error: Error;
};

const EditorLoadingError: React.FC<Props> = ({ error }) => {
  const { t } = useTranslation();

  return (
    <ErrorSummary label={t(`common:editor.loadingError`)} autofocus>
      {error?.message}
    </ErrorSummary>
  );
};

export default EditorLoadingError;
