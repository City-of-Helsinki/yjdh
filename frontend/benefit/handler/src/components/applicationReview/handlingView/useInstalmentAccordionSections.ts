import {
  ALTERATION_STATE,
  INSTALMENT_STATUSES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { formatFloatToCurrency } from 'shared/utils/string.utils';

type Props = {
  amounts: {
    firstInstalment: number;
    secondInstalment: number;
    secondInstalmentMax: number;
    total: number;
    totalAfterRecoveries: number;
    alterations: number;
  };
  areInstalmentsPaid: boolean;
  isSecondInstalmentReduced: boolean;
};

const useInstalmentAccordionSections = (data: Application): Props => {
  const amounts = {
    firstInstalment: data.pendingInstalment
      ? data.calculatedBenefitAmount - data.pendingInstalment.amount
      : data.calculatedBenefitAmount,
    secondInstalment: data.pendingInstalment?.amountAfterRecoveries || 0,
    secondInstalmentMax: data.pendingInstalment?.amount || 0,
    total: 0,
    totalAfterRecoveries: 0,
    alterations:
      data.alterations
        ?.filter((obj) => obj.state === ALTERATION_STATE.HANDLED)
        .reduce((prev, cur) => prev + parseInt(cur.recoveryAmount, 10), 0) || 0,
  };
  amounts.total = amounts.firstInstalment + amounts.secondInstalment;
  amounts.totalAfterRecoveries =
    data.calculatedBenefitAmount - amounts.alterations;

  const isSecondInstalmentReduced =
    formatFloatToCurrency(amounts.secondInstalment, null, 'fi-FI', 0) !==
    formatFloatToCurrency(amounts.secondInstalmentMax, null, 'fi-FI', 0);

  const areInstalmentsPaid =
    data.pendingInstalment?.status === INSTALMENT_STATUSES.COMPLETED ||
    !data.pendingInstalment;

  return {
    amounts,
    areInstalmentsPaid,
    isSecondInstalmentReduced,
  };
};

export default useInstalmentAccordionSections;
