import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import AppContext from 'benefit/handler/context/AppContext';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import { Application } from 'benefit/handler/types/application';
import { extractCalculatorRows } from 'benefit/handler/utils/calculator';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { TextArea } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $ViewField } from 'shared/components/benefit/summaryView/SummaryView.sc';
import {
  $Checkbox,
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
  $FieldHeaderText,
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

  const toggleGrantedAsDeMinimisAid = (): void => {
    setHandledApplication({
      ...handledApplication,
      grantedAsDeMinimisAid: !handledApplication?.grantedAsDeMinimisAid,
    });
  };

  React.useEffect(() => {
    if (!handledApplication && isNewAhjoMode) {
      setHandledApplication({
        status: data?.decisionProposalDraft?.status,
        grantedAsDeMinimisAid:
          !!data?.decisionProposalDraft?.grantedAsDeMinimisAid,
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
  } = extractCalculatorRows(data?.calculation?.rows);

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
                onChange={(value) => {
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
                onChange={(value) => {
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
            <$Grid>
              <$GridCell $colSpan={12}>
                <$FieldHeaderText>
                  {t(`${translationsBase}.actions.grantedAsDeminimisText`)}
                </$FieldHeaderText>
              </$GridCell>
              <$GridCell $colSpan={12}>
                <$Checkbox
                  id="deminimisCheckbox"
                  name="deminimisCheckbox"
                  label={t(`${translationsBase}.actions.grantedAsDeminimisAid`)}
                  required
                  checked={handledApplication.grantedAsDeMinimisAid === true}
                  onChange={toggleGrantedAsDeMinimisAid}
                />
              </$GridCell>
            </$Grid>
          </>
        )}
      </$GridCell>
    </ReviewSection>
  );
};

export default ApplicationProcessingView;
