import AppContext from 'benefit/handler/context/AppContext';
import { DecisionProposalTemplateData } from 'benefit/handler/types/common';
import { DECISION_TYPES } from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { Select, SelectionGroup } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { $RadioButton } from 'shared/components/forms/fields/Fields.sc';
import Heading from 'shared/components/forms/heading/Heading';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';

import CalculationReview from './CalculationReview';
import EditorAhjoProposal from './EditorAhjoProposal';
import useDecisionProposalTemplateQuery from './useDecisionProposalTemplateQuery';

type ApplicationReviewStepProps = {
  application: Application;
};

const ApplicationReviewStep2: React.FC<ApplicationReviewStepProps> = ({
  application,
}) => {
  const { applicantLanguage, id } = application;

  const { t } = useTranslation();
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);

  const [templateForJustificationText, setTemplateForJustificationText] =
    React.useState<string>(handledApplication?.justificationText || '');
  const [templateForDecisionText, setTemplateForDecisionText] =
    React.useState<string>(handledApplication?.decisionText || '');

  const decisionType =
    handledApplication?.status === 'accepted'
      ? DECISION_TYPES.ACCEPTED
      : DECISION_TYPES.DENIED;

  const { data: sections } = useDecisionProposalTemplateQuery(id, decisionType);

  const replaceDecisionTemplatePlaceholders = (
    text: string,
    role: string
  ): string => {
    let replacedText = '';

    const translatedRole = t(
      `common:review.decisionProposal.role.fields.decisionMaker.${role}`
    );

    replacedText = text.replace(/@role/gi, translatedRole);
    replacedText = replacedText.replace(
      /(tiimipäällikkö|helsinkilisä-käsittelijä)/gi,
      translatedRole
    );

    return replacedText;
  };
  const selectTemplate = (option: DecisionProposalTemplateData): void => {
    setTemplateForDecisionText(
      replaceDecisionTemplatePlaceholders(
        option.template_decision_text,
        handledApplication?.handlerRole
      )
    );
    setTemplateForJustificationText(
      replaceDecisionTemplatePlaceholders(
        option.template_justification_text,
        handledApplication?.handlerRole
      )
    );
    setHandledApplication({
      ...handledApplication,
      decisionText: option.template_decision_text,
      justificationText: option.template_justification_text,
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
      <$Grid
        css={`
          border: 2px solid transparent;
          background-color: ${theme.colors.silverLight};
          margin-bottom: ${theme.spacing.m};
          gap: 0;
          padding: ${theme.spacing.l};
        `}
      >
        <CalculationReview application={application} />
      </$Grid>

      <$Grid
        css={`
          background-color: ${theme.colors.silverLight};
          margin-bottom: ${theme.spacing.m};
          gap: 0;
          padding: ${theme.spacing.l};
        `}
      >
        <$GridCell $colSpan={12}>
          <Heading
            $css={{ marginTop: 0 }}
            header={t('common:review.decisionProposal.role.title')}
            as="h3"
          />
        </$GridCell>
        <$GridCell $colSpan={12}>
          <SelectionGroup
            label={t(
              'common:review.decisionProposal.role.fields.decisionMaker.label'
            )}
            tooltipText={t(
              'common:review.decisionProposal.role.fields.decisionMaker.tooltipText'
            )}
          >
            <$RadioButton
              checked={handledApplication?.handlerRole === 'handler'}
              key="radio-decision-maker-handler"
              id="radio-decision-maker-handler"
              value="handler"
              label={t(
                'common:review.decisionProposal.role.fields.decisionMaker.handler'
              )}
              name="inspection_mode"
              onChange={(value) => {
                if (value) {
                  setHandledApplication({
                    ...handledApplication,
                    handlerRole: 'handler',
                  });

                  setTemplateForDecisionText(
                    replaceDecisionTemplatePlaceholders(
                      handledApplication?.decisionText || '',
                      'handler'
                    )
                  );
                  setTemplateForJustificationText(
                    replaceDecisionTemplatePlaceholders(
                      handledApplication?.justificationText || '',
                      'handler'
                    )
                  );
                }
              }}
            />
            <$RadioButton
              checked={handledApplication?.handlerRole === 'manager'}
              key="radio-decision-maker-manager"
              id="radio-decision-maker-manager"
              value="manager"
              label={t(
                'common:review.decisionProposal.role.fields.decisionMaker.manager'
              )}
              name="inspection_mode"
              onChange={(value) => {
                if (value) {
                  setHandledApplication({
                    ...handledApplication,
                    handlerRole: 'manager',
                  });
                  setTemplateForDecisionText(
                    replaceDecisionTemplatePlaceholders(
                      handledApplication?.decisionText || '',
                      'manager'
                    )
                  );
                  setTemplateForJustificationText(
                    replaceDecisionTemplatePlaceholders(
                      handledApplication?.justificationText || '',
                      'manager'
                    )
                  );
                }
              }}
            />
          </SelectionGroup>
        </$GridCell>
      </$Grid>
      {handledApplication?.handlerRole && (
        <$Grid
          css={`
            background-color: ${theme.colors.silverLight};
            margin-bottom: ${theme.spacing.m};
            gap: 0;
            padding: ${theme.spacing.l};
          `}
        >
          <$GridCell $colSpan={12}>
            <Heading
              $css={{ marginTop: 0 }}
              header={t('common:review.decisionProposal.templates.title')}
              as="h3"
            />

            <p>
              {t(
                'common:review.decisionProposal.templates.fields.usedLanguage.label'
              )}{' '}
              <span>
                <strong>
                  {t(`common:languages.${applicantLanguage}`).toLowerCase()}
                </strong>
                .
              </span>
            </p>
          </$GridCell>
          <$GridCell $colSpan={5} css={{ marginBottom: 'var(--spacing-m)' }}>
            <Select
              label={t(
                'common:review.decisionProposal.templates.fields.select.label'
              )}
              helper={t(
                'common:review.decisionProposal.templates.fields.select.helperText'
              )}
              placeholder={t('common:utility.select')}
              options={sections?.map(
                (section: DecisionProposalTemplateData) => ({
                  ...section,
                  label: section.name,
                })
              )}
              onChange={selectTemplate}
              style={{ marginTop: 'var(--spacing-xs)' }}
            />
          </$GridCell>

          <$GridCell $colSpan={12}>
            <Heading
              header={`${t(
                'common:review.decisionProposal.preview.decisionText'
              )}`}
              as="h4"
              size="s"
              $css={{ marginTop: 'var(--spacing-s)' }}
            />
            <EditorAhjoProposal
              data-testid="decision-text"
              name="decisionText"
              resetWithContent={replaceDecisionTemplatePlaceholders(
                templateForDecisionText,
                handledApplication?.handlerRole
              )}
            />
          </$GridCell>
          <$GridCell $colSpan={12}>
            <Heading
              header={`${t(
                'common:review.decisionProposal.preview.justificationText'
              )}`}
              size="s"
              as="h4"
              $css={{ marginTop: 'var(--spacing-m)' }}
            />
            <EditorAhjoProposal
              name="justificationText"
              data-testid="justification-text"
              resetWithContent={replaceDecisionTemplatePlaceholders(
                templateForJustificationText,
                handledApplication?.handlerRole
              )}
            />
          </$GridCell>
        </$Grid>
      )}
    </Container>
  );
};

export default ApplicationReviewStep2;
