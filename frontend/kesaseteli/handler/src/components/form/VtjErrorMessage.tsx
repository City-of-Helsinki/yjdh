import VtjExceptionType from 'kesaseteli/handler/types/vtj-exception-type';
import { useTranslation } from 'next-i18next';
import React from 'react';
import FieldErrorMessage from 'shared/components/forms/fields/fieldErrorMessage/FieldErrorMessage';

type Props = {
  reason: VtjExceptionType;
  params?: Record<string, string | number>;
};
const VtjErrorMessage: React.FC<Props> = ({ reason, params }) => {
  const { t } = useTranslation();
  return (
    <FieldErrorMessage data-testid={`vtj-error-message-${reason}`} small>
      {t(`common:handlerApplication.vtjException.${reason}`, params)}
    </FieldErrorMessage>
  );
};

export default VtjErrorMessage;
