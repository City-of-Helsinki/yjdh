import useBatchQuery from 'benefit/handler/hooks/useBatchQuery';
import { BATCH_STATUSES } from 'benefit-shared/constants';
import {
  ApplicationInBatch,
  BatchProposal,
} from 'benefit-shared/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import { getFullName } from 'shared/utils/application.utils';
import { convertToUIDateFormat } from 'shared/utils/date.utils';

export interface BatchListProps {
  t: TFunction;
  batches: BatchProposal[] | [];
  shouldShowSkeleton: boolean;
  shouldHideList: boolean;
  getHeader: (id: string) => string;
  translationsBase: string;
}

const translationsBase = 'common:applications.list';

const useBatchProposal = (filterByStatus: BATCH_STATUSES[]): BatchListProps => {
  const { t } = useTranslation();
  const query = useBatchQuery(filterByStatus);

  let batches: BatchProposal[] = [];
  if (query.data) {
    batches = query.data?.map((batchProposal: BatchProposal): BatchProposal => {
      const applications = batchProposal.applications.map(
        (app): ApplicationInBatch => {
          const {
            id,
            status,
            company,
            application_number,
            employee,
            handled_at,
            calculation,
          } = app;

          const benefitAmount =
            calculation?.rows.length > 0 ? calculation.rows.pop().amount : 0;

          return {
            id,
            company_name: company?.name || '',
            application_number,
            employee_name:
              getFullName(employee?.first_name, employee?.last_name) || '-',
            status,
            benefitAmount,
            handled_at: convertToUIDateFormat(handled_at),
            business_id: company?.business_id,
          };
        }
      );

      return {
        ...batchProposal,
        applications,
      };
    });
  }

  const shouldShowSkeleton = query.isLoading;

  const shouldHideList =
    Boolean(query.error) ||
    (!shouldShowSkeleton &&
      Array.isArray(query.data) &&
      query.data.length === 0);

  const getHeader = (id: string): string =>
    t(`${translationsBase}.columns.${id}`);
  return {
    t,
    batches,
    shouldShowSkeleton,
    shouldHideList,
    getHeader,
    translationsBase,
  };
};

export { useBatchProposal };
