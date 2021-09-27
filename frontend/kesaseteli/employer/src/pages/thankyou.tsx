import { Button, IconPlus } from 'hds-react';
import useApplicationApi from 'kesaseteli/employer/hooks/application/useApplicationApi';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import Container from 'shared/components/container/Container';
import withAuth from 'shared/components/hocs/withAuth';
import Layout from 'shared/components/Layout';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';

import { $Notification } from '../components/application/login.sc';

const ThankYouPage: NextPage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { application } = useApplicationApi();

    if (!application || application.status === "draft") {
        void router.push("/");
        return null
    }

    const createNewApplicationClick = (): void => {
        void router.push("/");
    };

    return (
        <Container>
            <Layout>
                <$Notification
                    label={t(`common:thankyouPage.thankyouMessageLabel`)}
                    type="success"
                    size="large"
                >
                    {t(`common:thankyouPage.thankyouMessageContent`)}
                </$Notification>

                {/* To be replaced with the application summary component: */}
                <div>
                    Yhteenveto: <p />
                    {JSON.stringify(application, null, 2)} <p />
                </div>

                <Button
                    theme="coat"
                    iconLeft={<IconPlus />}
                    onClick={createNewApplicationClick}
                >
                    {t(`common:thankyouPage.createNewApplication`)}
                </Button>
            </Layout>
        </Container>
    );
};

export const getStaticProps: GetStaticProps = getServerSideTranslations(
    'common'
);

export default withAuth(ThankYouPage);
