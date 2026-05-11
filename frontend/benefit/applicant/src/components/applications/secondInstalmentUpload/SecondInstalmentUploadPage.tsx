import AttachmentsList from 'benefit/applicant/components/applications/forms/application/step3/attachmentsList/AttachmentsList';
import { ROUTES } from 'benefit/applicant/constants';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import useChangeEmployerAssuranceMutation from 'benefit/applicant/hooks/useChangeEmployerAssuranceMutation';
import useSecondInstalmentInfoQuery from 'benefit/applicant/hooks/useSecondInstalmentInfoQuery';
import useSecondInstalmentRespondMutation from 'benefit/applicant/hooks/useSecondInstalmentRespondMutation';
import { useTranslation } from 'benefit/applicant/i18n';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import {
  Button,
  ButtonPresetTheme,
  ButtonVariant,
  IconArrowRight,
  LoadingSpinner,
} from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';
import Container from 'shared/components/container/Container';
import { $Checkbox } from 'shared/components/forms/fields/Fields.sc';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import useLocale from 'shared/hooks/useLocale';
import { BenefitAttachment } from 'shared/types/attachment';
import {
  convertToUIDateAndTimeFormat,
  convertToUIDateFormat,
} from 'shared/utils/date.utils';

const getFileNameFromPath = (path?: string): string =>
  path?.split('/').filter(Boolean).at(-1) ?? '';

const normalizeAttachmentFileNames = (
  attachments: BenefitAttachment[] = []
): BenefitAttachment[] =>
  attachments.map((attachment) => {
    const snakeCaseAttachment = attachment as BenefitAttachment & {
      attachment_type?: string;
      attachment_file?: string;
      attachment_file_name?: string;
      created_at?: string;
    };

    const attachmentFile =
      attachment.attachmentFile || snakeCaseAttachment.attachment_file || '';

    return {
      ...attachment,
      attachmentType:
        attachment.attachmentType || snakeCaseAttachment.attachment_type || '',
      attachmentFile,
      attachmentFileName:
        attachment.attachmentFileName ||
        snakeCaseAttachment.attachment_file_name ||
        getFileNameFromPath(attachmentFile),
      createdAt: attachment.createdAt || snakeCaseAttachment.created_at,
    };
  });

const SecondInstalmentUploadPage: React.FC = () => {
  const locale = useLocale();
  const { t } = useTranslation();
  const router = useRouter();
  const [isNavigatingBack, setIsNavigatingBack] = React.useState(false);
  const [assuranceChecked, setAssuranceChecked] = React.useState(false);

  const applicationId =
    typeof router.query.id === 'string' ? router.query.id : undefined;

  const { data: application } = useApplicationQuery(applicationId ?? '');

  React.useEffect(() => {
    const applicationWithSnakeCaseFields = application as
      | { employer_assurance?: boolean | null }
      | undefined;

    setAssuranceChecked(
      Boolean(
        application?.employer_assurance ??
          applicationWithSnakeCaseFields?.employer_assurance
      )
    );
  }, [application]);

  const formatEuroAmount = React.useCallback(
    (amount: number | string): string =>
      new Intl.NumberFormat(`${locale}-FI`, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
      }).format(Number(amount)),
    [locale]
  );

  const attachments = React.useMemo(
    () => normalizeAttachmentFileNames(application?.attachments),
    [application?.attachments]
  );
  const hasPayslipAttachment = React.useMemo(
    () =>
      attachments.some(
        (attachment) => attachment.attachmentType === ATTACHMENT_TYPES.PAYSLIP
      ),
    [attachments]
  );

  const {
    data: secondInstalmentInfo,
    isLoading: isSecondInstalmentInfoLoading,
    isError: isSecondInstalmentInfoError,
  } = useSecondInstalmentInfoQuery(applicationId);

  const {
    mutate: secondInstalmentRespond,
    isLoading: isSubmittingSecondInstalmentResponse,
  } = useSecondInstalmentRespondMutation();

  const {
    mutate: changeEmployerAssurance,
    isLoading: isChangingEmployerAssurance,
  } = useChangeEmployerAssuranceMutation();

  const handleEmployerAssuranceChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      const { checked } = event.target;

      setAssuranceChecked(checked);

      if (!applicationId) {
        return;
      }

      changeEmployerAssurance({
        applicationId,
        employerAssurance: checked,
      });
    },
    [applicationId, changeEmployerAssurance]
  );

  const handleSubmit = React.useCallback((): void => {
    if (isNavigatingBack || !applicationId) {
      return;
    }

    if (!hasPayslipAttachment) {
      showErrorToast(
        t('common:applications.secondInstalmentUpload.missingPayslipTitle'),
        t('common:applications.secondInstalmentUpload.missingPayslipMessage')
      );
      return;
    }

    setIsNavigatingBack(true);

    secondInstalmentRespond(
      { applicationId },
      {
        onSuccess: () => {
          showSuccessToast(
            t('common:applications.secondInstalmentUpload.successTitle'),
            [
              t('common:applications.secondInstalmentUpload.successMessage1'),
              (secondInstalmentInfo?.application_number ?? '').toString(),
              t('common:applications.secondInstalmentUpload.successMessage2'),
            ].join(' ')
          );
          void router.replace(ROUTES.HOME);
        },
        onError: () => {
          showErrorToast(
            t('common:applications.secondInstalmentUpload.errorTitle'),
            t('common:applications.secondInstalmentUpload.errorMessage')
          );
          setIsNavigatingBack(false);
        },
      }
    );
  }, [
    applicationId,
    hasPayslipAttachment,
    isNavigatingBack,
    router,
    secondInstalmentInfo?.application_number,
    secondInstalmentRespond,
    t,
  ]);

  const handleBack = React.useCallback((): void => {
    if (isNavigatingBack) {
      return;
    }

    setIsNavigatingBack(true);
    void router.replace(ROUTES.HOME);
  }, [isNavigatingBack, router]);

  return (
    <Container>
      <h1>{t('common:applications.secondInstalmentUpload.heading')}</h1>

      {isSecondInstalmentInfoLoading && <LoadingSpinner />}

      {isSecondInstalmentInfoError && (
        <p>
          {t(
            'common:applications.secondInstalmentUpload.secondInstalmentInfoError'
          )}
        </p>
      )}

      {secondInstalmentInfo && (
        <>
          <$Grid columns={12} css={{ marginBottom: '6px' }}>
            <$GridCell $colSpan={6}>
              <span>
                {secondInstalmentInfo.employee_first_name}{' '}
                {secondInstalmentInfo.employee_last_name}
              </span>
            </$GridCell>
            <$GridCell $colSpan={6} justifySelf="end">
              <span css={{ color: 'var(--color-fog)' }}>
                {t(
                  'common:applications.secondInstalmentUpload.applicationNumber'
                )}
                : {secondInstalmentInfo.application_number}
                {' | '}
                {t(
                  'common:applications.secondInstalmentUpload.submittedAt'
                )}{' '}
                {convertToUIDateAndTimeFormat(
                  secondInstalmentInfo.submitted_at
                )}
              </span>
            </$GridCell>
          </$Grid>
          <hr css={{ marginTop: '6px', marginBottom: '6px' }} />
        </>
      )}

      {secondInstalmentInfo && (
        <p>
          {t('common:applications.secondInstalmentUpload.instalmentInfo1')}{' '}
          {formatEuroAmount(secondInstalmentInfo.amount)}{' '}
          {t('common:applications.secondInstalmentUpload.instalmentInfo2')}{' '}
          {convertToUIDateFormat(secondInstalmentInfo.start_date)} -{' '}
          {convertToUIDateFormat(secondInstalmentInfo.end_date)}.
        </p>
      )}

      <p>
        {t('common:applications.secondInstalmentUpload.condition')}
        <br />
        {t('common:applications.secondInstalmentUpload.conditionSpecial')}
      </p>

      {!applicationId && (
        <p>
          {t('common:applications.secondInstalmentUpload.missingApplicationId')}
        </p>
      )}
      <$Grid columns={1}>
        <$GridCell colSpan={1}>
          <$Checkbox
            id="employer-assurance"
            name="employer-assurance"
            label={`${t(
              'common:applications.secondInstalmentUpload.employerAssurance'
            )} *`}
            checked={assuranceChecked}
            disabled={isChangingEmployerAssurance}
            onChange={handleEmployerAssuranceChange}
            required
          />
        </$GridCell>
        <$GridCell colSpan={1}>
          <ul>
            <AttachmentsList
              as="li"
              attachments={attachments}
              attachmentType={ATTACHMENT_TYPES.PAYSLIP}
              attachmentTypeTranslationKey="payslip"
              required
            />
            <AttachmentsList
              as="li"
              attachments={attachments}
              attachmentType={ATTACHMENT_TYPES.OTHER_ATTACHMENT}
              attachmentTypeTranslationKey="otherAttachment"
            />
          </ul>
        </$GridCell>
      </$Grid>
      <$Grid columns={2} css={{ marginTop: '24px' }}>
        <$GridCell>
          <Button
            css={{ marginLeft: '16px' }}
            theme={ButtonPresetTheme.Black}
            variant={ButtonVariant.Secondary}
            disabled={isNavigatingBack}
            onClick={handleBack}
          >
            {t('common:applications.secondInstalmentUpload.buttons.back')}
          </Button>
        </$GridCell>
        <$GridCell justifySelf="end">
          <Button
            css={{ marginLeft: '16px' }}
            theme={ButtonPresetTheme.Coat}
            variant={ButtonVariant.Primary}
            disabled={
              isNavigatingBack ||
              isSubmittingSecondInstalmentResponse ||
              !hasPayslipAttachment ||
              !assuranceChecked ||
              !applicationId
            }
            iconEnd={<IconArrowRight />}
            onClick={handleSubmit}
          >
            {isSubmittingSecondInstalmentResponse ? (
              <LoadingSpinner small />
            ) : (
              t('common:applications.secondInstalmentUpload.buttons.submit')
            )}
          </Button>
        </$GridCell>
      </$Grid>
    </Container>
  );
};

export default SecondInstalmentUploadPage;
