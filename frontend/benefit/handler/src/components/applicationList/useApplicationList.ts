import { APPLICATION_STATUSES } from 'benefit/handler/constants';
import useApplicationsQuery from 'benefit/handler/hooks/useApplicationsQuery';
import { ApplicationListItemData } from 'benefit/handler/types/application';
import { useEffect } from 'react';
import { TFunction, useTranslation } from 'next-i18next';
import isServerSide from 'shared/server/is-server-side';
import { formatDate } from 'shared/utils/date.utils';
import hdsToast from 'shared/components/toast/Toast';

interface ApplicationListProps {
  t: TFunction;
  list: ApplicationListItemData[];
  shouldShowSkeleton: boolean;
  shouldHideList: boolean;
  getHeader: (id: string) => string;
  translationsBase: string;
}

const getFullName = (firstName: string, lastName: string): string => {
  const name = `${firstName || ''} ${lastName || ''}`;
  return name === ' ' ? '-' : name;
};

const translationsBase = 'common:applications.list';

const useApplicationList = (
  status: APPLICATION_STATUSES[]
): ApplicationListProps => {
  const { t } = useTranslation();
  const { data, error, isLoading } = useApplicationsQuery(status);

  useEffect(() => {
    if (error) {
      hdsToast({
        autoDismissTime: 5000,
        type: 'error',
        labelText: t(`${translationsBase}.errors.fetch.label`),
        text: t(`${translationsBase}.errors.fetch.text`, {
          status: status,
        }),
      });
    }
  }, [t, error, status]);

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
    t(`${translationsBase}.columns.${id}`);

  return {
    t,
    list: list || [],
    shouldShowSkeleton,
    shouldHideList,
    getHeader,
    translationsBase,
  };
};

export { useApplicationList };
