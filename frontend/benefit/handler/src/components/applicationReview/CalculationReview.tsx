import AppContext from 'benefit/handler/context/AppContext';
import { ApplicationListTableColumns } from 'benefit/handler/types/applicationList';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application, Row } from 'benefit-shared/types/application';
import intervalToDuration from 'date-fns/intervalToDuration';
import { IconCheckCircleFill, IconCrossCircleFill, Table } from 'hds-react';
import clone from 'lodash/clone';
import { TFunction, useTranslation } from 'next-i18next';
import * as React from 'react';
import Heading from 'shared/components/forms/heading/Heading';
import { $GridCell } from 'shared/components/forms/section/FormSection.sc';
import theme from 'shared/styles/theme';
import { convertToUIDateFormat } from 'shared/utils/date.utils';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

import { $HorizontalList } from '../table/TableExtras.sc';
import { $CalculationReviewTableWrapper } from './ApplicationReview.sc';

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

const CalculationReview: React.FC<ApplicationReviewStepProps> = ({
  application,
}) => {
  const { company, employee, calculation, decisionProposalDraft } = application;
  const filteredData: Row[] = calculation.rows.filter((row) =>
    ['helsinki_benefit_monthly_eur', 'helsinki_benefit_sub_total_eur'].includes(
      row.rowType
    )
  );
  const { t } = useTranslation();
  const { handledApplication } = React.useContext(AppContext);

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

  return (
    <>
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
                <dt>{t('common:review.decisionProposal.list.totalAmount')}</dt>
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
    </>
  );
};

export default CalculationReview;
