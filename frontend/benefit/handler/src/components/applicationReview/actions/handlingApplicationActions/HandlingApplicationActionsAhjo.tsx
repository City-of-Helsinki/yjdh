import EditAction from 'benefit/handler/components/applicationReview/actions/editAction/EditAction';
import Sidebar from 'benefit/handler/components/sidebar/Sidebar';
import { APPLICATION_LIST_TABS } from 'benefit/handler/constants';
import useDecisionProposalDraftMutation from 'benefit/handler/hooks/applicationHandling/useDecisionProposalDraftMutation';
import {
  StepActionType,
  StepStateType,
} from 'benefit/handler/hooks/applicationHandling/useHandlingStepper';
import { useRouterNavigation } from 'benefit/handler/hooks/applicationHandling/useRouterNavigation';
import useCloneApplicationMutation from 'benefit/handler/hooks/useCloneApplicationMutation';
import useDownloadApplicationPdf from 'benefit/handler/hooks/useDownloadApplicationPdf';
import useUpdateCompanyIndustryCode from 'benefit/handler/hooks/useUpdateCompanyIndustryCode';
import { Application as HandlerApplication } from 'benefit/handler/types/application';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import {
  ButtonPresetTheme,
  ButtonVariant,
  IconArrowLeft,
  IconArrowRight,
  IconCopy,
  IconDownload,
  IconInfoCircle,
  IconLock,
  IconPen,
  IconTrash,
} from 'hds-react';
import noop from 'lodash/noop';
import { useRouter } from 'next/router';
import * as React from 'react';
import Button from 'shared/components/button/Button';
import Modal from 'shared/components/modal/Modal';
import showErrorToast from 'shared/components/toast/show-error-toast';
import theme from 'shared/styles/theme';
import {
  focusAndScroll,
  focusAndScrollToSelector,
} from 'shared/utils/dom.utils';

import CancelModalContent from './CancelModalContent/CancelModalContent';
import DoneModalContent from './DoneModalContent/DoneModalContent';
import {
  $Column,
  $CustomNotesActions,
  $Wrapper,
} from './HandlingApplicationActions.sc';
import { useHandlingApplicationActions } from './useHandlingApplicationActions';

export type Props = {
  application: Application;
  stepperDispatch: React.Dispatch<StepActionType>;
  stepState: StepStateType;
  'data-testid'?: string;
  isRecalculationRequired: boolean;
  isCalculationsErrors: boolean;
  isApplicationReadOnly: boolean;
};

const HandlingApplicationActions: React.FC<Props> = ({
  application,
  stepperDispatch,
  stepState,
  'data-testid': dataTestId,
  isRecalculationRequired,
  isCalculationsErrors,
  isApplicationReadOnly,
}) => {
  const {
    t,
    toggleMessagesDrawerVisibility,
    openDialog,
    closeDialog,
    closeDoneDialog,
    handleCancel,
    isMessagesDrawerVisible,
    translationsBase,
    isConfirmationModalOpen,
    isDoneConfirmationModalOpen,
    handledApplication,
    setHandledApplication,
    onDoneConfirmation,
  } = useHandlingApplicationActions(application);

  const { navigateBack } = useRouterNavigation(
    application?.status,
    application?.batch?.status,
    application?.archived
  );

  const lastStep =
    stepState.activeStepIndex === Number(stepState.steps?.length) - 1;
  const router = useRouter();
  const {
    data,
    mutate: updateApplication,
    isError,
  } = useDecisionProposalDraftMutation(application as HandlerApplication);

  const [isSavingAndClosing, setIsSavingAndClosing] = React.useState(false);
  const updateCompanyIndustryCode = useUpdateCompanyIndustryCode();

  const saveIndustryCodeIfNeeded = React.useCallback((): void => {
    if (
      stepState.activeStepIndex === 0 &&
      handledApplication?.grantedAsDeMinimisAid &&
      handledApplication?.industryCode &&
      application.company?.id &&
      !application.company?.industryCode
    ) {
      updateCompanyIndustryCode.mutate({
        companyId: application.company.id,
        industryCode: handledApplication.industryCode,
        industry: handledApplication.industryDescription,
      });
    }
  }, [
    stepState.activeStepIndex,
    handledApplication,
    application.company,
    updateCompanyIndustryCode,
  ]);

  // TODO: This callback is currently unused (dead code). Remove it once
  // index-navigation-on-save behavior is confirmed unnecessary.
  const navigateToIndex = React.useCallback((): void => {
    if (!application.status) return;
    void router.push({
      pathname: '/',
      query: {
        tab: APPLICATION_LIST_TABS[
          application.status as unknown as keyof typeof APPLICATION_LIST_TABS
        ],
      },
    });
  }, [router, application.status]);

  const effectSaveAndClose = (): void => {
    if (
      data?.review_step === stepState.activeStepIndex + 1 &&
      isSavingAndClosing
    ) {
      setIsSavingAndClosing(false);
      void navigateBack();
    }
  };

  const effectReviewStepChange = (): void => {
    if (data?.review_step) {
      stepperDispatch({
        type: 'completeStep',
        payload: data.review_step - 2,
      });
    }
  };

  const effectApplicationStatusChange = (): void => {
    if (
      application.status &&
      [APPLICATION_STATUSES.ACCEPTED, APPLICATION_STATUSES.REJECTED].includes(
        application.status
      ) &&
      stepState.activeStepIndex === 2
    ) {
      router.query.action = 'submit';
      void router.push(router);
    }
  };

  React.useEffect(effectApplicationStatusChange, [
    application.status,
    router,
    stepState.activeStepIndex,
  ]);
  React.useEffect(effectReviewStepChange, [data, stepperDispatch]);
  React.useEffect(effectSaveAndClose, [
    data,
    router,
    stepState.activeStepIndex,
    isSavingAndClosing,
    navigateToIndex,
    navigateBack,
  ]);
  React.useEffect(() => {
    setIsSavingAndClosing(false);
  }, [isError]);

  const isCalculationInvalid = (): boolean =>
    ((application.calculation?.rows || []).length === 0 &&
      handledApplication?.status === APPLICATION_STATUSES.ACCEPTED) ||
    isRecalculationRequired ||
    isCalculationsErrors;

  const getValidationFields = (): {
    missing: Record<string, boolean>;
    id: Record<string, string>;
  } => ({
    missing: {
      status: !handledApplication?.status,
      calculation: isCalculationInvalid(),
      logEntry:
        (handledApplication?.logEntryComment?.length ?? 0) <= 0 &&
        handledApplication?.status === APPLICATION_STATUSES.REJECTED,
      deMinimis:
        handledApplication?.status === APPLICATION_STATUSES.ACCEPTED &&
        handledApplication?.grantedAsDeMinimisAid === undefined,
      industryCode:
        handledApplication?.grantedAsDeMinimisAid === true &&
        !handledApplication?.industryCode &&
        !application.company?.industryCode,
      decisionMakerId:
        !handledApplication?.decisionMakerId ||
        handledApplication?.decisionMakerId?.length <= 0,
      signerId:
        !handledApplication?.signerId ||
        handledApplication?.signerId?.length <= 0,
      // Use longer length to take HTML tags into account
      decisionText:
        !handledApplication?.decisionText ||
        handledApplication.decisionText.length <= 10,
      justificationText:
        !handledApplication?.justificationText ||
        handledApplication.justificationText.length <= 10,
    },
    id: {
      status: '#proccessRejectedRadio',
      calculation: '#endDate',
      logEntry: '#proccessRejectedRadio',
      deMinimis: '#deminimisYes',
      industryCode: '#industryCodeInput',
      decisionMakerId: '#radio-decision-maker-0',
      decisionText: '[data-testid="decisionText"]',
      signerId: '[data-testid="decisionText"]',
      justificationText: '[data-testid="justificationText"]',
    },
  });

  const handleValidationErrors = (
    fields: ReturnType<typeof getValidationFields>
  ): void => {
    const missingFields = Object.keys(fields.missing).filter(
      (key) => fields.missing[key]
    );
    let interval = 0;
    missingFields.forEach((key, index) => {
      if (index === 0) {
        focusAndScrollToSelector(String(fields.id[key]));
      }
      setTimeout(() => {
        showErrorToast(
          t('common:review.decisionProposal.errors.title'),
          t(`common:review.decisionProposal.errors.fields.${key}`)
        );
      }, interval);
      interval += 200;
    });
  };

  const validateNextStep = (currentStepIndex: number): boolean => {
    // TODO: This branch appears unreachable via current UI because validateNextStep
    // is only triggered from Next/Send actions rendered for HANDLING status.
    // Remove this block if no non-UI call sites for validateNextStep are introduced.
    if (
      application.status &&
      application.status === APPLICATION_STATUSES.INFO_REQUIRED
    ) {
      focusAndScroll('header-info-needed');
      showErrorToast(
        t('common:status.additional_information_needed'),
        t('common:applications.statuses.additional_information_needed')
      );
      return true;
    }

    const fields = getValidationFields();
    if (fields.missing.industryCode) {
      setHandledApplication({
        ...handledApplication,
        industryCodeTouched: true,
      });
    }

    const errorStep1 =
      fields.missing.status ||
      fields.missing.calculation ||
      fields.missing.logEntry ||
      fields.missing.deMinimis ||
      fields.missing.industryCode;

    let errorStep2 = false;
    if (currentStepIndex > 0) {
      errorStep2 =
        fields.missing.decisionText ||
        fields.missing.justificationText ||
        fields.missing.signerId ||
        fields.missing.decisionMakerId;
    }

    if (errorStep1 || errorStep2) {
      const step2Fields = new Set([
        'decisionText',
        'justificationText',
        'signerId',
        'decisionMakerId',
      ]);
      const filteredFields = {
        ...fields,
        missing: Object.fromEntries(
          Object.entries(fields.missing).filter(
            ([key]) => currentStepIndex > 0 || !step2Fields.has(key)
          )
        ),
      };
      handleValidationErrors(filteredFields);
    }

    return errorStep1 || errorStep2;
  };

  const handleNext = (finishProposal = false): void => {
    saveIndustryCodeIfNeeded();
    if (finishProposal || stepState.activeStepIndex < 2) {
      updateApplication({
        ...handledApplication,
        reviewStep: Math.min(stepState.activeStepIndex + 2, 4),
        applicationId: application.id || '',
      });
    } else {
      // Final step, just open confirmation modal before submitting
      onDoneConfirmation();
    }
  };

  const handlePrev = (): void => {
    saveIndustryCodeIfNeeded();
    updateApplication({
      ...handledApplication,
      reviewStep: Math.max(0, stepState.activeStepIndex),
      applicationId: application.id || '',
    });
  };

  const handleSaveAndClose = (): void => {
    if (isCalculationInvalid()) {
      focusAndScroll('endDate');
      showErrorToast(
        t('common:review.decisionProposal.errors.title'),
        t(`common:review.decisionProposal.errors.fields.calculation`)
      );

      return;
    }
    updateApplication({
      ...handledApplication,
      reviewStep: stepState.activeStepIndex + 1,
      applicationId: application.id || '',
    });
    setIsSavingAndClosing(true);
  };

  const handleClose = (): void => void navigateBack();

  const { data: clonedData, mutate: cloneApplication } =
    useCloneApplicationMutation();

  const { mutate: downloadPdf, isPending: isDownloadingPdf } =
    useDownloadApplicationPdf();

  React.useEffect(() => {
    if (clonedData?.id) void router.push(`/application?id=${clonedData.id}`);
  }, [clonedData?.id, router]);

  const handleClone = (): void => {
    // eslint-disable-next-line no-alert
    if (globalThis.confirm('Haluatko varmasti kloonata tämän hakemuksen?')) {
      cloneApplication(application.id || '');
    }
  };

  const renderModals = (): React.ReactElement => (
    <>
      {isConfirmationModalOpen && (
        <Modal
          id="Handler-confirmDeleteApplicationModal"
          isOpen={isConfirmationModalOpen}
          title={t(`${translationsBase}.reasonCancelDialogTitle`)}
          submitButtonLabel=""
          cancelButtonLabel={t('common:applications.actions.close')}
          handleToggle={closeDialog}
          handleSubmit={noop}
          headerIcon={<IconInfoCircle />}
          submitButtonIcon={<IconTrash />}
          variant={ButtonVariant.Danger}
          customContent={
            <CancelModalContent onClose={closeDialog} onSubmit={handleCancel} />
          }
        />
      )}
      {isDoneConfirmationModalOpen && (
        <Modal
          id="Handler-confirmDecisionApplicationModal"
          isOpen={isDoneConfirmationModalOpen}
          title={t(`${translationsBase}.confirm`)}
          submitButtonLabel=""
          cancelButtonLabel={t('common:applications.actions.close')}
          handleToggle={closeDoneDialog}
          handleSubmit={noop}
          headerIcon={<IconInfoCircle />}
          className=""
          variant={ButtonVariant.Primary}
          theme={theme.components.modal.coat}
          customContent={
            <DoneModalContent
              handledApplication={handledApplication}
              onClose={closeDoneDialog}
              onSubmit={() => handleNext(true)}
              calculationRows={application.calculation?.rows || []}
            />
          }
        />
      )}
    </>
  );

  return (
    <$Wrapper data-testid={dataTestId}>
      <$Column>
        <Button
          onClick={handleClose}
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
        >
          {t(`${translationsBase}.close`)}
        </Button>

        {application.status === APPLICATION_STATUSES.HANDLING && (
          <Button
            loadingText={t('common:utility.loading')}
            onClick={handleSaveAndClose}
            disabled={isSavingAndClosing || isApplicationReadOnly}
            isLoading={isSavingAndClosing}
            theme={ButtonPresetTheme.Black}
            variant={ButtonVariant.Secondary}
          >
            {t(`${translationsBase}.saveAndContinue`)}
          </Button>
        )}

        <Button
          onClick={toggleMessagesDrawerVisibility}
          theme={ButtonPresetTheme.Black}
          variant={ButtonVariant.Secondary}
          iconStart={<IconPen />}
        >
          {t(`${translationsBase}.handlingPanel`)}
        </Button>

        {application.archived && (
          <Button
            onClick={() => application.id && downloadPdf(application.id)}
            disabled={!application.id}
            theme={ButtonPresetTheme.Black}
            variant={ButtonVariant.Secondary}
            iconStart={<IconDownload />}
            isLoading={isDownloadingPdf}
          >
            {t(`${translationsBase}.downloadPdf`)}
          </Button>
        )}

        {application.status &&
          process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT !== 'production' &&
          stepState.activeStepIndex === 0 &&
          [
            APPLICATION_STATUSES.ACCEPTED,
            APPLICATION_STATUSES.REJECTED,
            APPLICATION_STATUSES.HANDLING,
            APPLICATION_STATUSES.RECEIVED,
          ].includes(application.status) && (
            <Button
              iconStart={<IconCopy />}
              onClick={handleClone}
              theme={ButtonPresetTheme.Black}
              variant={ButtonVariant.Supplementary}
            >
              {t(`${translationsBase}.clone`)}
            </Button>
          )}

        {application.status &&
          ![
            APPLICATION_STATUSES.CANCELLED,
            APPLICATION_STATUSES.ACCEPTED,
            APPLICATION_STATUSES.REJECTED,
          ].includes(application.status) &&
          stepState.activeStepIndex === 0 &&
          !application.archived && (
            <Button
              onClick={openDialog}
              theme={ButtonPresetTheme.Black}
              disabled={isApplicationReadOnly && !application.ahjoCaseId}
              variant={ButtonVariant.Supplementary}
              iconStart={<IconTrash />}
            >
              {t(`${translationsBase}.cancel`)}
            </Button>
          )}
      </$Column>

      {application?.status === APPLICATION_STATUSES.HANDLING && (
        <$Column>
          {stepState.activeStepIndex !== 0 && (
            <Button
              variant={ButtonVariant.Secondary}
              theme={ButtonPresetTheme.Black}
              iconStart={<IconArrowLeft />}
              onClick={() => handlePrev()}
            >
              {t('common:utility.previous')}
            </Button>
          )}
          <Button
            theme={ButtonPresetTheme.Coat}
            variant={ButtonVariant.Primary}
            disabled={isApplicationReadOnly}
            style={{ minWidth: '158px' }}
            onClick={() =>
              validateNextStep(stepState.activeStepIndex) ? null : handleNext()
            }
            iconEnd={lastStep ? undefined : <IconArrowRight />}
          >
            {lastStep ? t('common:utility.send') : t('common:utility.next')}
          </Button>
        </$Column>
      )}

      {renderModals()}
      <Sidebar
        application={application as HandlerApplication}
        isOpen={isMessagesDrawerVisible}
        onClose={toggleMessagesDrawerVisibility}
        customItemsMessages={[
          <EditAction application={application} key="edit" />,
        ]}
        customItemsNotes={[
          <$CustomNotesActions key="showToHandlerOnly">
            <IconLock />
            <p>{t('common:messenger.showToHandlerOnly')}</p>
          </$CustomNotesActions>,
        ]}
      />
    </$Wrapper>
  );
};

export default HandlingApplicationActions;
