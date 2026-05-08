import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import AppContext from 'benefit/handler/context/AppContext';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { Application } from 'benefit/handler/types/application';
import { extractCalculatorRows } from 'benefit/handler/utils/calculator';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { TextArea, TextInput } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import {
  $RadioButton,
} from 'shared/components/forms/fields/Fields.sc';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';

import {
  $CalculatorHr,
  $CalculatorTableRow,
  $HelpText,
  $MainHeader,
  $RadioButtonContainer,
} from '../ApplicationReview.sc';

const ApplicationProcessingView: React.FC<{ data: Application }> = ({
  data,
}) => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);

  const isNewAhjoMode = useDetermineAhjoMode();

  const needsIndustryCode =
    handledApplication?.grantedAsDeMinimisAid === true &&
    !data?.company?.industryCode;

  const toggleGrantedAsDeMinimisAid = (value: boolean): void => {
    setHandledApplication({
      ...handledApplication,
      grantedAsDeMinimisAid: value,
      industryCodeTouched: false,
    });
  };

  React.useEffect(() => {
    if (!handledApplication && isNewAhjoMode) {
      setHandledApplication({
        status: data?.decisionProposalDraft?.status,
        grantedAsDeMinimisAid:
          data?.decisionProposalDraft?.grantedAsDeMinimisAid ?? undefined,
        logEntryComment: data?.decisionProposalDraft?.logEntryComment,
        justificationText: data?.decisionProposalDraft?.justificationText,
        decisionText: data?.decisionProposalDraft?.decisionText,
        decisionMakerId: data?.decisionProposalDraft?.decisionMakerId,
        decisionMakerName: data?.decisionProposalDraft?.decisionMakerName,
      });
    }
  }, [data, handledApplication, setHandledApplication, isNewAhjoMode]);

  const onCommentsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void =>
    setHandledApplication({
      ...handledApplication,
      logEntryComment: event.target.value,
    });

  const {
    totalRow,
    totalRowDescription,
    dateRangeRows,
    helsinkiBenefitMonthlyRows,
  } = extractCalculatorRows(data?.calculation?.rows || []);

  return (
    <ReviewSection withMargin withBorder>
      <$GridCell $colSpan={11}>
        <$MainHeader css={{ margin: 'var(--spacing-xs) 0 var(--spacing-m)' }}>
          {t(`${translationsBase}.headings.heading10`)}
        </$MainHeader>
        <$Grid>
          <$GridCell $colSpan={11}>
            <$RadioButtonContainer>
              <$RadioButton
                id="proccessRejectedRadio"
                name="proccessRejectedRadio"
                checked={
                  handledApplication?.status === APPLICATION_STATUSES.REJECTED
                }
                onChange={(value: boolean) => {
                  if (value) {
                    setHandledApplication({
                      ...handledApplication,
                      logEntryComment: '',
                      status: APPLICATION_STATUSES.REJECTED,
                      grantedAsDeMinimisAid: false,
                    });
                  }
                }}
                label={t(`${translationsBase}.fields.noSupport`)}
              />
            </$RadioButtonContainer>
          </$GridCell>
        </$Grid>
        {handledApplication?.status === APPLICATION_STATUSES.REJECTED && (
          <>
            <$Grid>
              <$GridCell
                $colSpan={12}
                css={`
                  margin-top: ${theme.spacing.s};
                `}
              >
                <$CalculatorHr />
              </$GridCell>
            </$Grid>
            <$Grid>
              <$GridCell $colSpan={6}>
                {/* @ts-expect-error: HDS React TextArea has very strict prop requirements that are not necessary here. */}
                <TextArea
                  id="proccessRejectedComments"
                  name="proccessRejectedComments"
                  label={t(`${translationsBase}.fields.reason`)}
                  onChange={onCommentsChange}
                  value={handledApplication?.logEntryComment}
                  required
                />
                <$HelpText>
                  {t(`${translationsBase}.actions.reasonRejectPlaceholder`)}
                </$HelpText>
              </$GridCell>
            </$Grid>
          </>
        )}
      </$GridCell>
      <$GridCell $colSpan={11} css={{ marginBottom: 'var(--spacing-m)' }}>
        <$Grid>
          <$GridCell $colSpan={11}>
            <$RadioButtonContainer>
              <$RadioButton
                id="proccessAccepted"
                name="proccessAccepted"
                checked={
                  handledApplication?.status === APPLICATION_STATUSES.ACCEPTED
                }
                onChange={(value: boolean) => {
                  if (value) {
                    setHandledApplication({
                      ...handledApplication,
                      logEntryComment: '',
                      status: APPLICATION_STATUSES.ACCEPTED,
                    });
                  }
                }}
                label={t(`${translationsBase}.fields.support`)}
              />
            </$RadioButtonContainer>
          </$GridCell>
        </$Grid>
        {handledApplication?.status === APPLICATION_STATUSES.ACCEPTED && (
          <>
            <$Grid>
              <$GridCell
                $colSpan={12}
                css={`
                  margin-top: ${theme.spacing.s};
                `}
              >
                <$CalculatorHr />
              </$GridCell>
            </$Grid>
            <$Grid>
              {totalRow && totalRowDescription && (
                <$GridCell $colSpan={10}>
                  <$ViewField
                    isBold
                    style={{
                      fontSize: theme.fontSize.heading.s,
                      paddingBottom: theme.spacing.s,
                    }}
                  >
                    {totalRowDescription.descriptionFi}
                  </$ViewField>
                  <$CalculatorTableRow style={{ backgroundColor: 'white' }}>
                    <$ViewField>{totalRow.descriptionFi}</$ViewField>
                    <$ViewField isBold>
                      {formatFloatToEvenEuros(totalRow.amount)}
                    </$ViewField>
                  </$CalculatorTableRow>
                  {dateRangeRows.length === helsinkiBenefitMonthlyRows.length &&
                    dateRangeRows.map((row, index) => (
                      <$CalculatorTableRow
                        key={row.id}
                        style={{ paddingLeft: '0' }}
                      >
                        <$ViewField>{row.descriptionFi}</$ViewField>
                        <$ViewField isBold>
                          {formatFloatToEvenEuros(
                            helsinkiBenefitMonthlyRows[index].amount
                          )}
                          {t('common:utility.perMonth')}
                        </$ViewField>
                      </$CalculatorTableRow>
                    ))}
                </$GridCell>
              )}
              {!isNewAhjoMode && (
                <$GridCell
                  $colSpan={8}
                  $colStart={1}
                  style={{ paddingTop: theme.spacing.l }}
                >
                  {/* @ts-expect-error: HDS React TextArea has very strict prop requirements that are not necessary here. */}
                  <TextArea
                    id="proccessAcceptedComments"
                    name="proccessAcceptedComments"
                    label={t(`${translationsBase}.fields.reason`)}
                    value={handledApplication?.logEntryComment}
                    onChange={onCommentsChange}
                  />

                  <$HelpText>
                    {t(`${translationsBase}.actions.reasonAcceptPlaceholder`)}
                  </$HelpText>
                </$GridCell>
              )}
            </$Grid>
            <$Grid style={{ marginTop: theme.spacing.xl}}>
              <$GridCell $colSpan={12}>
                <$ViewField
                  isBold
                  style={{ fontSize: theme.fontSize.heading.s }}
                >
                  {t(`${translationsBase}.actions.grantedAsDeminimisText`)}
                </$ViewField>
              </$GridCell>
              <$GridCell $colSpan={12} style={{ marginTop: theme.spacing.xs }}>
                <$RadioButton
                  id="deminimisYes"
                  name="deminimisRadio"
                  value="yes"
                  label={t(`${translationsBase}.actions.grantedAsDeminimisAid`)}
                  checked={handledApplication.grantedAsDeMinimisAid === true}
                  onChange={(value: boolean) => {
                    if (value) toggleGrantedAsDeMinimisAid(true);
                  }}
                />
              </$GridCell>
              <$GridCell $colSpan={12} style={{ marginTop: theme.spacing.xs2 }}>
                <$RadioButton
                  id="deminimisNo"
                  name="deminimisRadio"
                  value="no"
                  label={t(`${translationsBase}.actions.grantedAsDeminimisAidNo`)}
                  checked={handledApplication.grantedAsDeMinimisAid === false}
                  onChange={(value: boolean) => {
                    if (value) toggleGrantedAsDeMinimisAid(false);
                  }}
                />
              </$GridCell>
              {needsIndustryCode && (
                <$GridCell $colSpan={6}>
                  {/* @ts-expect-error: HDS React TextInput has very strict prop requirements that are not necessary here. */}
                  <TextInput
                    id="industryCodeInput"
                    label={t(`${translationsBase}.fields.industryCode`)}
                    helperText={t(
                      `${translationsBase}.fields.industryCodeHelper`
                    )}
                    value={
                      handledApplication.industryDescription
                        ? `${handledApplication.industryCode ?? ''} ${handledApplication.industryDescription}`
                        : (handledApplication.industryCode ?? '')
                    }
                    // We allow users to input both code and description in the same field to make it easier to
                    // understand which code they are selecting.
                    // We then split the input back to code and description when saving.
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const raw = e.target.value;
                      const spaceIndex = raw.indexOf(' ');
                      const code = spaceIndex === -1 ? raw : raw.slice(0, spaceIndex);
                      const description = spaceIndex === -1 ? '' : raw.slice(spaceIndex + 1);
                      setHandledApplication({
                        ...handledApplication,
                        industryCode: code,
                        industryDescription: description || undefined,
                      });
                    }}
                    onBlur={() =>
                      setHandledApplication({
                        ...handledApplication,
                        industryCodeTouched: true,
                      })
                    }
                    required
                    invalid={
                      !!handledApplication.industryCodeTouched &&
                      handledApplication.grantedAsDeMinimisAid === true &&
                      !handledApplication.industryCode
                    }
                    errorText={
                      !!handledApplication.industryCodeTouched &&
                      handledApplication.grantedAsDeMinimisAid === true &&
                      !handledApplication.industryCode
                        ? t(`${translationsBase}.fields.industryCodeRequired`)
                        : undefined
                    }
                  />
                </$GridCell>
              )}
            </$Grid>
          </>
        )}
      </$GridCell>
    </ReviewSection>
  );
};

export default ApplicationProcessingView;
