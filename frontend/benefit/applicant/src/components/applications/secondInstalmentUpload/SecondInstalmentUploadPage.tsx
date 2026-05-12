import AttachmentsList from 'benefit/applicant/components/applications/forms/application/step3/attachmentsList/AttachmentsList';
import { ROUTES } from 'benefit/applicant/constants';
import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import useSecondInstalmentInfoQuery from 'benefit/applicant/hooks/useSecondInstalmentInfoQuery';
import useSecondInstalmentRespondMutation from 'benefit/applicant/hooks/useSecondInstalmentRespondMutation';
import { useTranslation } from 'benefit/applicant/i18n';
import { ATTACHMENT_TYPES } from 'benefit-shared/constants';
import { Button, IconArrowRight, LoadingSpinner } from 'hds-react';
import { useRouter } from 'next/router';
import React from 'react';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import showErrorToast from 'shared/components/toast/show-error-toast';
import showSuccessToast from 'shared/components/toast/show-success-toast';
import { BenefitAttachment } from 'shared/types/attachment';
import {
  convertToUIDateAndTimeFormat,
  convertToUIDateFormat,
} from 'shared/utils/date.utils';

const FOG_COLOR = 'var(--color-fog)';

const formatEuroAmount = (amount: number | string): string =>
  new Intl.NumberFormat('fi-FI', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(amount));

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
  const { t } = useTranslation();
  const router = useRouter();
  const [isNavigatingBack, setIsNavigatingBack] = React.useState(false);

  const applicationId =
    typeof router.query.id === 'string' ? router.query.id : undefined;

  const { data: application } = useApplicationQuery(applicationId ?? '');
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
          void router.replace(`${ROUTES.APPLICATION_FORM}?id=${applicationId}`);
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
          <$Grid columns={12} css={{ marginBottom: '24px' }}>
            <$GridCell $colSpan={6}>
              <span css={{ color: FOG_COLOR }}>
                {secondInstalmentInfo.employee_first_name}&nbsp;
                {secondInstalmentInfo.employee_last_name}
              </span>
            </$GridCell>
            <$GridCell $colSpan={6} justifySelf="end">
              <span css={{ color: FOG_COLOR }}>
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
          <hr css={{ color: FOG_COLOR }} />
        </>
      )}

      {secondInstalmentInfo && (
        <p>
          Tuen toinen maksuerä on{' '}
          {formatEuroAmount(secondInstalmentInfo.amount)} euroa ajalle{' '}
          {convertToUIDateFormat(secondInstalmentInfo.start_date)} -{' '}
          {convertToUIDateFormat(secondInstalmentInfo.end_date)}
        </p>
      )}

      <p>{t('common:applications.secondInstalmentUpload.condition')}</p>

      {!applicationId && (
        <p>
          {t('common:applications.secondInstalmentUpload.missingApplicationId')}
        </p>
      )}

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
      <$Grid columns={2} css={{ marginTop: '24px' }}>
        <$GridCell>
          <Button
            css={{ marginLeft: '16px' }}
            theme="black"
            variant="secondary"
            disabled={isNavigatingBack}
            onClick={handleBack}
          >
            {t('common:applications.secondInstalmentUpload.buttons.back')}
          </Button>
        </$GridCell>
        <$GridCell justifySelf="end">
          <Button
            css={{ marginLeft: '16px' }}
            theme="coat"
            variant="primary"
            disabled={
              isNavigatingBack ||
              isSubmittingSecondInstalmentResponse ||
              !applicationId
            }
            iconRight={<IconArrowRight />}
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
