import useHandlerReviewActions from 'benefit/handler/hooks/useHandlerReviewActions';
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
};

const ReceivedApplicationActions: React.FC<Props> = ({ application }) => {
  const translationsBase = 'common:review.actions';
  const { t } = useTranslation();
  const { onSaveAndClose } = useHandlerReviewActions(application);

  const { mutate: updateApplication } = useUpdateApplicationQuery();

  const handleStatusChange = (): void => {
    const currentApplicationData = snakecaseKeys(
      {
        ...application,
        calculation: application.calculation ? {
          ...application.calculation,
          monthlyPay: stringToFloatValue(application.calculation.monthlyPay),
          otherExpenses: stringToFloatValue(
            application.calculation.otherExpenses
          ),
          vacationMoney: stringToFloatValue(
            application.calculation.vacationMoney
          ),
          overrideMonthlyBenefitAmount: stringToFloatValue(
            application.calculation.overrideMonthlyBenefitAmount
          ),
        }: undefined,
        status: APPLICATION_STATUSES.HANDLING,
      },
      { deep: true }
    ) as ApplicationData;
    updateApplication(currentApplicationData);
  };

  return (
    <$Grid>
      <$GridCell $colSpan={2}>
        <Button onClick={handleStatusChange} theme="coat">
          {t(`${translationsBase}.handle`)}
        </Button>
      </$GridCell>
      <$GridCell>
        <Button onClick={onSaveAndClose} theme="black" variant="secondary">
          {t(`${translationsBase}.close`)}
        </Button>
      </$GridCell>
    </$Grid>
  );
};

export default ReceivedApplicationActions;
