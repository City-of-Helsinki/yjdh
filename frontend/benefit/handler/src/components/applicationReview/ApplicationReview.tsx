import ApplicationHeader from 'benefit/handler/components/applicationHeader/ApplicationHeader';
import { Button , LoadingSpinner } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';

import ReviewSection from '../reviewSection/ReviewSection';
import { useApplicationReview } from './useApplicationReview';

const ApplicationReview: React.FC = () => {
  const { t, application, isLoading } = useApplicationReview();

  const translationBase = 'common:review.headings';

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  return (
    <>
      <ApplicationHeader data={application} />
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
        <ReviewSection withMargin>
          <$GridCell $colSpan={12}>Section contents10</$GridCell>
        </ReviewSection>
      </Container>
    </>
  );
};

export default ApplicationReview;
