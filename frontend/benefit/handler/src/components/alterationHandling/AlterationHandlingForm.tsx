import { AxiosError } from 'axios';
import AlterationCalculator from 'benefit/handler/components/alterationHandling/AlterationCalculator';
import AlterationCsvButton from 'benefit/handler/components/alterationHandling/AlterationCsvButton';
import {
  $PageHeading,
  $SaveActionFormErrorText,
  $StickyBarColumn,
  $StickyBarWrapper,
  $TalpaGuideText,
} from 'benefit/handler/components/alterationHandling/AlterationHandling.sc';
import AlterationHandlingConfirmationModal from 'benefit/handler/components/alterationHandling/AlterationHandlingConfirmationModal';
import AlterationHandlingSection from 'benefit/handler/components/alterationHandling/AlterationHandlingSection';
import AlterationSummary from 'benefit/handler/components/alterationHandling/AlterationSummary';
import useAlterationHandlingForm from 'benefit/handler/components/alterationHandling/useAlterationHandlingForm';
import { $CustomNotesActions } from 'benefit/handler/components/applicationReview/actions/handlingApplicationActions/HandlingApplicationActions.sc';
import Sidebar from 'benefit/handler/components/sidebar/Sidebar';
import { DEFAULT_MINIMUM_RECOVERY_AMOUNT } from 'benefit/handler/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import { getErrorText } from 'benefit-shared/utils/forms';
import {
  Button,
  IconAlertCircleFill,
  IconCheck,
  IconLock,
  IconPen,
  Notification,
  RadioButton,
  SelectionGroup,
  TextArea,
} from 'hds-react';
import React, { useState } from 'react';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import StickyActionBar from 'shared/components/stickyActionBar/StickyActionBar';
import { $StickyBarSpacing } from 'shared/components/stickyActionBar/StickyActionBar.sc';
import { getNumberValue } from 'shared/utils/string.utils';

type Props = {
  application: Application;
  alteration: ApplicationAlteration;
  onError: (error: AxiosError<unknown>) => void;
  onSuccess: (isRecoverable: boolean) => void;
  onClose: () => void;
};

const AlterationHandlingForm = ({
  application,
  alteration,
  onError,
  onSuccess,
  onClose,
}: Props): JSX.Element => {
  const {
    t,
    formik,
    isSubmitted,
    isSubmitting,
    handleAlteration,
    validateForm,
  } = useAlterationHandlingForm({
    onError,
    onSuccess,
    application,
    alteration,
  });

  const [isCalculationOutOfDate, setCalculationOutOfDate] =
    useState<boolean>(true);

  const [isConfirmationModalOpen, setConfirmationModalOpen] =
    useState<boolean>(false);

  const [isMessagesDrawerVisible, toggleMessagesDrawerVisibility] =
    useState<boolean>(false);

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, isSubmitted);

  const openConfirmationModal = (): void => {
    void validateForm().then((isValid) => {
      if (isValid) {
        setConfirmationModalOpen(true);
      }

      return null;
    });
  };

  const translationBase = 'common:applications.alterations.handling';

  const hasErrors =
    Object.keys(formik.errors).length > 0 || isCalculationOutOfDate;

  const isNonRecoverableOverLimit =
    !formik.values.isRecoverable &&
    getNumberValue(formik.values.recoveryAmount) >
      DEFAULT_MINIMUM_RECOVERY_AMOUNT;

  return (
    <>
      <Container>
        <$PageHeading>
          {t(`${translationBase}.headings.pageHeading`)}
        </$PageHeading>
        <AlterationHandlingSection
          heading={t(`${translationBase}.headings.alterationData`)}
          withBottomHeadingBorder
        >
          <AlterationSummary
            alteration={alteration}
            application={application}
          />
        </AlterationHandlingSection>

        <AlterationHandlingSection
          heading={t(`${translationBase}.headings.recoveryCalculator`)}
        >
          <AlterationCalculator
            formik={formik}
            application={application}
            getErrorMessage={getErrorMessage}
            onCalculationChange={setCalculationOutOfDate}
          />
        </AlterationHandlingSection>

        <AlterationHandlingSection
          heading={t(`${translationBase}.headings.isRecoverable`)}
        >
          <$Grid>
            <$GridCell $colSpan={12}>
              <SelectionGroup
                id="is-recoverable"
                label={t(`${translationBase}.fields.isRecoverable.label`)}
                direction="vertical"
                required
                errorText={
                  isCalculationOutOfDate
                    ? null
                    : getErrorMessage('isRecoverable')
                }
                tooltipText={t(
                  `${translationBase}.fields.isRecoverable.hintText`
                )}
              >
                <RadioButton
                  id="is-recoverable-yes"
                  name="isRecoverable"
                  label={t(`${translationBase}.fields.isRecoverable.yes`)}
                  value="1"
                  onBlur={formik.handleBlur}
                  onChange={() => {
                    formik.setFieldValue('isRecoverable', true);
                  }}
                  checked={formik.values.isRecoverable === true}
                />
                <RadioButton
                  id="is-recoverable-no"
                  name="isRecoverable"
                  label={t(`${translationBase}.fields.isRecoverable.no`)}
                  value="0"
                  onBlur={formik.handleBlur}
                  onChange={() => {
                    formik.setFieldValue('isRecoverable', false);
                  }}
                  checked={formik.values.isRecoverable === false}
                />
              </SelectionGroup>
            </$GridCell>
            <$GridCell $colSpan={6}>
              {isNonRecoverableOverLimit && (
                <Notification
                  label={t(
                    `${translationBase}.fields.isRecoverable.limitWarning.heading`
                  )}
                  type="alert"
                >
                  {t(
                    `${translationBase}.fields.isRecoverable.limitWarning.body`,
                    {
                      limit: DEFAULT_MINIMUM_RECOVERY_AMOUNT,
                    }
                  )}
                </Notification>
              )}
            </$GridCell>
          </$Grid>
        </AlterationHandlingSection>

        <AlterationHandlingSection
          heading={
            formik.values.isRecoverable
              ? t(`${translationBase}.headings.recoveryJustification`)
              : t(`${translationBase}.headings.noRecoveryJustification`)
          }
        >
          <$Grid>
            <$GridCell $colSpan={8}>
              <TextArea
                label={
                  formik.values.isRecoverable
                    ? t(`${translationBase}.fields.recoveryJustification.label`)
                    : t(
                        `${translationBase}.fields.noRecoveryJustification.label`
                      )
                }
                value={formik.values.recoveryJustification}
                id="recovery-justification"
                name="recoveryJustification"
                required
                invalid={!!getErrorMessage('recoveryJustification')}
                aria-invalid={!!getErrorMessage('recoveryJustification')}
                errorText={getErrorMessage('recoveryJustification')}
                onChange={(e) =>
                  formik.setFieldValue('recoveryJustification', e.target.value)
                }
                onBlur={formik.handleBlur}
              />
            </$GridCell>
          </$Grid>
        </AlterationHandlingSection>

        {formik.values.isRecoverable && (
          <AlterationHandlingSection
            heading={t(`${translationBase}.headings.downloadTalpaCsv`)}
          >
            <$Grid>
              <$GridCell $colSpan={12}>
                <$TalpaGuideText>
                  {t(`${translationBase}.talpaCsv.guideText`)}
                </$TalpaGuideText>
                <AlterationCsvButton alteration={alteration} />
              </$GridCell>
            </$Grid>
          </AlterationHandlingSection>
        )}
      </Container>
      <StickyActionBar>
        <$StickyBarWrapper>
          <$StickyBarColumn>
            <Button onClick={onClose} theme="black" variant="secondary">
              {t(`${translationBase}.actions.close`)}
            </Button>
            <Button
              onClick={() =>
                toggleMessagesDrawerVisibility(!isMessagesDrawerVisible)
              }
              theme="black"
              variant="secondary"
              iconLeft={<IconPen />}
            >
              {t('common:review.actions.handlingPanel')}
            </Button>
          </$StickyBarColumn>
          <$StickyBarColumn>
            {hasErrors && isSubmitted && (
              <$SaveActionFormErrorText>
                <IconAlertCircleFill />
                {isCalculationOutOfDate ? (
                  <p aria-live="polite">
                    {t(`${translationBase}.error.calculationOutOfDate`)}
                  </p>
                ) : (
                  <p aria-live="polite">
                    {t(`${translationBase}.error.dirtyOrInvalidForm`)}
                  </p>
                )}
              </$SaveActionFormErrorText>
            )}
            <Button
              onClick={openConfirmationModal}
              theme="coat"
              iconLeft={<IconCheck />}
              disabled={
                isSubmitting ||
                (isSubmitted && (!formik.isValid || isCalculationOutOfDate))
              }
              isLoading={isSubmitting}
              loadingText={t('common:utility.submitting')}
            >
              {t(`${translationBase}.actions.handle`)}
            </Button>
          </$StickyBarColumn>
        </$StickyBarWrapper>
      </StickyActionBar>
      <$StickyBarSpacing />
      <AlterationHandlingConfirmationModal
        onClose={() => setConfirmationModalOpen(false)}
        onSubmit={handleAlteration}
        isOpen={isConfirmationModalOpen}
        isWorking={isSubmitting}
        values={formik.values}
      />
      <Sidebar
        isOpen={isMessagesDrawerVisible}
        messagesReadOnly
        application={application}
        onClose={() => toggleMessagesDrawerVisibility(false)}
        customItemsNotes={
          <$CustomNotesActions>
            <IconLock />
            <p>{t('common:messenger.showToHandlerOnly')}</p>
          </$CustomNotesActions>
        }
      />
    </>
  );
};

export default AlterationHandlingForm;
