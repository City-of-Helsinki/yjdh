import { GetStaticProps, NextPage } from 'next';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import { useTranslation } from 'next-i18next';
import CookieSettings from 'kesaseteli-shared/components/cookieSettings/CookieSettings';

const CookieSettingsPage: NextPage = () => {
  const { t } = useTranslation();

  return CookieSettings({
    title: t('common:cookieSettingsPage.title'),
    siteName: t('common:appName'),
  });
};

export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export default CookieSettingsPage;
