import AppContext from 'benefit/handler/context/AppContext';
import { ApplicationListTableColumns } from 'benefit/handler/types/applicationList';
import { DecisionProposalTemplateData } from 'benefit/handler/types/common';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application, Row } from 'benefit-shared/types/application';
import intervalToDuration from 'date-fns/intervalToDuration';
import {
  IconCheckCircleFill,
  IconCrossCircleFill,
  Select,
  SelectionGroup,
  Table,
  TextArea,
} from 'hds-react';
import clone from 'lodash/clone';
import { TFunction, useTranslation } from 'next-i18next';
import * as React from 'react';
import Container from 'shared/components/container/Container';
import { $RadioButton } from 'shared/components/forms/fields/Fields.sc';
import Heading from 'shared/components/forms/heading/Heading';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

import { $HorizontalList } from '../table/TableExtras.sc';
import { $CalculationReviewTableWrapper } from './ApplicationReview.sc';
import useDecisionProposalTemplateQuery from './useDecisionProposalTemplateQuery';

type ApplicationReviewStepProps = {
  application: Application;
};

type BenefitRow = {
  id: string;
  dates: string;
  amount: string;
  amountNumber: string;
  perMonth: string;
  duration: string;
  startDate: string;
  endDate: string;
};

const initialBenefitRow: BenefitRow = {
  id: '',
  dates: '',
  amount: '',
  amountNumber: '',
  perMonth: '',
  duration: '',
  startDate: '',
  endDate: '',
};

const getTableCols = (t: TFunction): ApplicationListTableColumns[] => [
  {
    key: 'dates',
    headerName: t('common:review.decisionProposal.calculationReview.dates'),
  },
  {
    key: 'duration',
    headerName: t('common:review.decisionProposal.calculationReview.duration'),
  },
  {
    key: 'perMonth',
    headerName: t('common:review.decisionProposal.calculationReview.perMonth'),
  },
  {
    key: 'amount',
    headerName: t('common:review.decisionProposal.calculationReview.amount'),
  },
];

const ApplicationReviewStep2: React.FC<ApplicationReviewStepProps> = ({
  application,
}) => {
  const {
    company,
    employee,
    applicantLanguage,
    calculation,
    id,
    decisionProposalDraft,
  } = application;
  const filteredData: Row[] = calculation.rows.filter((row) =>
    ['helsinki_benefit_monthly_eur', 'helsinki_benefit_sub_total_eur'].includes(
      row.rowType
    )
  );
  const { t } = useTranslation();
  const { handledApplication, setHandledApplication } =
    React.useContext(AppContext);

  // Needed in HTML editor
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedTemplate, setSelectedTemplate] =
    React.useState<DecisionProposalTemplateData>({
      id: '',
      name: '',
      template_decision_text: '',
      template_justification_text: '',
    });

  const [justificationText, setJustificationText] = React.useState<string>(
    handledApplication?.justificationText || ''
  );
  const [decisionText, setDecisionText] = React.useState<string>(
    handledApplication?.decisionText || ''
  );

  const { data: sections } = useDecisionProposalTemplateQuery(
    id,
    'accepted_decision' // TODO: Use constant and pass the radio button selection from previous page
  );

  let tableRow: BenefitRow = {
    id: '',
    dates: '',
    amount: '',
    amountNumber: '',
    perMonth: '',
    duration: '',
    startDate: '',
    endDate: '',
  };

  // TODO: Extract to utility functions or to useApplicationReviewStep2
  const tableRows = filteredData.reduce((acc: BenefitRow[], row: Row) => {
    tableRow.id = row.id;
    if (row.rowType === 'helsinki_benefit_monthly_eur') {
      tableRow.perMonth = `${formatFloatToCurrency(row.amount)} / kk`;
    }
    if (row.rowType === 'helsinki_benefit_sub_total_eur') {
      tableRow.dates = `${convertToUIDateFormat(
        row.startDate
      )} - ${convertToUIDateFormat(row.endDate)}`;

      tableRow.endDate = convertToUIDateFormat(row.endDate);
      tableRow.startDate = convertToUIDateFormat(row.startDate);
      const duration = intervalToDuration({
        start: new Date(row.startDate),
        end: new Date(row.endDate),
      });

      tableRow.duration = `${
        duration.months > 0 ? `${duration.months}kk, ` : ''
      }${duration.days}p `;

      // mergeRow.duration =
      //   differenceInDays(new Date(row.endDate), new Date(row.startDate)) + ' p';

      tableRow.amount = formatFloatToCurrency(row.amount);
      tableRow.amountNumber = row.amount;
      acc.push(tableRow);
      tableRow = clone(initialBenefitRow);
    }
    return acc;
  }, []);

  const totalSum = tableRows.reduce(
    (acc: number, cur: BenefitRow) => acc + parseFloat(cur.amountNumber),
    0
  );

  if (tableRows.length > 0)
    tableRows.push({
      ...clone(initialBenefitRow),
      id: 'table-footer',
      dates: `${tableRows.at(0).startDate} - ${tableRows.at(-1).endDate}`,
      amount: formatFloatToCurrency(totalSum),
    });

  if (!sections || sections?.length === 0) {
    return null;
  }

  return (
    <Container>
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
            header={t('common:review.decisionProposal.list.title')}
            as="h3"
          />
          {handledApplication.status === APPLICATION_STATUSES.ACCEPTED && (
            <p>
              {t('common:review.decisionProposal.list.text.accepted', {
                months: '123',
                startAndEndDate: `${tableRows.at(-1)?.dates}`,
              })}
            </p>
          )}
          {handledApplication.status === APPLICATION_STATUSES.REJECTED && (
            <p>{t('common:review.decisionProposal.list.text.rejected')}</p>
          )}
          <hr />
        </$GridCell>

        <$GridCell $colSpan={12}>
          <$HorizontalList css="padding-left: 0;">
            <div>
              <dt>
                {t('common:review.decisionProposal.list.proposalStatus.label')}
              </dt>
              <dd>
                {decisionProposalDraft.status ===
                APPLICATION_STATUSES.ACCEPTED ? (
                  <>
                    <IconCheckCircleFill color={theme.colors.tram} />{' '}
                    {t(
                      'common:review.decisionProposal.list.proposalStatus.accepted'
                    )}
                  </>
                ) : (
                  <>
                    <IconCrossCircleFill color={theme.colors.brick} />{' '}
                    {t(
                      'common:review.decisionProposal.list.proposalStatus.rejected'
                    )}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>{t('common:review.decisionProposal.list.employerName')}</dt>
              <dd>{company.name}</dd>
            </div>
            {decisionProposalDraft.status === APPLICATION_STATUSES.REJECTED && (
              <div>
                <dt>{t('common:review.decisionProposal.list.employeeName')}</dt>
                <dd>
                  {employee.firstName} {employee.lastName}
                </dd>
              </div>
            )}
            {decisionProposalDraft.status === APPLICATION_STATUSES.ACCEPTED && (
              <>
                <div>
                  <dt>
                    {t('common:review.decisionProposal.list.totalAmount')}
                  </dt>
                  <dd>{formatFloatToCurrency(totalSum)}</dd>
                </div>
                <div>
                  <dt>
                    {t(
                      'common:review.decisionProposal.list.grantedAsDeMinimisAid'
                    )}
                  </dt>
                  <dd>
                    {decisionProposalDraft.grantedAsDeMinimisAid
                      ? t('common:utility.yes')
                      : t('common:utility.no')}
                  </dd>
                </div>
              </>
            )}
          </$HorizontalList>
        </$GridCell>
        {handledApplication.status === APPLICATION_STATUSES.ACCEPTED && (
          <$GridCell $colSpan={12}>
            <hr />

            <$CalculationReviewTableWrapper>
              <Table
                caption={t(
                  'common:review.decisionProposal.calculationReview.tableCaption'
                )}
                renderIndexCol={false}
                cols={getTableCols(t)}
                rows={tableRows}
                indexKey="id"
                theme={theme.components.table}
              />
            </$CalculationReviewTableWrapper>
          </$GridCell>
        )}
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
                }
              }}
            />
          </SelectionGroup>
        </$GridCell>
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
            options={sections?.map((section: DecisionProposalTemplateData) => ({
              ...section,
              label: section.name,
            }))}
            onChange={(selected: DecisionProposalTemplateData): void => {
              setSelectedTemplate(selected);
              setDecisionText(selected.template_decision_text);
              setJustificationText(selected.template_justification_text);
            }}
            style={{ marginTop: 'var(--spacing-xs)' }}
          />
        </$GridCell>

        <$GridCell $colSpan={12} css={{ marginBottom: 'var(--spacing-m)' }}>
          <TextArea
            id="decision-text"
            label="Päätös"
            value={decisionText}
            placeholder="Päätös"
            onChange={(e) => {
              setHandledApplication({
                ...handledApplication,
                decisionText: e.target.value,
              });
              setDecisionText(e.target.value);
            }}
          />
        </$GridCell>
        <$GridCell $colSpan={12}>
          <TextArea
            label="Päätöksen perustelut"
            id="justification-text"
            placeholder="Päätöksen perustelut"
            value={justificationText}
            onChange={(e) => {
              setHandledApplication({
                ...handledApplication,
                justificationText: e.target.value,
              });
              setJustificationText(e.target.value);
            }}
          />
        </$GridCell>
      </$Grid>
    </Container>
  );
};

export default ApplicationReviewStep2;
