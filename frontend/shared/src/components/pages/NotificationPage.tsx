import {
  Button,
  IconArrowRight,
  NotificationSizeInline,
  NotificationType,
} from 'hds-react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { $Notification } from 'shared/components/notification/Notification.sc';
import useGoToFrontPage from 'shared/hooks/useGoToFrontPage';

type Props = {
  type: NotificationType;
  size?: NotificationSizeInline;
  title: string;
  message?: React.ReactNode;
  goToFrontPageText?: string;
  children?: React.ReactNode;
};

const NotificationPage: React.FC<Props> = ({
  type,
  size = 'large',
  title,
  message,
  goToFrontPageText,
  children,
}) => {
  const { t } = useTranslation();
  const goToFrontPage = useGoToFrontPage();
  return (
    <Container>
      <Head>
        <title>
          {title} | {t(`common:appName`)}
        </title>
      </Head>
      <$Notification label={title} type={type} size={size}>
        {message}
      </$Notification>
      {children}
      {goToFrontPageText && (
        <FormSection columns={1} withoutDivider>
          <$GridCell>
            <Button
              theme="coat"
              variant="secondary"
              iconLeft={<IconArrowRight />}
              onClick={goToFrontPage}
            >
              {goToFrontPageText}
            </Button>
          </$GridCell>
        </FormSection>
      )}
    </Container>
  );
};

NotificationPage.defaultProps = {
  size: 'large',
  goToFrontPageText: undefined,
  children: null,
};

export default NotificationPage;
