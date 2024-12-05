import SummarySection from 'benefit/applicant/components/summarySection/SummarySection';
import { SUPPORTED_LANGUAGES } from 'benefit/applicant/constants';
import useCloneApplicationMutation from 'benefit/applicant/hooks/useCloneApplicationMutation';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import {
  BackendEndpoint,
  getBackendUrl,
} from 'benefit-shared/backend-api/backend-api';
import { ATTACHMENT_TYPES, BENEFIT_TYPES } from 'benefit-shared/constants';
import { Button, IconPen, IconPlus, IconPrinter } from 'hds-react';
import isEmpty from 'lodash/isEmpty';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { useTheme } from 'styled-components';

import ConsentViewer from '../consentViewer/ConsentViewer';
import StepperActions from '../stepperActions/StepperActions';
import AttachmentsListView from './attachmentsListView/AttachmentsListView';
import CompanyInfoView from './companyInfoView/CompanyInfoView';
import EmployeeView from './employeeView/EmployeeView';
import { useApplicationFormStep5 } from './useApplicationFormStep5';

type ExtendedProps = {
  isReadOnly?: boolean;
  setIsSubmittedApplication?: React.Dispatch<React.SetStateAction<boolean>>;
};

const ApplicationFormStep5: React.FC<
  DynamicFormStepComponentProps & ExtendedProps
> = ({ data, isReadOnly, setIsSubmittedApplication }) => {
  const {
    t,
    handleBack,
    handleSave,
    handleSubmit,
    handleDelete,
    handleStepChange,
    handleClose,
    translationsBase,
    isSubmit,
  } = useApplicationFormStep5(data, setIsSubmittedApplication);

  const {
    data: clonedData,
    isLoading,
    mutate: cloneApplication,
  } = useCloneApplicationMutation();

  const handleCloneApplication = (): void => cloneApplication(data?.id);
  const router = useRouter();

  useEffect(() => {
    if (clonedData?.id && data?.id) {
      void router.push(
        `${
          router.locale !== SUPPORTED_LANGUAGES.FI ? router.locale : ''
        }${router.asPath.replace(data?.id, clonedData.id)}`
      );
    }
  }, [clonedData?.id, router, data?.id]);

  const theme = useTheme();

  return (
    <>
      <CompanyInfoView
        isReadOnly={isReadOnly}
        data={data}
        handleStepChange={handleStepChange}
      />

      <EmployeeView
        isReadOnly={isReadOnly}
        data={data}
        handleStepChange={handleStepChange}
      />

      <SummarySection
        header={t(`${translationsBase}.attachments.heading1`)}
        action={
          !isReadOnly && (
            <Button
              theme="black"
              css={`
                margin-top: ${theme.spacing.s};
              `}
              onClick={() => handleStepChange(3)}
              variant="supplementary"
              iconLeft={<IconPen />}
            >
              {t(`common:applications.actions.edit`)}
            </Button>
          )
        }
      >
        {(data.benefitType === BENEFIT_TYPES.EMPLOYMENT ||
          data.benefitType === BENEFIT_TYPES.SALARY) && (
          <>
            <AttachmentsListView
              type={ATTACHMENT_TYPES.EMPLOYMENT_CONTRACT}
              title={t(
                `${translationsBase}.attachments.types.employmentContract.title`
              )}
              attachments={data.attachments || []}
            />
            <AttachmentsListView
              type={ATTACHMENT_TYPES.PAY_SUBSIDY_CONTRACT}
              title={t(
                `${translationsBase}.attachments.types.paySubsidyDecision.title`
              )}
              attachments={data.attachments || []}
            />
            <AttachmentsListView
              type={ATTACHMENT_TYPES.EDUCATION_CONTRACT}
              title={t(
                `${translationsBase}.attachments.types.educationContract.title`
              )}
              attachments={data.attachments || []}
            />
          </>
        )}
        {data.benefitType === BENEFIT_TYPES.COMMISSION && (
          <AttachmentsListView
            type={ATTACHMENT_TYPES.COMMISSION_CONTRACT}
            title={t(
              `${translationsBase}.attachments.types.commissionContract.title`
            )}
            attachments={data.attachments || []}
          />
        )}
        <AttachmentsListView
          type={ATTACHMENT_TYPES.HELSINKI_BENEFIT_VOUCHER}
          title={t(
            `${translationsBase}.attachments.types.helsinkiBenefitVoucher.title`
          )}
          attachments={data.attachments || []}
        />
      </SummarySection>
      <SummarySection
        paddingBottom={isEmpty(data.applicantTermsApproval)}
        header={t(`${translationsBase}.credentials.heading1`)}
        action={
          !isReadOnly && (
            <Button
              theme="black"
              css={`
                margin-top: ${theme.spacing.s};
              `}
              onClick={() => handleStepChange(4)}
              variant="supplementary"
              iconLeft={<IconPen />}
            >
              {t(`common:applications.actions.edit`)}
            </Button>
          )
        }
      >
        <AttachmentsListView
          type={ATTACHMENT_TYPES.EMPLOYEE_CONSENT}
          attachments={data.attachments || []}
        />
      </SummarySection>
      {!isEmpty(data.applicantTermsApproval) && (
        <SummarySection
          paddingBottom
          header={t(`${translationsBase}.send.heading1`)}
        >
          <ConsentViewer data={data} />
        </SummarySection>
      )}
      {isReadOnly ? (
        <$Grid>
          <$GridCell $colSpan={1}>
            <Button theme="black" variant="secondary" onClick={handleClose}>
              {t('common:utility.close')}
            </Button>
          </$GridCell>
          <$GridCell $colSpan={3}>
            <Button
              iconLeft={<IconPrinter />}
              theme="coat"
              role="link"
              variant="secondary"
              onClick={() =>
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                window.open(
                  `${getBackendUrl(BackendEndpoint.APPLICANT_PRINT)}${
                    data.id
                  }/`,
                  '_blank'
                )
              }
            >
              {t(`common:applications.actions.print`)}
            </Button>
          </$GridCell>
          <$GridCell $colSpan={8} justifySelf="end">
            <Button
              isLoading={isLoading}
              iconLeft={<IconPlus />}
              theme="coat"
              role="link"
              variant="secondary"
              onClick={() => handleCloneApplication()}
            >
              {t(`common:applications.actions.clone`)}
            </Button>
          </$GridCell>
        </$Grid>
      ) : (
        <StepperActions
          lastStep={isSubmit}
          handleSave={handleSave}
          handleSubmit={handleSubmit}
          handleBack={handleBack}
          handleDelete={handleDelete}
          applicationStatus={data?.status}
        />
      )}
    </>
  );
};

export default ApplicationFormStep5;
