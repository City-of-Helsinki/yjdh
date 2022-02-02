import { Calculation } from 'benefit/handler/types/application';
import { ErrorData } from 'benefit/handler/types/common';
import camelCase from 'lodash/camelCase';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { $Notification } from 'shared/components/notification/Notification.sc';

interface CalculatorErrorsProps {
  data: ErrorData | undefined | null;
}

const CalculatorErrors: React.FC<CalculatorErrorsProps> = ({ data }) => {
  const { t } = useTranslation();

  if (!data) {
    return null;
  }

  return (
    <$Notification
      label={t('common:calculators.notifications.error.title')}
      type="error"
    >
      <>
        <div>{t('common:calculators.notifications.error.message')}</div>
        <ul>
          {Object.entries(
            data[Object.keys(data)[0] as keyof unknown] as Calculation
          ).map(([key, value]) => (
            <li key={key}>{`${t(
              `common:calculators.fields.${camelCase(key)}.label`
            )}: ${String(value)}`}</li>
          ))}
        </ul>
      </>
    </$Notification>
  );
};

export default CalculatorErrors;
