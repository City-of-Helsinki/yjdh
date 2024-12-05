import { useRouterNavigation } from 'benefit/handler/hooks/applicationHandling/useRouterNavigation';
import { useDetermineAhjoMode } from 'benefit/handler/hooks/useDetermineAhjoMode';
import useUpdateApplicationQuery from 'benefit/handler/hooks/useUpdateApplicationQuery';
import { APPLICATION_STATUSES } from 'benefit-shared/constants';
import { Application, ApplicationData } from 'benefit-shared/types/application';
import { Button } from 'hds-react';
import { useTranslation } from 'next-i18next';
import * as React from 'react';
import {
  $Grid,
  $GridCell,
} from 'shared/components/forms/section/FormSection.sc';
import { stringToFloatValue } from 'shared/utils/string.utils';
import snakecaseKeys from 'snakecase-keys';

export type Props = {
  application: Application;
  'data-testid'?: string;
};

const ReceivedApplicationActions: React.FC<Props> = ({
  application,
  'data-testid': dataTestId,
}) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const { navigateBack } = useRouterNavigation(
    application?.status,
    application?.batch?.status
  );

  const { mutate: updateApplication } = useUpdateApplicationQuery();

  const isNewAhjoMode = useDetermineAhjoMode();

  const handleStatusChange = (): void => {
    const currentApplicationData = snakecaseKeys(
      {
        ...application,
        calculation: application.calculation
          ? {
              ...application.calculation,
              monthlyPay: stringToFloatValue(
                application.calculation.monthlyPay
              ),
              otherExpenses: stringToFloatValue(
                application.calculation.otherExpenses
              ),
              vacationMoney: stringToFloatValue(
                application.calculation.vacationMoney
              ),
              overrideMonthlyBenefitAmount: stringToFloatValue(
                application.calculation.overrideMonthlyBenefitAmount
              ),
            }
          : undefined,
        status: APPLICATION_STATUSES.HANDLING,
        handled_by_ahjo_automation: isNewAhjoMode,
      },
      { deep: true }
    ) as ApplicationData;
    updateApplication(currentApplicationData);
  };

  return (
    <$Grid data-testid={dataTestId}>
      <$GridCell>
        <Button
          onClick={() => navigateBack()}
          theme="black"
          variant="secondary"
        >
          {t(`${translationsBase}.close`)}
        </Button>
      </$GridCell>
      <$GridCell $colSpan={2}>
        <Button onClick={handleStatusChange} theme="coat">
          {t(`${translationsBase}.handle`)}
        </Button>
      </$GridCell>
    </$Grid>
  );
};

export default ReceivedApplicationActions;
