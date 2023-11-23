import { HandledAplication } from 'benefit/handler/types/application';
import { extractCalculatorRows } from 'benefit/handler/utils/calculator';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Row } from 'benefit-shared/types/application';
import { Button, Dialog } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

import { $Header, $Text } from '../HandlingApplicationActions.sc';

type ComponentProps = {
  handledApplication: HandledAplication;
  onClose: () => void;
  onSubmit: () => void;
  calculationRows: Row[];
};

const DoneModalContent: React.FC<ComponentProps> = ({
  handledApplication,
  onClose,
  onSubmit,
  calculationRows,
}) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();

  const isApproved =
    handledApplication.status === APPLICATION_STATUSES.ACCEPTED;
  const description = handledApplication?.logEntryComment;

  const { totalRow, dateRangeRows, helsinkiBenefitMonthlyRows } =
    extractCalculatorRows(calculationRows);

  return (
    <>
      <Dialog.Content>
        <$Grid>
          <$GridCell $colSpan={12} $rowSpan={3}>
            <$Text>
              {isApproved
                ? t(`${translationsBase}.accepting`)
                : t(`${translationsBase}.rejecting`)}
            </$Text>
          </$GridCell>
          {isApproved && totalRow && (
            <$GridCell $colSpan={12} $rowSpan={3}>
              <$Header>{t(`${translationsBase}.acceptedSubsidy`)}</$Header>
              <$GridCell $colSpan={12}>
                <$Text>
                  {t(`${translationsBase}.eurosTotal`, {
                    total: formatFloatToCurrency(
                      totalRow.amount,
                      null,
                      'fi-FI',
                      0
                    ),
                  })}
                </$Text>
              </$GridCell>
              {helsinkiBenefitMonthlyRows.map((row, index) => (
                <$Text key={row.id}>
                  {t(`${translationsBase}.eurosPerMonth`, {
                    euros: formatFloatToCurrency(row.amount, null, 'fi-FI', 0),
                    dateRange:
                      dateRangeRows[index]?.descriptionFi.toLocaleLowerCase(),
                  })}
                </$Text>
              ))}
            </$GridCell>
          )}
          {description && (
            <$GridCell $colSpan={12} $rowSpan={3}>
              <$Header>{t(`${translationsBase}.description`)}</$Header>
              <$Text>{description}</$Text>
            </$GridCell>
          )}
        </$Grid>
      </Dialog.Content>
      <Dialog.ActionButtons>
        <Button
          theme="coat"
          variant="primary"
          onClick={onSubmit}
          data-testid="submit"
        >
          {isApproved
            ? t(`${translationsBase}.accept`)
            : t(`${translationsBase}.reject`)}
        </Button>
        <Button
          theme="black"
          variant="secondary"
          onClick={onClose}
          data-testid="close"
        >
          {t(`${translationsBase}.cancelDecision`)}
        </Button>
      </Dialog.ActionButtons>
    </>
  );
};

export default DoneModalContent;
