import ReviewSection from 'benefit/handler/components/reviewSection/ReviewSection';
import { useTranslation } from 'next-i18next';
import * as React from 'react';

import { $MainHeader } from '../ApplicationReview.sc';

const ApplicationProcessingView: React.FC = () => {
  const translationsBase = 'common:review';
  const { t } = useTranslation();
  return (
    <>
      <$MainHeader>{t(`${translationsBase}.headings.heading10`)}</$MainHeader>
      <ReviewSection withMargin>
        {t(`${translationsBase}.fields.noSupport`)}
      </ReviewSection>
      <ReviewSection withMargin>
        {t(`${translationsBase}.fields.support`)}
      </ReviewSection>
    </>
  );
};

export default ApplicationProcessingView;
