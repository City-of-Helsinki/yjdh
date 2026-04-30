import AppContext from 'benefit/handler/context/AppContext';
import useAhjoSettingsQuery from 'benefit/handler/hooks/useAhjoSettingsQuery';
import { HandledAplication } from 'benefit/handler/types/application';
import { DecisionProposalTemplateData } from 'benefit/handler/types/common';
import { APPLICATION_STATUSES, DECISION_TYPES } from 'benefit-shared/constants';
import {
  AhjoSigner,
  Application,
  DecisionMaker,
} from 'benefit-shared/types/application';
import { LoadingSpinner, Option, Select, SelectionGroup } from 'hds-react';
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
  text: string | null | undefined,
  role: string
): string => (text || '').replace(/@role/gi, role);

type SignerSectionProps = {
  signerOptions: AhjoSigner[] | undefined;
  selectedSigner: AhjoSigner | null;
  setSelectedSigner: React.Dispatch<React.SetStateAction<AhjoSigner | null>>;
  handledApplication: HandledAplication | null;
  setHandledApplication: (application: HandledAplication | null) => void;
  translationBase: string;
};

const SignerSection: React.FC<SignerSectionProps> = ({
  signerOptions,
  selectedSigner,
  setSelectedSigner,
  handledApplication,
  setHandledApplication,
  translationBase,
}) => {
  const { t } = useTranslation();
  return (
    <$ReviewGrid bgColor={theme.colors.silverLight}>
      <$GridCell $colSpan={12}>
        <Heading
          $css={{ marginTop: 0 }}
          header={t(`${translationBase}.signer.title`)}
          as="h3"
        />
      </$GridCell>
      <$GridCell $colSpan={12}>
        <SelectionGroup
          label={t(`${translationBase}.signer.fields.signer.label`)}
          tooltipText={t(
            `${translationBase}.signer.fields.signer.tooltipText`
          )}
        >
          {signerOptions?.map((option, index) => (
            <$RadioButton
              key={`radio-signer-${option.id}`}
              id={`radio-signer-${index}`}
              value={option.id}
              label={option.name}
              checked={selectedSigner?.id === option?.id}
              onChange={() => {
                setSelectedSigner({
                  id: option.id,
                  name: option.name,
                });
                if (handledApplication) {
                  setHandledApplication({
                    ...handledApplication,
                    signerId: option.id,
                    signerName: option.name,
                  });
                }
              }}
            />
          ))}
        </SelectionGroup>
      </$GridCell>
    </$ReviewGrid>
  );
};

type DecisionMakerSectionProps = {
  decisionMakerOptions: DecisionMaker[] | undefined;
  selectedDecisionMaker: DecisionMaker | null;
  setSelectedDecisionMaker: React.Dispatch<
    React.SetStateAction<DecisionMaker | null>
  >;
  handledApplication: HandledAplication | null;
  setHandledApplication: (application: HandledAplication | null) => void;
  setTemplateForDecisionText: React.Dispatch<React.SetStateAction<string>>;
  setTemplateForJustificationText: React.Dispatch<React.SetStateAction<string>>;
  translationBase: string;
};

const DecisionMakerSection: React.FC<DecisionMakerSectionProps> = ({
  decisionMakerOptions,
  selectedDecisionMaker,
  setSelectedDecisionMaker,
  handledApplication,
  setHandledApplication,
  setTemplateForDecisionText,
  setTemplateForJustificationText,
  translationBase,
}) => {
  const { t } = useTranslation();
  return (
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
          {decisionMakerOptions?.map((option, index) => (
            <$RadioButton
              key={`radio-decision-maker-${option.id}`}
              id={`radio-decision-maker-${index}`}
              value={option.id}
              label={option.name}
              checked={selectedDecisionMaker?.id === option?.id}
              onChange={(value: unknown) => {
                setSelectedDecisionMaker({
                  id: option.id,
                  name: option.name,
                });
                if (value && handledApplication) {
                  const decisionText = replaceDecisionTemplatePlaceholders(
                    handledApplication.decisionText || '',
                    option.name || ''
                  );
                  const justificationText = replaceDecisionTemplatePlaceholders(
                    handledApplication.justificationText || '',
                    option.name || ''
                  );
                  setTemplateForDecisionText(decisionText);
                  setTemplateForJustificationText(justificationText);

                  setHandledApplication({
                    ...handledApplication,
                    decisionMakerId: option.id,
                    decisionMakerName: option.name,
                    decisionText,
                    justificationText,
                  });
                }
              }}
            />
          ))}
        </SelectionGroup>
      </$GridCell>
    </$ReviewGrid>
  );
};

type TemplateSectionProps = {
  selectedDecisionMaker: DecisionMaker | null;
  applicantLanguage: string | undefined;
  sections: DecisionProposalTemplateData[] | undefined;
  selectTemplate: (option: Option[]) => void;
  templateForDecisionText: string;
  templateForJustificationText: string;
  translationBase: string;
};

const TemplateSection: React.FC<TemplateSectionProps> = ({
  selectedDecisionMaker,
  applicantLanguage,
  sections,
  selectTemplate,
  templateForDecisionText,
  templateForJustificationText,
  translationBase,
}) => {
  const { t } = useTranslation();
  if (!selectedDecisionMaker?.id) return null;

  return (
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
              {t(`common:languages.${applicantLanguage || 'fi'}`).toLowerCase()}
            </strong>
            .
          </span>
        </p>
      </$GridCell>
      <$GridCell $colSpan={5} css={{ marginBottom: theme.spacing.m }}>
        <Select
          texts={{
            assistive: t(`${translationBase}.templates.fields.select.helperText`),
            label: t(`${translationBase}.templates.fields.select.label`),
            placeholder: t('common:utility.select'),
          }}
          options={
            sections?.map((section: DecisionProposalTemplateData) => ({
              ...section,
              label: section.name,
            })) || []
          }
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
  );
};

const ApplicationReviewStep2: React.FC<HandlingStepProps> = ({
  application,
}) => {
  const { applicantLanguage, id, decisionProposalDraft } = application;

  const { t } = useTranslation();
  const translationBase = 'common:review.decisionProposal';
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);

  const [templateForJustificationText, setTemplateForJustificationText] =
    React.useState<string>(handledApplication?.justificationText || '');
  const [templateForDecisionText, setTemplateForDecisionText] =
    React.useState<string>(handledApplication?.decisionText || '');

  const [selectedDecisionMaker, setSelectedDecisionMaker] =
    React.useState<DecisionMaker | null>(
      handledApplication?.decisionMakerId &&
        handledApplication?.decisionMakerName
        ? {
            id: handledApplication.decisionMakerId,
            name: handledApplication.decisionMakerName,
          }
        : null
    );

  const [selectedSigner, setSelectedSigner] = React.useState<AhjoSigner | null>(
    handledApplication?.signerId && handledApplication?.signerName
      ? {
          id: handledApplication.signerId,
          name: handledApplication.signerName,
        }
      : null
  );

  const decisionType =
    handledApplication?.status === APPLICATION_STATUSES.ACCEPTED
      ? DECISION_TYPES.ACCEPTED
      : DECISION_TYPES.DENIED;

  const { data: sections, isLoading } = useDecisionProposalTemplateQuery(
    id || '',
    decisionType
  );
  const { data: decisionMakerOptions } = useAhjoSettingsQuery(
    'ahjo_decision_maker'
  );
  const { data: signerOptions } = useAhjoSettingsQuery('ahjo_signer');

  const selectTemplate = (option: Option[]): void => {
    if (!selectedDecisionMaker || !handledApplication || !sections) return;

    const fullTemplate = sections.find((s) => s.name === option[0]?.label);
    if (!fullTemplate) return;

    setTemplateForDecisionText(
      replaceDecisionTemplatePlaceholders(
        fullTemplate.template_decision_text,
        selectedDecisionMaker.name || ''
      )
    );
    setTemplateForJustificationText(
      replaceDecisionTemplatePlaceholders(
        fullTemplate.template_justification_text,
        selectedDecisionMaker.name || ''
      )
    );

    setHandledApplication({
      ...handledApplication,
      decisionText: replaceDecisionTemplatePlaceholders(
        fullTemplate.template_decision_text,
        selectedDecisionMaker.name || ''
      ),
      justificationText: replaceDecisionTemplatePlaceholders(
        fullTemplate.template_justification_text,
        selectedDecisionMaker.name || ''
      ),
      decisionMakerId: selectedDecisionMaker.id,
      decisionMakerName: selectedDecisionMaker.name,
      signerId: selectedSigner?.id || '',
      signerName: selectedSigner?.name || '',
    } as Application);
  };

  React.useEffect(() => {
    if (decisionMakerOptions && decisionMakerOptions.length > 0) {
      setSelectedDecisionMaker({
        id:
          handledApplication?.decisionMakerId ||
          decisionProposalDraft?.decisionMakerId ||
          '',
        name:
          handledApplication?.decisionMakerName ||
          decisionProposalDraft?.decisionMakerName ||
          '',
      });
    }
  }, [
    decisionMakerOptions,
    decisionProposalDraft,
    handledApplication?.decisionMakerId,
    handledApplication?.decisionMakerName,
  ]);

  const signerInitialized = React.useRef(false);
  React.useEffect(() => {
    if (signerOptions && signerOptions.length > 0) {
      const firstSigner = signerOptions[0];
      const signerId =
        handledApplication?.signerId ||
        decisionProposalDraft?.signerId ||
        firstSigner.id ||
        '';
      const signerName =
        handledApplication?.signerName ||
        decisionProposalDraft?.signerName ||
        firstSigner.name ||
        '';
      setSelectedSigner({ id: signerId, name: signerName });
      // Persist to shared context so validation can see the signerId.
      // Only run once to avoid overwriting user changes with stale state.
      if (signerId && handledApplication && !signerInitialized.current) {
        signerInitialized.current = true;
        setHandledApplication({
          ...handledApplication,
          signerId,
          signerName,
        } as Application);
      }
    }
  }, [
    signerOptions,
    decisionProposalDraft,
    handledApplication,
    setHandledApplication,
  ]);

  if (isLoading) {
    return (
      <Container>
        <LoadingSpinner />
      </Container>
    );
  }

  if (!sections || sections?.length === 0) {
    const language =
      applicantLanguage === 'en'
        ? 'fi'
        : (applicantLanguage as 'fi' | 'sv') || 'fi';
    return (
      <Container>
        <Heading
          header={t(
            `${translationBase}.templates.missingContent.${
              handledApplication?.status || ''
            }`,
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
      <SignerSection
        signerOptions={signerOptions}
        selectedSigner={selectedSigner}
        setSelectedSigner={setSelectedSigner}
        handledApplication={handledApplication}
        setHandledApplication={setHandledApplication}
        translationBase={translationBase}
      />
      <DecisionMakerSection
        decisionMakerOptions={decisionMakerOptions}
        selectedDecisionMaker={selectedDecisionMaker}
        setSelectedDecisionMaker={setSelectedDecisionMaker}
        handledApplication={handledApplication}
        setHandledApplication={setHandledApplication}
        setTemplateForDecisionText={setTemplateForDecisionText}
        setTemplateForJustificationText={setTemplateForJustificationText}
        translationBase={translationBase}
      />
      <TemplateSection
        selectedDecisionMaker={selectedDecisionMaker}
        applicantLanguage={applicantLanguage}
        sections={sections}
        selectTemplate={selectTemplate}
        templateForDecisionText={templateForDecisionText}
        templateForJustificationText={templateForJustificationText}
        translationBase={translationBase}
      />
    </Container>
  );
};

export default ApplicationReviewStep2;
