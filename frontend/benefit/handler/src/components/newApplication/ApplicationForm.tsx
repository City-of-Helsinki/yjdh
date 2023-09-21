import {
  Button,
  Dialog,
  IconAngleLeft,
  LoadingSpinner,
  Stepper,
} from 'hds-react';
import React from 'react';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';

import ActionBar from './actionBar/ActionBar';
import { $MainHeading, $SpinnerContainer } from './ApplicationForm.sc';
import CompanySearch from './companySearch/CompanySearch';
import FormContent from './formContent/FormContent';
import Review from './review/Review';
import { useApplicationForm } from './useApplicationForm';

const ApplicationForm: React.FC = () => {
  const {
    id,
    t,
    isConfirmationModalOpen,
    setIsConfirmationModalOpen,
    translationsBase,
    router,
    application,
    formik,
    fields,
    handleSave,
    handleQuietSave,
    handleSubmit,
    handleSaveDraft,
    handleDelete,
    showDeminimisSection,
    minEndDate,
    maxEndDate,
    setEndDate,
    getSelectValue,
    subsidyOptions,
    deMinimisAidSet,
    attachments,
    dispatchStep,
    stepState,
    isLoading,
    checkedConsentArray,
    getConsentErrorText,
    handleConsentClick,
  } = useApplicationForm();

  // 'theme' prop didn't work for some reason
  const colorBlack90 = 'var(--color-black-90)';
  const stepperCss = {
    'pointer-events': 'none',
    p: {
      'text-decoration': 'none !important',
    },
    '--hds-not-selected-step-label-color': colorBlack90,
    '--hds-step-background-color': 'var(--color-white)',
    '--hds-step-content-color': colorBlack90,
    '--hds-stepper-background-color': 'var(--color-white)',
    '--hds-stepper-color': colorBlack90,
    '--hds-stepper-disabled-color': 'var(--color-black-30)',
    '--hds-stepper-focus-border-color': colorBlack90,
  };

  if (isLoading) {
    return (
      <$SpinnerContainer>
        <LoadingSpinner />
      </$SpinnerContainer>
    );
  }

  return (
    <Container>
      <$Grid>
        <$GridCell $colSpan={6} css="display: flex; align-items: center;">
          <Button
            variant="supplementary"
            role="link"
            size="small"
            theme="black"
            iconLeft={<IconAngleLeft />}
            onClick={() =>
              id ? setIsConfirmationModalOpen(true) : router.push('/')
            }
          >
            {t(`${translationsBase}.back2`)}
          </Button>
        </$GridCell>
        <$GridCell $colSpan={6}>
          <Stepper
            steps={stepState.steps}
            language="fi"
            selectedStep={stepState.activeStepIndex}
            onStepClick={(e) => e.stopPropagation()}
            css={stepperCss}
          />
        </$GridCell>
      </$Grid>
      <div>
        <$MainHeading>{t('common:mainIngress.heading')}</$MainHeading>
      </div>
      {stepState.activeStepIndex === 0 && <CompanySearch />}
      {stepState.activeStepIndex === 1 && (
        <>
          <FormContent
            application={application}
            formik={formik}
            fields={fields}
            handleSave={handleSave}
            handleQuietSave={handleQuietSave}
            showDeminimisSection={showDeminimisSection}
            minEndDate={minEndDate}
            maxEndDate={maxEndDate}
            setEndDate={setEndDate}
            getSelectValue={getSelectValue}
            paySubsidyOptions={subsidyOptions}
            deMinimisAidSet={deMinimisAidSet}
            attachments={attachments}
            checkedConsentArray={checkedConsentArray}
            getConsentErrorText={getConsentErrorText}
            handleConsentClick={handleConsentClick}
          />
          <ActionBar
            id={id}
            handleSave={handleSave}
            handleSaveDraft={handleSaveDraft}
            handleDelete={handleDelete}
          />
        </>
      )}
      {stepState.activeStepIndex === 2 && (
        <>
          <Review data={application} />
          <ActionBar
            id={id}
            handleSubmit={handleSubmit}
            handleSaveDraft={handleSaveDraft}
            handleDelete={handleDelete}
            handleBack={() => dispatchStep({ type: 'setActive', payload: 1 })}
          />
        </>
      )}
      {isConfirmationModalOpen && (
        <Dialog
          id="back-dialog"
          aria-labelledby="back-dialog"
          isOpen={isConfirmationModalOpen}
          close={() => setIsConfirmationModalOpen(false)}
          closeButtonLabelText={t(`${translationsBase}.close`)}
          variant="danger"
        >
          <Dialog.Header
            title={t(`${translationsBase}.backWithoutSavingConfirm`)}
            id="back-dialog-header"
          />
          <Dialog.Content>
            {t(`${translationsBase}.backWithoutSavingDescription`)}
          </Dialog.Content>
          <Dialog.ActionButtons>
            <Button
              theme="black"
              variant="secondary"
              onClick={() => setIsConfirmationModalOpen(false)}
              data-testid="modalCancel"
            >
              {t(`${translationsBase}.close`)}
            </Button>
            <Button
              theme="coat"
              variant="danger"
              onClick={() => router.push('/')}
              data-testid="modalBack"
            >
              {t(`${translationsBase}.backWithoutSaving`)}
            </Button>
          </Dialog.ActionButtons>
        </Dialog>
      )}
    </Container>
  );
};

export default ApplicationForm;
