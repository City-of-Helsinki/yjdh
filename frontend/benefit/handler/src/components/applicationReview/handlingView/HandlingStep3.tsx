import { Application } from 'benefit-shared/types/application';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import Heading from 'shared/components/forms/heading/Heading';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';

import CalculationReview from '../CalculationReview';
import { $EditorPreview } from './EditorAhjoProposal.sc';
import { $ReviewGrid } from './HandlingStep.sc';

type HandlingStepProps = {
  application: Application;
};

const ApplicationReviewStep3: React.FC<HandlingStepProps> = ({
  application,
}) => {
  const { t } = useTranslation();
  return (
    <Container>
      <$ReviewGrid border={theme.colors.silver}>
        <CalculationReview application={application} />
      </$ReviewGrid>
      <$ReviewGrid border={theme.colors.silver}>
        <$GridCell $colSpan={12}>
          <Heading
            header={`${t(
              'common:review.decisionProposal.preview.proposalTexts'
            )}`}
            size="m"
            as="h3"
            $css={{ marginTop: 0, marginBottom: theme.spacing.s }}
          />
          <hr />
          <Heading
            header={`${t(
              'common:review.decisionProposal.preview.staticTitle'
            )}`}
            size="l"
            weight="400"
            as="p"
            $css={{ marginTop: 0, marginBottom: theme.spacing.xs }}
          />
          <Heading
            header={`${application?.company?.name}, ${t(
              'common:review.decisionProposal.preview.application'
            )} ${application?.applicationNumber}`}
            size="l"
            as="p"
            weight="400"
            $css={{ marginTop: 0, marginBottom: theme.spacing.s }}
          />
          <p>{t('common:review.decisionProposal.preview.ahjoIdentifier')}</p>

          <Heading
            header={`${t(
              'common:review.decisionProposal.preview.decisionText'
            )}`}
            as="h4"
            size="m"
            $css={{ marginTop: theme.spacing.s }}
          />

          <$EditorPreview>
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: application.decisionProposalDraft.decisionText,
              }}
              data-testid="decision-text-preview"
            />
          </$EditorPreview>
        </$GridCell>

        <$GridCell $colSpan={12}>
          <Heading
            header={`${t(
              'common:review.decisionProposal.preview.justificationText'
            )}`}
            size="m"
            as="h4"
            $css={{ marginTop: theme.spacing.m }}
          />
          <$EditorPreview>
            <div
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: application.decisionProposalDraft.justificationText,
              }}
              data-testid="justification-text-preview"
            />
          </$EditorPreview>
        </$GridCell>
      </$ReviewGrid>
    </Container>
  );
};

export default ApplicationReviewStep3;
