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
import ActionBarEdit from './actionBar/ActionBarEdit';
import ActionBarNew from './actionBar/ActionBarNew';
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
    handleValidation,
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
    initialApplication,
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
    <>
      {isFormActionEdit && <ApplicationHeader data={application} />}

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
              <$MainHeading>
                {t('common:applications.pageHeaders.new')}
              </$MainHeading>
            </div>
          </>
        )}

        {stepState.activeStepIndex === 0 && isFormActionNew && (
          <CompanySearch />
        )}
        {stepState.activeStepIndex === 1 && (
          <>
            <FormContent
              application={application}
              formik={formik}
              fields={fields}
              handleSave={handleSave}
              handleQuietSave={isFormActionNew ? handleQuietSave : null}
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
            {isFormActionEdit && (
              <ActionBarEdit
                id={id}
                fields={fields}
                initialApplication={initialApplication}
                formik={formik}
                handleSave={handleSave}
                handleValidation={handleValidation}
              />
            )}
            {isFormActionNew && (
              <ActionBarNew
                id={id}
                handleSave={handleSave}
                handleSaveDraft={handleSaveDraft}
                handleDelete={handleDelete}
              />
            )}
          </>
        )}
        {stepState.activeStepIndex === 2 && isFormActionNew && (
          <>
            <Review
              data={application}
              fields={fields}
              dispatchStep={dispatchStep}
            />
            <ActionBarNew
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
            theme={theme.components.modal.coat}
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
    </>
  );
};

export default ApplicationForm;
