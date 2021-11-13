import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { Button } from 'hds-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import ReviewSection from '../reviewSection/ReviewSection';

const ApplicationReview: React.FC = () => {
  const shouldShowSkeleton = false;
  const { t } = useTranslation();

  const translationBase = 'common:review.headings';

  if (shouldShowSkeleton) {
    return (
      <Container>
        <LoadingSkeleton width="100%" height="50px" />
      </Container>
    );
  }

  return (
    <>
      <ApplicationHeader />
      <Container>
        <ReviewSection header={t(`${translationBase}.heading1`)}>
          <$GridCell $colSpan={12}>Section contents1</$GridCell>
        </ReviewSection>
        <ReviewSection header={t(`${translationBase}.heading2`)}>
          <$GridCell $colSpan={12}>Section contents2</$GridCell>
        </ReviewSection>
        <ReviewSection header={t(`${translationBase}.heading3`)}>
          <$GridCell $colSpan={12}>Section contents3</$GridCell>
        </ReviewSection>
        <ReviewSection header={t(`${translationBase}.heading4`)}>
          <$GridCell $colSpan={12}>Section contents4</$GridCell>
        </ReviewSection>
        <ReviewSection header={t(`${translationBase}.heading5`)}>
          <$GridCell $colSpan={12}>Section contents5</$GridCell>
        </ReviewSection>
        <ReviewSection header={t(`${translationBase}.heading5`)}>
          <$GridCell $colSpan={12}>Section contents6</$GridCell>
        </ReviewSection>
        <ReviewSection header={t(`${translationBase}.heading7`)}>
          <$GridCell $colSpan={12}>Section contents7</$GridCell>
        </ReviewSection>
        <ReviewSection header={t(`${translationBase}.heading8`)}>
          <$GridCell $colSpan={12}>Section contents8</$GridCell>
        </ReviewSection>
        <ReviewSection
          action={
            <div>
              <Button theme="black" variant="secondary">
                Some button
              </Button>
            </div>
          }
          header={t(`${translationBase}.heading9`)}
        >
          <$GridCell $colSpan={12}>Section contents9</$GridCell>
        </ReviewSection>
      </Container>
    </>
  );
};

export default ApplicationReview;
