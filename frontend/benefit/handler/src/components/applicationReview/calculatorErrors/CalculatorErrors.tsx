import { PaySubsidy } from 'benefit/handler/types/application';
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

  const getErrorList = (
    object: Record<string, unknown>,
    objectIndex: number | null = null
  ): React.ReactElement[] =>
    Object.entries(object).map(([key, value]) => (
      <li key={key}>{`${t(
        `common:calculators.fields.${camelCase(key)}.label`
      )}${objectIndex !== null ? ` ${objectIndex + 1}` : ''}: ${String(
        value
      )}`}</li>
    ));

  return (
    <$Notification
      label={t('common:calculators.notifications.error.title')}
      type="error"
    >
      <div>{t('common:calculators.notifications.error.message')}</div>

      {'paySubsidies' in data && (
        <ul>
          <li>{t('common:calculators.notifications.paySubsidy')}</li>

          <ul>
            {
              // eslint-disable-next-line @typescript-eslint/dot-notation
              (data['paySubsidies'] as PaySubsidy[]).map(
                (paySubsidy: PaySubsidy, index: number) =>
                  getErrorList(paySubsidy, index)
              )
            }
          </ul>
        </ul>
      )}
      {'calculation' in data && (
        <ul>
          {
            // eslint-disable-next-line @typescript-eslint/dot-notation
            getErrorList(data['calculation'] as Record<string, unknown>)
          }
        </ul>
      )}
    </$Notification>
  );
};

export default CalculatorErrors;
