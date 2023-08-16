import { $PageHeading } from 'benefit/applicant/components/applications/Applications.sc';
import { Button } from 'hds-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import Container from 'shared/components/container/Container';
import FormSection from 'shared/components/forms/section/FormSection';
import { $GridCell, $Hr } from 'shared/components/forms/section/FormSection.sc';
import { openFileInNewTab } from 'shared/utils/file.utils';
import styled from 'styled-components';

import useApproveTermsOfServiceMutation from '../../hooks/useApproveTermsOfServiceMutation';
import useLogout from '../../hooks/useLogout';
import useTermsOfServiceData from '../../hooks/useTermsOfServiceData';
import PdfViewer from '../pdfViewer/PdfViewer';

export const $Markdown = styled(ReactMarkdown)`
  background-color: ${(props) => props.theme.colors.white};
  box-shadow: 0 0 5px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: ${(props) => props.theme.spacing.s};
  padding: ${(props) => props.theme.spacing.xs3}
    ${(props) => props.theme.spacing.l} ${(props) => props.theme.spacing.m}
    ${(props) => props.theme.spacing.l};

  * {
    line-height: 1.35;
  }

  ul {
    margin-left: var(--spacing-xl);
    margin-bottom: var(--spacing-m);
  }

  ul li {
    list-style: disc;
    margin-bottom: var(--spacing-xs);
  }
`;

type TermsOfServiceProps = {
  setIsTermsOfSerivceApproved: (isTermsOfServiceApproved: boolean) => void;
};

const TermsOfService: React.FC<TermsOfServiceProps> = ({
  setIsTermsOfSerivceApproved,
}) => {
  const {
    theme,
    t,
    termsInEffectUrl,
    termsInEffectMarkdown,
    user,
    approveTermsOfService,
  } = useTermsOfServiceData(setIsTermsOfSerivceApproved);

  const { mutate } = useApproveTermsOfServiceMutation();

  const logout = useLogout();

  return (
    <Container>
      <FormSection withoutDivider data-testid="terms-of-service">
        <$GridCell
          $colStart={1}
          $colSpan={12}
          css={{ marginTop: theme.spacingLayout.l }}
        >
          <$PageHeading>{t('common:serviceName')}</$PageHeading>
        </$GridCell>
        <$GridCell $colSpan={12}>
          <h2 css={{ marginBottom: 0 }}>
            {t('common:login.termsOfServiceHeader')}
          </h2>
        </$GridCell>
        {termsInEffectMarkdown?.length > 0 ? (
          <$GridCell
            $colSpan={12}
            css={`
              margin-bottom: var(--spacing-xl);
              margin-top: var(--spacing-xl);
            `}
          >
            <$Markdown>{termsInEffectMarkdown}</$Markdown>
          </$GridCell>
        ) : null}
        {termsInEffectUrl?.length > 0 ? (
          <>
            <$GridCell
              $colSpan={12}
              css={`
                margin-bottom: var(--spacing-xl);
                margin-top: var(--spacing-xl);
              `}
            >
              <PdfViewer file={termsInEffectUrl} scale={1.8} />
            </$GridCell>

            <$GridCell
              $colSpan={5}
              css={`
                margin-bottom: var(--spacing-xl);
                margin-top: var(--spacing-xl);
              `}
            >
              <Button
                theme="black"
                variant="secondary"
                onClick={() => openFileInNewTab(termsInEffectUrl)}
              >
                {t('common:applications.actions.openTermsAsPDF')}
              </Button>
            </$GridCell>
          </>
        ) : null}
        <$GridCell $colSpan={12}>
          <$Hr />
        </$GridCell>
        <$GridCell $colSpan={7} css={{ display: 'flex' }}>
          <Button
            theme="coat"
            variant="primary"
            onClick={() =>
              user?.termsOfServiceApprovalNeeded
                ? mutate(user, {
                    onSuccess: () => approveTermsOfService(),
                  })
                : approveTermsOfService()
            }
            css={{ marginRight: theme.spacing.s }}
          >
            {t('common:applications.actions.continueToService')}
          </Button>
          <Button theme="black" variant="secondary" onClick={logout}>
            {t('common:applications.actions.pauseAndExit')}
          </Button>
        </$GridCell>
      </FormSection>
    </Container>
  );
};

export default TermsOfService;
