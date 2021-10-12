import { ATTACHMENT_TYPES, BENEFIT_TYPES } from 'benefit/applicant/constants';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import { Button, IconPen } from 'hds-react';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
import FormSection from 'shared/components/forms/section/FormSection';
import { useTheme } from 'styled-components';

import ConsentViewer from '../consentViewer/ConsentViewer';
import StepperActions from '../stepperActions/StepperActions';
import AttachmentsListView from './attachmentsListView/AttachmentsListView';
import CompanyInfoView from './companyInfoView/CompanyInfoView';
import EmployeeView from './employeeView/EmployeeView';
import { useApplicationFormStep5 } from './useApplicationFormStep5';

const ApplicationFormStep5: React.FC<DynamicFormStepComponentProps> = ({
  data,
}) => {
  const {
    t,
    handleBack,
    handleNext,
    handleSave,
    handleStepChange,
    translationsBase,
    isSubmit,
  } = useApplicationFormStep5(data);

  const theme = useTheme();

  return (
    <>
      <CompanyInfoView data={data} handleStepChange={handleStepChange} />

      <EmployeeView data={data} handleStepChange={handleStepChange} />

      <FormSection
        header={t(`${translationsBase}.attachments.heading1`)}
        action={
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
        }
      >
        <>
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
        </>
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
      </FormSection>
      <FormSection
        paddingBottom={isEmpty(data.applicantTermsApproval)}
        header={t(`${translationsBase}.credentials.heading2`)}
        action={
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
        }
      >
        <AttachmentsListView
          type={ATTACHMENT_TYPES.EMPLOYEE_CONSENT}
          attachments={data.attachments || []}
        />
      </FormSection>
      {!isEmpty(data.applicantTermsApproval) && (
        <FormSection
          paddingBottom
          header={t(`${translationsBase}.send.heading1`)}
        >
          <ConsentViewer data={data} />
        </FormSection>
      )}
      <StepperActions
        lastStep={isSubmit}
        handleSave={handleSave}
        handleSubmit={handleNext}
        handleBack={handleBack}
      />
    </>
  );
};

export default ApplicationFormStep5;
