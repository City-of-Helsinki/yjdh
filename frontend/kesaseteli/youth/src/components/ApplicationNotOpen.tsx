import { Notification } from 'hds-react';
import Head from 'next/head';
import { Trans, useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
import LinkText from 'shared/components/link-text/LinkText';

const ApplicationNotOpen: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Container>
      <Head>
        <title>{t(`common:appName`)}</title>
      </Head>
      <Heading
        size="l"
        header={t('common:youthApplication.applicationNotOpen')}
        as="h2"
      />
      <Notification type="alert">
        <Trans
          t={t}
          i18nKey="common:youthApplication.applicationNotOpenText"
          components={{
            // href should get overridden (https://react.i18next.com/latest/trans-component#overriding-react-component-props-v11.5.0),
            // but for some reason it does not. However, the setter works, when href is left as unset.
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore ts(2741) link href and text will be set / overridden with values from translation.
            lnk: <LinkText />,
            bold: <b />,
          }}
        />
      </Notification>
    </Container>
  );
};

export default ApplicationNotOpen;
