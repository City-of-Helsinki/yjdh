import { Button, IconArrowRight } from 'hds-react';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import { $Notification } from 'shared/components/notification/Notification.sc';
import useGoToFrontPage from 'shared/hooks/useGoToFrontPage';

type Props = {
  title: string;
  message: string;
  goToFrontPageText?: string;
};

const ActivationErrorPage: React.FC<Props> = ({
  title,
  message,
  goToFrontPageText,
}) => {
  const { t } = useTranslation();
  return (
    <Container>
      <Head>
        <title>
          {title} | {t(`common:appName`)}
        </title>
      </Head>
      <$Notification label={title} type="error" size="large">
        {message}
      </$Notification>
      {goToFrontPageText && (
        <FormSection columns={1} withoutDivider>
          <$GridCell>
            <Button
              theme="coat"
              variant="secondary"
              iconLeft={<IconArrowRight />}
              onClick={useGoToFrontPage()}
            >
              {goToFrontPageText}
            </Button>
          </$GridCell>
        </FormSection>
      )}
    </Container>
  );
};

ActivationErrorPage.defaultProps = {
  goToFrontPageText: undefined,
};

export default ActivationErrorPage;
