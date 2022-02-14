import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
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
  return (
    <>
      <$MainHeader>{t(`${translationsBase}.headings.heading10`)}</$MainHeader>
      <ReviewSection withMargin>
        <$GridCell $colSpan={11}>
          <$Grid>
            <$GridCell $colSpan={6}>
              <$RadioButton
                id="radio1"
                name="radio1"
                value="false"
                label={t(`${translationsBase}.fields.noSupport`)}
              />
            </$GridCell>
          </$Grid>
          <$Grid>
            <$GridCell $colSpan={12}>
              <$CalculatorHr />
            </$GridCell>
          </$Grid>
          <$Grid>
            <$GridCell $colSpan={6}>
              <TextArea
                id="textarea1"
                name="textarea1"
                label={t(`${translationsBase}.fields.reason`)}
                placeholder={t(`${translationsBase}.fields.reasonPlaceholder`)}
                required
              />
            </$GridCell>
          </$Grid>
        </$GridCell>
      </ReviewSection>
      <ReviewSection withMargin>
        <$GridCell $colSpan={11}>
          <$Grid>
            <$GridCell $colSpan={6}>
              <$RadioButton
                id="radio2"
                name="radio2"
                value="true"
                label={t(`${translationsBase}.fields.support`)}
              />
            </$GridCell>
          </$Grid>
        </$GridCell>
      </ReviewSection>
    </>
  );
};

export default ApplicationProcessingView;
