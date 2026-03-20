import {
  ALTERATION_STATE,
  INSTALMENT_STATUSES,
} from 'benefit-shared/constants';
import { Application } from 'benefit-shared/types/application';
import { formatFloatToEvenEuros } from 'shared/utils/string.utils';

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
    firstInstalment: data.secondInstalment
      ? Math.max(
          0,
          parseInt(String(data.calculation?.calculatedBenefitAmount || 0), 10) -
            data.secondInstalment.amount
        )
      : parseInt(String(data.calculation?.calculatedBenefitAmount || 0), 10),
    secondInstalment: data.secondInstalment?.amountAfterRecoveries || 0,
    secondInstalmentMax: data.secondInstalment?.amount || 0,
    total: 0,
    totalAfterRecoveries: 0,
    alterations:
      data.alterations
        ?.filter((obj) => obj.state === ALTERATION_STATE.HANDLED)
        .reduce(
          (prev, cur) => prev + parseInt(String(cur.recoveryAmount || 0), 10),
          0
        ) || 0,
  };

  amounts.total = amounts.firstInstalment + amounts.secondInstalment;
  amounts.totalAfterRecoveries =
    parseInt(String(data.calculation?.calculatedBenefitAmount || 0), 10) -
    amounts.alterations;

  const isSecondInstalmentReduced =
    formatFloatToEvenEuros(amounts.secondInstalment) !==
    formatFloatToEvenEuros(amounts.secondInstalmentMax);

  const areInstalmentsPaid =
    data.secondInstalment?.status === INSTALMENT_STATUSES.COMPLETED ||
    !data.secondInstalment;

  return {
    amounts,
    areInstalmentsPaid,
    isSecondInstalmentReduced,
  };
};

export default useInstalmentAccordionSections;
