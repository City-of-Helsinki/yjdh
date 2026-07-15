import EmployerApplicationAttachments from 'kesaseteli/handler/components/employer-application/EmployerApplicationAttachments';
import EmployerApplicationHandlerView from 'kesaseteli/handler/components/employer-application/EmployerApplicationHandlerView';
import $AccordionSection from 'kesaseteli/handler/components/form/AccordionSection.sc';
import NotesSection from 'kesaseteli/handler/components/notes/NotesSection';
import ApplicationSidebar from 'kesaseteli/handler/components/sidebar/ApplicationSidebar';
import { SIDEBAR_WIDTH } from 'kesaseteli/handler/components/sidebar/ApplicationSidebar.sc';
import useSidebarState from 'kesaseteli/handler/components/sidebar/useSidebarState';
import useEmployerApplicationQuery from 'kesaseteli/handler/hooks/backend/useEmployerApplicationQuery';
import type HandlerEmployerApplication from 'kesaseteli/handler/types/HandlerEmployerApplication';
import { NoteTargetType } from 'kesaseteli/handler/types/note';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import React from 'react';
import Container from 'shared/components/container/Container';
import FormSectionHeading from 'shared/components/forms/section/FormSectionHeading';
import { $Notification } from 'shared/components/notification/Notification.sc';
import PageLoadingSpinner from 'shared/components/pages/PageLoadingSpinner';
import useRouterQueryParam from 'shared/hooks/useRouterQueryParam';
import getServerSideTranslations from 'shared/i18n/get-server-side-translations';
import styled from 'styled-components';

const $DetailPageWrapper = styled.div<{ $sidebarOpen: boolean }>`
  padding-right: ${({ $sidebarOpen }) => ($sidebarOpen ? SIDEBAR_WIDTH : '0')};
  transition: padding-right 0.25s ease-in-out;

  @media (max-width: 768px) {
    padding-right: 0;
  }

  // Prevent wide tables or overflow contents from blowing out the grid width
  & > div > div {
    min-width: 0;
  }
`;

function EmployerApplicationDetail(): React.ReactElement {
  const { t } = useTranslation();
  const { value: applicationId, isRouterLoading } = useRouterQueryParam('id');
  const [isSidebarOpen, toggleSidebar] = useSidebarState();

  const { isError, isLoading, isSuccess, data } =
    useEmployerApplicationQuery<HandlerEmployerApplication>(applicationId);
  const notFound = isError || (!applicationId && !isRouterLoading);

  if (isRouterLoading || isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <$DetailPageWrapper $sidebarOpen={isSidebarOpen}>
      <Container>
        <Head>
          <title>{t(`common:appName`)}</title>
        </Head>

        <FormSectionHeading
          $colSpan={2}
          header={t('common:handlerApplication.title')}
          as="h2"
        />
        {isSuccess && data && (
          <EmployerApplicationHandlerView application={data} />
        )}
        {notFound && (
          <$Notification
            label={t('common:handlerApplication.notFound')}
            type="alert"
          />
        )}
        {isSuccess && applicationId && (

          <>
            <$AccordionSection
              heading={t('common:handlerApplication.attachmentsTitle')}
              initiallyOpen
              card
              border
            >
              <EmployerApplicationAttachments application={data} />
            </$AccordionSection>

            <$AccordionSection
              heading={t('common:handlerNotes.sectionTitle')}
              initiallyOpen
              card
              border
            >
              <NotesSection
                applicationId={applicationId}
                targetType={NoteTargetType.EMPLOYER_APPLICATION}
              />
            </$AccordionSection>
          </>
        )}
      </Container>
      {isSuccess && applicationId && (
        <ApplicationSidebar
          applicationId={applicationId}
          applicationType="employer"
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
      )}
    </$DetailPageWrapper>
  );
}

/**
 * Using getStaticProps & getStaticPaths (SSG) for pages behind authentication is safe here
 * because the pre-rendered static HTML is just an empty UI shell containing translations.
 * Sensitive data is never pre-rendered or cached on the server; it is fetched dynamically
 * on the client-side inside the component (useEmployerApplicationQuery) after checking
 * the user's session cookies in the browser.
 */
export const getStaticProps: GetStaticProps =
  getServerSideTranslations('common');

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export default EmployerApplicationDetail;
