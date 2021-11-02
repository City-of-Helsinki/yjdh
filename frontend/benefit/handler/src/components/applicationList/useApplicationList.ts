import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import { ApplicationListItemData } from 'benefit/handler/types/application';
import { TFunction, useTranslation } from 'next-i18next';
import isServerSide from 'shared/server/is-server-side';
import { formatDate } from 'shared/utils/date.utils';

interface ApplicationListProps {
  t: TFunction;
  list: ApplicationListItemData[];
  shouldShowSkeleton: boolean;
  shouldHideList: boolean;
  getHeader: (id: string) => string;
}

const getFullName = (firstName: string, lastName: string): string => {
  const name = `${firstName || ''} ${lastName || ''}`;
  return name === ' ' ? '-' : name;
};

const useApplicationList = (
  status: APPLICATION_STATUSES[]
): ApplicationListProps => {
  const { t } = useTranslation();
  const { data, error, isLoading } = useApplicationsQuery(status);

  // todo: error handling with toast

  const list = data?.reduce<ApplicationListItemData[]>((acc, application) => {
    const {
      id = '',
      employee,
      company,
      submitted_at,
      application_number: applicationNum,
    } = application;

    const employeeName = getFullName(employee?.first_name, employee?.last_name);
    const submittedAt = submitted_at ? formatDate(new Date(submitted_at)) : '-';
    const companyName = company ? company.name : '-';
    const companyId = company ? company.business_id : '-';
    const applicationListItem = {
      id,
      companyName,
      companyId,
      employeeName,
      submittedAt,
      applicationNum,
    };
    return [...acc, applicationListItem];
  }, []);

  const shouldShowSkeleton = !isServerSide() && isLoading;

  const shouldHideList =
    Boolean(error) ||
    (!shouldShowSkeleton && Array.isArray(data) && data.length === 0);

  const getHeader = (id: string): string =>
    t(`common:applications.list.columns.${id}`);

  return { t, list: list || [], shouldShowSkeleton, shouldHideList, getHeader };
};

export { useApplicationList };
