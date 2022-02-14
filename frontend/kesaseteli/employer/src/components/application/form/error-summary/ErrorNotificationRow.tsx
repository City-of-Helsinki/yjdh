import useApplicationFormField from 'kesaseteli/employer/hooks/application/useApplicationFormField';
import ApplicationFieldPath from 'kesaseteli/employer/types/application-field-path';
import { useTranslation } from 'next-i18next';
import React from 'react';

type Props = {
  fieldPath: ApplicationFieldPath;
};

const ErrorNotificationRow: React.FC<Props> = ({ fieldPath }: Props) => {
  const { t } = useTranslation();
  const { fieldName, setFocus, getErrorText, hasError } =
    useApplicationFormField(fieldPath);

  if (!hasError()) {
    return null;
  }

  return (
    <li>
      {t(`common:application.form.inputs.${fieldName}`)}
      {': '}
      <a href={`#${fieldPath}`} onClick={setFocus}>
        {getErrorText()}
      </a>
    </li>
  );
};

export default ErrorNotificationRow;
