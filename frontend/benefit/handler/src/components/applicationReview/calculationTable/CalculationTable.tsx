import { $CalculationReviewTableWrapper } from 'benefit/handler/components/applicationReview/calculationTable/CalculationTable.sc';
import { BenefitRow } from 'benefit/handler/components/applicationReview/calculationTable/useCalculationTable';
import { ApplicationListTableColumns } from 'benefit/handler/types/applicationList';
import { Table } from 'hds-react';
import { TFunction, useTranslation } from 'next-i18next';
import React from 'react';
import theme from 'shared/styles/theme';

type Props = {
  tableRows: Array<BenefitRow>;
  caption: React.ReactNode;
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

const CalculationTable: React.FC<Props> = ({ tableRows, caption }) => {
  const { t } = useTranslation();

  return (
    <$CalculationReviewTableWrapper>
      <Table
        caption={caption}
        renderIndexCol={false}
        cols={getTableCols(t)}
        rows={tableRows}
        indexKey="id"
        theme={theme.components.table}
      />
    </$CalculationReviewTableWrapper>
  );
};

export default CalculationTable;
