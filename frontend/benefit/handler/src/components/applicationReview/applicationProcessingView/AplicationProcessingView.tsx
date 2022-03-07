import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import { TextArea } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $Checkbox,
  $RadioButton,
} from 'shared/components/forms/fields/Fields.sc';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';

import {
  $CalculatorHr,
  $FieldHeaderText,
  $MainHeader,
} from '../ApplicationReview.sc';

const ApplicationProcessingView: React.FC = () => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);

  const toggleGrantedAsDeMinimisAid = (): void => {
    setHandledApplication({
      ...handledApplication,
      grantedAsDeMinimisAid: !handledApplication?.grantedAsDeMinimisAid,
    });
  };

  const onCommentsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ): void =>
    setHandledApplication({
      ...handledApplication,
      logEntryComment: event.target.value,
    });

  return (
    <>
      <$MainHeader>{t(`${translationsBase}.headings.heading10`)}</$MainHeader>
      <ReviewSection withMargin>
        <$GridCell $colSpan={11}>
          <$Grid>
            <$GridCell $colSpan={6}>
              <$RadioButton
                id="proccessRejectedRadio"
                name="proccessRejectedRadio"
                checked={
                  handledApplication?.status === APPLICATION_STATUSES.REJECTED
                }
                onChange={(value) => {
                  if (value) {
                    setHandledApplication({
                      logEntryComment: '',
                      status: APPLICATION_STATUSES.REJECTED,
                      grantedAsDeMinimisAid: false,
                    });
                  }
                }}
                label={t(`${translationsBase}.fields.noSupport`)}
              />
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
                    placeholder={t(
                      `${translationsBase}.actions.reasonRejectPlaceholder`
                    )}
                    onChange={onCommentsChange}
                    value={handledApplication?.logEntryComment}
                    required
                  />
                </$GridCell>
              </$Grid>
            </>
          )}
        </$GridCell>
      </ReviewSection>
      <ReviewSection withMargin>
        <$GridCell $colSpan={11}>
          <$Grid>
            <$GridCell $colSpan={6}>
              <$RadioButton
                id="proccessAccepted"
                name="proccessAccepted"
                checked={
                  handledApplication?.status === APPLICATION_STATUSES.ACCEPTED
                }
                onChange={(value) => {
                  if (value) {
                    setHandledApplication({
                      logEntryComment: '',
                      status: APPLICATION_STATUSES.ACCEPTED,
                    });
                  }
                }}
                label={t(`${translationsBase}.fields.support`)}
              />
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
                <$GridCell $colSpan={6}>
                  <TextArea
                    id="proccessAcceptedComments"
                    name="proccessAcceptedComments"
                    label={t(`${translationsBase}.fields.reason`)}
                    placeholder={t(
                      `${translationsBase}.actions.reasonAcceptPlaceholder`
                    )}
                    value={handledApplication?.logEntryComment}
                    onChange={onCommentsChange}
                  />
                </$GridCell>
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
                    label={t(
                      `${translationsBase}.actions.grantedAsDeminimisAid`
                    )}
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
    </>
  );
};

export default ApplicationProcessingView;
