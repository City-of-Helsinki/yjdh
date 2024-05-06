/**
 * TODO: YJDH-701, refactor to reduce code duplication, copied and modified from:
 *       frontend/kesaseteli/youth/src/components/youth-form/SubmitErrorSummary.tsx
 */
import { ErrorSummary } from 'hds-react';
import { BACKEND_TO_FRONTEND_FIELD } from 'kesaseteli/handler/constants/data-mappings';
import { SubmitError } from 'kesaseteli/handler/hooks/application/useHandleApplicationWithoutSsnSubmit';
import { BackendApplicationWithoutSsn } from 'kesaseteli/handler/types/application-without-ssn-types';
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
  const { formState } = useFormContext<BackendApplicationWithoutSsn>();

  const message = React.useMemo(() => {
    if (error.type === 'validation_error') {
      return t(
        'common:applicationWithoutSsn.form.checkNotification.validation',
        {
          fields: error.errorFields
            .map((name) =>
              t(
                `common:applicationWithoutSsn.form.inputs.${BACKEND_TO_FRONTEND_FIELD[name]}`
              )
            )
            .join(', '),
        }
      );
    }
    assertUnreachable(error.type, 'Unknown submit error type');
    return null;
  }, [error.errorFields, error.type, t]);

  return (
    <ErrorSummary
      css={alignCenterSvg}
      autofocus={formState.isSubmitted}
      label={t('common:applicationWithoutSsn.form.checkNotification.label')}
    >
      {message}
    </ErrorSummary>
  );
};

export default SubmitErrorSummary;
