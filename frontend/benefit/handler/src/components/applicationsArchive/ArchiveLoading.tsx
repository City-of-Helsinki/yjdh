import { useTranslation } from 'next-i18next';
import * as React from 'react';
import LoadingSkeleton from 'react-loading-skeleton';
import Container from 'shared/components/container/Container';
import theme from 'shared/styles/theme';

import { $Heading } from './ApplicationsArchive.sc';

const ArchiveLoading: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <$Heading as="h1">{`${t('common:header.navigation.archive')}`}</$Heading>

      <LoadingSkeleton
        borderRadius={0}
        baseColor={theme.colors.silver}
        height={15}
        width={640}
      />
      <LoadingSkeleton
        borderRadius={0}
        baseColor={theme.colors.silver}
        height={55}
        width={640}
        style={{ marginBottom: 'var(--spacing-s)' }}
      />

      <LoadingSkeleton
        borderRadius={0}
        baseColor={theme.colors.silver}
        height={40}
        width={200}
        style={{ marginBottom: 'var(--spacing-s)' }}
      />

      <LoadingSkeleton
        borderRadius={0}
        baseColor={theme.colors.fog}
        height={50}
      />

      <LoadingSkeleton height={80} />
      <LoadingSkeleton height={80} />
      <LoadingSkeleton height={80} />
    </Container>
  );
};

export default ArchiveLoading;
