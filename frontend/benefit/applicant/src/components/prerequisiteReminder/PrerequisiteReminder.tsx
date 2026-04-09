import {
  $DownloadButtonContainer,
  $Heading,
  $IconInfoCircle,
  $Link,
  $PrerequisiteCard,
} from 'benefit/applicant/components/prerequisiteReminder/PrerequisiteReminder.sc';
import { Button, ButtonVariant, IconDownload } from 'hds-react';
import { NextPage } from 'next';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import { openFileInNewTab } from 'shared/utils/file.utils';

const PrerequisiteReminder: NextPage = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <$PrerequisiteCard>
        <$IconInfoCircle />
        <div>
          <$Heading>{t('common:prerequisiteReminder.heading')}</$Heading>
          <p>{t('common:prerequisiteReminder.body')}</p>
          <$DownloadButtonContainer>
            <Button
              theme="black"
              variant={ButtonVariant.Secondary}
              onClick={() =>
                openFileInNewTab(
                  t('common:prerequisiteReminder.downloadButton.href')
                )
              }
              iconStart={<IconDownload />}
            >
              {t('common:prerequisiteReminder.downloadButton.label', '')}
            </Button>
          </$DownloadButtonContainer>
          <$Link
            href={t('common:prerequisiteReminder.moreDetailsLink.href')}
            openInNewTab
          >
            {t('common:prerequisiteReminder.moreDetailsLink.label')}
          </$Link>
        </div>
      </$PrerequisiteCard>
    </Container>
  );
};

export default PrerequisiteReminder;
