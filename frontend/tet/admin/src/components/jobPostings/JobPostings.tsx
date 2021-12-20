import { Button } from 'hds-react';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { useTranslation } from 'next-i18next';

import { $Heading, $HeadingContainer } from './JobPostings.sc';

const JobPostings: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <$HeadingContainer>
        <$Heading>{t('common:application.jobPostings.title')}</$Heading>
      </$HeadingContainer>
      <p>{t('common:application.jobPostings.noPostingsFound')}</p>
      <Button>{t('common:application.jobPostings.addNewPosting')}</Button>
    </Container>
  );
};

export default JobPostings;
