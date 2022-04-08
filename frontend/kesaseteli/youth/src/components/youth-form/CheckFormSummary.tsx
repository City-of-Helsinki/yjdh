import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import usePreviousValue from 'shared/hooks/usePreviousValue';

import { ErrorSummary } from 'hds-react';
import alignCenterSvg from 'shared/styles/svg/align-center-svg.sc';

const CheckFormSummary: React.FC = () => {
  const { t } = useTranslation();
  const { formState } = useFormContext<YouthFormData>();

  return (
    <ErrorSummary
      css={alignCenterSvg}
      autofocus={formState.isSubmitted}
      label={t('common:youthApplication.checkNotification.label')}
    >
      {t('common:youthApplication.checkNotification.message')}
    </ErrorSummary>
  );
};

export default CheckFormSummary;
