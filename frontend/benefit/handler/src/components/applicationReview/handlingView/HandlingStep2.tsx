import AppContext from 'benefit/handler/context/AppContext';
import useAhjoSettingsQuery from 'benefit/handler/hooks/useAhjoSettingsQuery';
import { DecisionProposalTemplateData } from 'benefit/handler/types/common';
import { DECISION_TYPES } from 'benefit-shared/constants';
import { Application, DecisionMaker } from 'benefit-shared/types/application';
import { Select, SelectionGroup } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { $RadioButton } from 'shared/components/forms/fields/Fields.sc';
import Heading from 'shared/components/forms/heading/Heading';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';

import useDecisionProposalTemplateQuery from '../../../hooks/applicationHandling/useDecisionProposalTemplateQuery';
import CalculationReview from '../CalculationReview';
import EditorAhjoProposal from './EditorAhjoProposal';
import { $ReviewGrid } from './HandlingStep.sc';

type HandlingStepProps = {
  application: Application;
};

const replaceDecisionTemplatePlaceholders = (
  text: string,
  role: string
): string => {
  let replacedText = '';

  replacedText = text.replace(/@role/gi, role);

  return replacedText;
};

const ApplicationReviewStep2: React.FC<HandlingStepProps> = ({
  application,
}) => {
  const { applicantLanguage, id } = application;
 
  const { t } = useTranslation();
  const translationBase = 'common:review.decisionProposal';
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);

  const [templateForJustificationText, setTemplateForJustificationText] =
    React.useState<string>(handledApplication?.justificationText || '');
  const [templateForDecisionText, setTemplateForDecisionText] =
    React.useState<string>(handledApplication?.decisionText || '');
  
  const [selectedDecisionMaker, setSelectedDecisionMaker] =
    React.useState<DecisionMaker | null>(null);

  const decisionType =
    handledApplication?.status === 'accepted'
      ? DECISION_TYPES.ACCEPTED
      : DECISION_TYPES.DENIED;

  const { data: sections } = useDecisionProposalTemplateQuery(id, decisionType);
  const { data: decisionMakerOptions } = useAhjoSettingsQuery();

  const selectTemplate = (option: DecisionProposalTemplateData): void => {
    if (!selectedDecisionMaker) return;

    setTemplateForDecisionText(
      replaceDecisionTemplatePlaceholders(
        option.template_decision_text,
        selectedDecisionMaker.name
      )
    );
    setTemplateForJustificationText(
      replaceDecisionTemplatePlaceholders(
        option.template_justification_text,
        selectedDecisionMaker.name
      )
    );

    setHandledApplication({
      ...handledApplication,
      decisionText: replaceDecisionTemplatePlaceholders(
        option.template_decision_text,
        selectedDecisionMaker.name
      ),
      justificationText: replaceDecisionTemplatePlaceholders(
        option.template_justification_text,
        selectedDecisionMaker.name
      ),
      decisionMakerId: selectedDecisionMaker.id,
      decisionMakerName: selectedDecisionMaker.name,
    });
  };

  if (!sections || sections?.length === 0) {
    const language =
      applicantLanguage === 'en' ? 'fi' : (applicantLanguage as 'fi' | 'sv');
    return (
      <Container>
        <Heading
          header={t(
            `review.decisionProposal.templates.missingContent.${handledApplication?.status}`,
            { language }
          )}
        />
      </Container>
    );
  }

  return (
    <Container>
      <$ReviewGrid bgColor={theme.colors.silverLight}>
        <CalculationReview application={application} />
      </$ReviewGrid>

      <$ReviewGrid bgColor={theme.colors.silverLight}>
        <$GridCell $colSpan={12}>
          <Heading
            $css={{ marginTop: 0 }}
            header={t(`${translationBase}.role.title`)}
            as="h3"
          />
        </$GridCell>
        <$GridCell $colSpan={12}>
        <SelectionGroup
            label={t(`${translationBase}.role.fields.decisionMaker.label`)}
            tooltipText={t(
              `${translationBase}.role.fields.decisionMaker.tooltipText`
            )}
          >
            {decisionMakerOptions?.map((option) => (
              <$RadioButton
                key={`radio-decision-maker-${option.id}`}
                id={`radio-decision-maker-${option.id}`}
                value={option.id}
                label={option.name}
                checked={selectedDecisionMaker?.id === option?.id}
                onChange={(value) => {
                  setSelectedDecisionMaker({
                    id: option.id,
                    name: option.name,
                  });
                  if (value) {
                    setTemplateForDecisionText(
                      replaceDecisionTemplatePlaceholders(
                        handledApplication?.decisionText || '',
                        option.name
                      )
                    );

                    setTemplateForJustificationText(
                      replaceDecisionTemplatePlaceholders(
                        handledApplication?.justificationText || '',
                        option.name
                      )
                    );

                    setHandledApplication({
                      ...handledApplication,
                      handlerRole: 'handler',
                      decisionText: replaceDecisionTemplatePlaceholders(
                        handledApplication?.decisionText || '',
                        option.name
                      ),
                      justificationText: replaceDecisionTemplatePlaceholders(
                        handledApplication?.justificationText || '',
                        option.name
                      ),
                    });
                  }
                }}
              />
            ))}
          </SelectionGroup>
        </$GridCell>
      </$ReviewGrid>
      {handledApplication?.handlerRole && (
        <$ReviewGrid bgColor={theme.colors.silverLight}>
          <$GridCell $colSpan={12}>
            <Heading
              $css={{ marginTop: 0 }}
              header={t(`${translationBase}.templates.title`)}
              as="h3"
            />

            <p>
              {t(`${translationBase}.templates.fields.usedLanguage.label`)}{' '}
              <span>
                <strong>
                  {t(`common:languages.${applicantLanguage}`).toLowerCase()}
                </strong>
                .
              </span>
            </p>
          </$GridCell>
          <$GridCell $colSpan={5} css={{ marginBottom: theme.spacing.m }}>
            <Select
              label={t(`${translationBase}.templates.fields.select.label`)}
              helper={t(
                `${translationBase}.templates.fields.select.helperText`
              )}
              placeholder={t('common:utility.select')}
              options={sections?.map(
                (section: DecisionProposalTemplateData) => ({
                  ...section,
                  label: section.name,
                })
              )}
              onChange={selectTemplate}
              style={{ marginTop: theme.spacing.xs }}
            />
          </$GridCell>

          <$GridCell $colSpan={12}>
            <Heading
              header={t(`${translationBase}.preview.decisionText`)}
              as="h4"
              size="s"
              $css={{ marginTop: theme.spacing.s }}
            />
            <EditorAhjoProposal
              data-testid="decision-text"
              name="decisionText"
              resetWithContent={templateForDecisionText}
            />
          </$GridCell>
          <$GridCell $colSpan={12}>
            <Heading
              header={t(`${translationBase}.preview.justificationText`)}
              size="s"
              as="h4"
              $css={{ marginTop: theme.spacing.m }}
            />
            <EditorAhjoProposal
              name="justificationText"
              data-testid="justification-text"
              resetWithContent={templateForJustificationText}
            />
          </$GridCell>
        </$ReviewGrid>
      )}
    </Container>
  );
};

export default ApplicationReviewStep2;
