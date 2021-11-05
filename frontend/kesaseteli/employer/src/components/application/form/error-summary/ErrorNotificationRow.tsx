import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { FieldError } from 'react-hook-form';

type Props = {
  fieldPath: ApplicationFieldPath;
  error: FieldError;
};

const ErrorNotificationRow: React.FC<Props> = ({ fieldPath, error }: Props) => {
  const { t } = useTranslation();
  const { fieldName, setFocus } = useApplicationFormField(fieldPath);

  return (
    <li>
      {t(`common:application.form.inputs.${fieldName}`)}
      {': '}
      <a href={`#${fieldPath}`} onClick={setFocus}>
        {t(`common:application.form.errors.${error.type}`)}
      </a>
    </li>
  );
};

export default ErrorNotificationRow;
