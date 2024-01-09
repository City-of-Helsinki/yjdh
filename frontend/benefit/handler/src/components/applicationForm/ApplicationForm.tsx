import { ROUTES } from 'benefit/handler/constants';
import { useApplicationFormContext } from 'benefit/handler/hooks/useApplicationFormContext';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import {
  Button,
  Dialog,
  IconAlertCircle,
  IconAngleLeft,
  LoadingSpinner,
  Stepper,
} from 'hds-react';
import React, { useEffect } from 'react';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';

import ApplicationHeader from '../applicationHeader/ApplicationHeader';
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
    deMinimisAidSet,
    attachments,
    dispatchStep,
    stepState,
    isLoading,
    checkedConsentArray,
    getConsentErrorText,
    handleConsentClick,
  } = useApplicationForm();

  const { isFormActionEdit, isFormActionNew } = useApplicationFormContext();

  const stepperCss = {
    'pointer-events': 'none',
    p: {
      'text-decoration': 'none !important',
    },
    '--hds-not-selected-step-label-color': theme.colors.black90,
    '--hds-step-background-color': 'var(--color-white)',
    '--hds-step-content-color': theme.colors.black90,
    '--hds-stepper-background-color': 'var(--color-white)',
    '--hds-stepper-color': theme.colors.black90,
    '--hds-stepper-disabled-color': 'var(--color-black-30)',
    '--hds-stepper-focus-border-color': theme.colors.black90,
  };

  useEffect(() => {
    if (!application.applicationOrigin) {
      return;
    }
    // Case /new route is used but the application is already submitted
    if (isFormActionNew && application?.status !== APPLICATION_STATUSES.DRAFT) {
      void router.push(`${ROUTES.APPLICATION_FORM_EDIT}?id=${application.id}`);
    }
    // Case /edit route is used but the application is still in draft state
    if (isFormActionEdit && application.status === 'draft') {
      void router.push(`${ROUTES.APPLICATION_FORM_NEW}?id=${application.id}`);
    }
  }, [
    isFormActionNew,
    router,
    application.applicationOrigin,
    application.status,
    application.id,
    isFormActionEdit,
  ]);

  if (isLoading) {
    return (
      <$SpinnerContainer>
        <LoadingSpinner />
      </$SpinnerContainer>
    );
  }

  return (
    <Container>
      {isFormActionNew && (
        <>
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
        </>
      )}

      {stepState.activeStepIndex === 0 && isFormActionNew && <CompanySearch />}
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
          <Review
            data={application}
            fields={fields}
            dispatchStep={dispatchStep}
          />
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
          variant="primary"
          theme={{ '--accent-line-color': 'var(--color-coat-of-arms)' }}
        >
          <Dialog.Header
            title={t(`${translationsBase}.backWithoutSavingConfirm`)}
            id="back-dialog-header"
            iconLeft={<IconAlertCircle aria-hidden="true" />}
          />
          <Dialog.Content>
            {t(`${translationsBase}.backWithoutSavingDescription`)}
          </Dialog.Content>
          <Dialog.ActionButtons>
            <Button
              theme="coat"
              variant="secondary"
              onClick={() => setIsConfirmationModalOpen(false)}
              data-testid="modalCancel"
            >
              {t(`${translationsBase}.backWithoutBack`)}
            </Button>
            <Button
              theme="coat"
              variant="primary"
              onClick={() => router.push(ROUTES.HOME)}
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
