import { ErrorSummary } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import TetPosting from 'tet/admin/types/tetposting';

const EditorErrorNotification: React.FC = () => {
  const { t } = useTranslation();
  const {
    formState: { isValid, errors, isSubmitted },
  } = useFormContext<TetPosting>();

  const noTetErrors = Object.keys(errors).length === 0;

  if (isValid || !isSubmitted || noTetErrors) {
    return null;
  }

  // TODO display all errors
  console.dir(errors);

  return (
    <ErrorSummary label={t(`common:editor.notificationTitle`)} autofocus>
      {Object.keys(errors).join(', ')}
    </ErrorSummary>
  );
};

export default EditorErrorNotification;
