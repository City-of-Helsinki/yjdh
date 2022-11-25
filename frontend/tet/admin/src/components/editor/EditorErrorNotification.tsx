import { ErrorSummary } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import TetPosting from 'tet-shared/types/tetposting';

const EditorErrorNotification: React.FC = () => {
  const { t } = useTranslation();
  const {
    formState: { errors, isSubmitted },
  } = useFormContext<TetPosting>();

  const noTetErrors = Object.keys(errors).length === 0;

  if (isSubmitted && !noTetErrors) {
    return <ErrorSummary label={t(`common:editor.notificationTitle`)} autofocus />;
  }

  return null;
};

export default EditorErrorNotification;
