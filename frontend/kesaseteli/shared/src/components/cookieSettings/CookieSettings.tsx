import dynamic from 'next/dynamic';
import Head from 'next/head';
import * as React from 'react';
import {
  LocalizedSiteName,
  OptionalGroups,
  RequiredGroups,
} from 'shared/utils/cookieConsentSettings';
import Container from 'shared/components/container/Container';

const CookieConsent = dynamic(
  () => import('kesaseteli-shared/components/cookieConsent/CookieConsent'),
  { ssr: false }
);

export type CookieSettingsProps = {
  title: string;
  siteName: string | Partial<LocalizedSiteName>;
  requiredGroups?: RequiredGroups;
  optionalGroups?: OptionalGroups;
};

const CookieSettings: React.FC<CookieSettingsProps> = ({
  title,
  siteName,
  requiredGroups,
  optionalGroups,
}: CookieSettingsProps) => (
  <>
    <Head>
      <title>{title}</title>
    </Head>

    <Container>
      <CookieConsent
        asPage
        siteName={siteName}
        requiredGroups={requiredGroups}
        optionalGroups={optionalGroups}
      />
    </Container>
  </>
);

export default CookieSettings;
