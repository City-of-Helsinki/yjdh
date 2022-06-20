import { ErrorSummary } from 'hds-react';
import { SubmitError } from 'kesaseteli/youth/hooks/useHandleYouthApplicationSubmit';
import YouthFormData from 'kesaseteli-shared/types/youth-form-data';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import alignCenterSvg from 'shared/styles/svg/align-center-svg.sc';
import { assertUnreachable } from 'shared/utils/typescript.utils';

type Props = {
  error: SubmitError;
};

const SubmitErrorSummary: React.FC<Props> = ({ error }) => {
  const { t } = useTranslation();
  const { formState } = useFormContext<YouthFormData>();

  const message = React.useMemo(() => {
    switch (error.type) {
      case 'please_recheck_data':
        return t('common:youthApplication.checkNotification.recheck');

      case 'validation_error':
        return t('common:youthApplication.checkNotification.validation', {
          fields: error.errorFields
            .map((name) => t(`common:youthApplication.form.${name as string}`))
            .join(', '),
        });

      default:
        assertUnreachable(error.type, 'Unknown submit error type');
        return null;
    }
  }, [error.errorFields, error.type, t]);

  return (
    <ErrorSummary
      css={alignCenterSvg}
      autofocus={formState.isSubmitted}
      label={t('common:youthApplication.checkNotification.label')}
    >
      {message}
    </ErrorSummary>
  );
};

export default SubmitErrorSummary;
