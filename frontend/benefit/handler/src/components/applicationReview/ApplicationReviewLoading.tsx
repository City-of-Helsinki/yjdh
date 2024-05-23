import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';

const ApplicationReviewLoading: React.FC = () => (
  <>
    <LoadingSkeleton
      width="100%"
      height={96}
      baseColor={theme.colors.coatOfArms}
      highlightColor={theme.colors.fogDark}
      borderRadius={0}
    />

    <Container>
      <$Grid>
        <$GridCell $colSpan={12}>
          <LoadingSkeleton width="100%" height={260} />
        </$GridCell>
        <$GridCell $colSpan={12}>
          <LoadingSkeleton width="100%" height={240} />
        </$GridCell>
        <$GridCell $colSpan={12}>
          <LoadingSkeleton width="100%" height={330} />
        </$GridCell>
        <$GridCell $colSpan={12}>
          <LoadingSkeleton width="100%" height={260} />
        </$GridCell>
      </$Grid>
    </Container>
  </>
);

export default ApplicationReviewLoading;
