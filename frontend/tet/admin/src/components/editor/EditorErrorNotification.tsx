import { ErrorSummary } from 'hds-react';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import TetPosting from 'tet/admin/types/tetposting';

const EditorErrorNotification: React.FC = () => {
  const { t } = useTranslation();
  const {
    getValues,
    formState: { isValid, errors, isSubmitted },
  } = useFormContext<TetPosting>();
  if (isValid || !isSubmitted) {
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
