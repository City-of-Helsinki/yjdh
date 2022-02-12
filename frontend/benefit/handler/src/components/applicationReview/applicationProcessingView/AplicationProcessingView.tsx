import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import AppContext from 'benefit/handler/context/AppContext';
import { TextArea } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import { $RadioButton } from 'shared/components/forms/fields/Fields.sc';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';

import { $CalculatorHr, $MainHeader } from '../ApplicationReview.sc';

const ApplicationProcessingView: React.FC = () => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);

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
                <$GridCell $colSpan={12}>
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
                <$GridCell $colSpan={12}>
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
            </>
          )}
        </$GridCell>
      </ReviewSection>
    </>
  );
};

export default ApplicationProcessingView;
