import SummarySection from 'benefit/applicant/components/summarySection/SummarySection';
import { DynamicFormStepComponentProps } from 'benefit/applicant/types/common';
import {
  BackendEndpoint,
  getBackendUrl,
} from 'benefit-shared/backend-api/backend-api';
import { ATTACHMENT_TYPES, BENEFIT_TYPES } from 'benefit-shared/constants';
import { Button, IconPen, IconPrinter } from 'hds-react';
import isEmpty from 'lodash/isEmpty';
import React from 'react';
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
  onSubmit?: () => void;
};

const ApplicationFormStep5: React.FC<
  DynamicFormStepComponentProps & ExtendedProps
> = ({ data, isReadOnly, onSubmit }) => {
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
  } = useApplicationFormStep5(data, onSubmit);

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
          <$GridCell $colSpan={11}>
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
              Tulosta hakemus
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
        />
      )}
    </>
  );
};

export default ApplicationFormStep5;
