import { AxiosError } from 'axios';
import {
  $AlterationDetails,
  $PageHeading,
  $SaveActionFormErrorText,
  $StickyBarColumn,
  $StickyBarWrapper,
  $TalpaGuideText,
} from 'benefit/handler/components/alterationHandling/AlterationHandling.sc';
import AlterationHandlingSection from 'benefit/handler/components/alterationHandling/AlterationHandlingSection';
import useAlterationHandlingForm from 'benefit/handler/components/alterationHandling/useAlterationHandlingForm';
import { getErrorText } from 'benefit/handler/utils/forms';
import { ALTERATION_TYPE } from 'benefit-shared/constants';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import {
  Button,
  DateInput,
  IconAlertCircleFill,
  IconCheck,
  IconDownload,
  RadioButton,
  SelectionGroup,
  TextArea,
  TextInput,
} from 'hds-react';
import React from 'react';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import StickyActionBar from 'shared/components/stickyActionBar/StickyActionBar';
import { $StickyBarSpacing } from 'shared/components/stickyActionBar/StickyActionBar.sc';
import {
  convertToBackendDateFormat,
  formatDate,
} from 'shared/utils/date.utils';
import {
  formatStringFloatValue,
  stringFloatToFixed,
} from 'shared/utils/string.utils';

type Props = {
  application: Application;
  alteration: ApplicationAlteration;
  onError: (error: AxiosError<unknown>) => void;
  onSuccess: () => void;
  onClose: () => void;
};

const AlterationHandlingForm = ({
  application,
  alteration,
  onError,
  onSuccess,
  onClose,
}: Props): JSX.Element => {
  const { t, formik, isSubmitted, isSubmitting, handleAlteration } =
    useAlterationHandlingForm({
      onError,
      onSuccess,
      application,
      alteration,
    });
  const translationBase = 'common:applications.alterations.handling';

  const getErrorMessage = (fieldName: string): string | undefined =>
    getErrorText(formik.errors, formik.touched, fieldName, t, isSubmitted);

  const hasErrors = Object.keys(formik.errors).length > 0;

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
          <$AlterationDetails>
            <div>
              <dt>{t(`${translationBase}.summary.type.label`)}</dt>
              <dd>
                {t(
                  `${translationBase}.summary.type.${alteration.alterationType}`
                )}
              </dd>
            </div>
            <div>
              <dt>{t(`${translationBase}.summary.endDate`)}</dt>
              <dd>{formatDate(new Date(alteration.endDate))}</dd>
            </div>
            <div>
              {alteration.alterationType === ALTERATION_TYPE.SUSPENSION && (
                <>
                  <dt>{t(`${translationBase}.summary.resumeDate`)}</dt>
                  <dd>{formatDate(new Date(alteration.resumeDate))}</dd>
                </>
              )}
            </div>
            <div />
            <div>
              <dt>{t(`${translationBase}.summary.contactPerson`)}</dt>
              <dd>{alteration.contactPersonName}</dd>
            </div>
            {alteration.useEinvoice ? (
              <>
                <div>
                  <dt>
                    {t(`${translationBase}.summary.einvoiceProviderName`)}
                  </dt>
                  <dd>{alteration.einvoiceProviderName}</dd>
                </div>
                <div>
                  <dt>
                    {t(`${translationBase}.summary.einvoiceProviderIdentifier`)}
                  </dt>
                  <dd>{alteration.einvoiceProviderIdentifier}</dd>
                </div>
                <div>
                  <dt>{t(`${translationBase}.summary.einvoiceAddress`)}</dt>
                  <dd>{alteration.einvoiceAddress}</dd>
                </div>
              </>
            ) : (
              <>
                <div>
                  <dt>{t(`${translationBase}.summary.billingAddress`)}</dt>
                  <dd>
                    {application.company.streetAddress},{' '}
                    {application.company.postcode} {application.company.city}
                  </dd>
                </div>
                <div />
                <div />
              </>
            )}
            <div>
              <dt>
                {alteration.alterationType === ALTERATION_TYPE.TERMINATION
                  ? t(`${translationBase}.summary.reasonTermination`)
                  : t(`${translationBase}.summary.reasonSuspension`)}
              </dt>
              <dd>{alteration.reason || '-'}</dd>
            </div>
          </$AlterationDetails>
        </AlterationHandlingSection>

        <AlterationHandlingSection
          heading={t(`${translationBase}.headings.recoveryCalculator`)}
        >
          <$Grid>
            <$GridCell $colSpan={3}>
              <DateInput
                label={t(`${translationBase}.fields.recoveryStartDate.label`)}
                value={formik.values.recoveryStartDate}
                id="recovery-start-date"
                name="recoveryStartDate"
                required
                invalid={!!getErrorMessage('recoveryStartDate')}
                aria-invalid={!!getErrorMessage('recoveryStartDate')}
                errorText={getErrorMessage('recoveryStartDate')}
                onChange={(value) =>
                  formik.setFieldValue('recoveryStartDate', value)
                }
                onBlur={formik.handleBlur}
                language="fi"
                minDate={new Date(application.startDate)}
                maxDate={new Date(application.endDate)}
              />
            </$GridCell>
            <$GridCell $colSpan={3}>
              <DateInput
                label={t(`${translationBase}.fields.recoveryEndDate.label`)}
                value={formik.values.recoveryEndDate}
                id="recovery-end-date"
                name="recoveryEndDate"
                required
                invalid={!!getErrorMessage('recoveryEndDate')}
                aria-invalid={!!getErrorMessage('recoveryEndDate')}
                errorText={getErrorMessage('recoveryEndDate')}
                onChange={(value) =>
                  formik.setFieldValue('recoveryEndDate', value)
                }
                onBlur={formik.handleBlur}
                language="fi"
                minDate={
                  new Date(
                    convertToBackendDateFormat(
                      formik.values.recoveryStartDate ?? application.startDate
                    )
                  )
                }
                maxDate={new Date(application.endDate)}
              />
            </$GridCell>
            <$GridCell $colSpan={3}>
              <TextInput
                label={t(`${translationBase}.fields.recoveryAmount.label`)}
                id="recovery-amount"
                name="recoveryAmount"
                onBlur={formik.handleBlur}
                onChange={(e) =>
                  formik.setFieldValue(
                    'recoveryAmount',
                    stringFloatToFixed(e.target.value)
                  )
                }
                value={formatStringFloatValue(formik.values.recoveryAmount)}
                invalid={!!getErrorMessage('recoveryAmount')}
                aria-invalid={!!getErrorMessage('recoveryAmount')}
                errorText={getErrorMessage('recoveryAmount')}
                required
              />
            </$GridCell>
          </$Grid>
        </AlterationHandlingSection>

        <AlterationHandlingSection
          heading={t(`${translationBase}.headings.isRecoverable`)}
        >
          <$Grid>
            <$GridCell $colSpan={12}>
              <SelectionGroup
                id="isRecoverable"
                label={t(`${translationBase}.fields.isRecoverable.label`)}
                direction="vertical"
                required
                errorText={getErrorMessage('isRecoverable')}
                tooltipText={t(
                  `${translationBase}.fields.isRecoverable.hintText`
                )}
              >
                <RadioButton
                  id="isRecoverable-yes"
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
                  id="isRecoverable-no"
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

        <AlterationHandlingSection
          heading={t(`${translationBase}.headings.downloadTalpaCsv`)}
        >
          <$Grid>
            <$GridCell $colSpan={12}>
              {/* TODO: Talpa integration to be implemented in HL-887 */}
              <$TalpaGuideText>
                {t(`${translationBase}.talpaCsv.guideText`)}
              </$TalpaGuideText>
              <Button
                disabled
                theme="coat"
                iconLeft={<IconDownload />}
                onClick={() => {}}
              >
                {t(`${translationBase}.talpaCsv.button`)}
              </Button>
            </$GridCell>
          </$Grid>
        </AlterationHandlingSection>
      </Container>
      <StickyActionBar>
        <$StickyBarWrapper>
          <$StickyBarColumn>
            <Button onClick={onClose} theme="black" variant="secondary">
              {t(`${translationBase}.actions.close`)}
            </Button>
          </$StickyBarColumn>
          <$StickyBarColumn>
            {hasErrors && isSubmitted && (
              <$SaveActionFormErrorText>
                <IconAlertCircleFill />
                <p aria-live="polite">
                  {t(`${translationBase}.error.dirtyOrInvalidForm`)}
                </p>
              </$SaveActionFormErrorText>
            )}
            <Button
              onClick={handleAlteration}
              theme="coat"
              iconLeft={<IconCheck />}
              disabled={isSubmitting || (isSubmitted && !formik.isValid)}
              isLoading={isSubmitting}
              loadingText={t('common:utility.submitting')}
            >
              {t(`${translationBase}.actions.handle`)}
            </Button>
          </$StickyBarColumn>
        </$StickyBarWrapper>
      </StickyActionBar>
      <$StickyBarSpacing />
    </>
  );
};

export default AlterationHandlingForm;
