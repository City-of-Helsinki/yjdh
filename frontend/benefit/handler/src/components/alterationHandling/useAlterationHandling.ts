import useApplicationQuery from 'benefit/handler/hooks/useApplicationQuery';
import {
  Application,
  ApplicationAlteration,
} from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import { TFunction, useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';

type AlterationHandlingProps = {
  application: Application;
  alteration: ApplicationAlteration;
  isLoading: boolean;
  t: TFunction;
};

const useAlterationHandling = (): AlterationHandlingProps => {
  const router = useRouter();
  const { t } = useTranslation();
  const applicationId = router?.query?.applicationId?.toString() ?? '';
  const alterationId =
    router?.query?.alterationId && !Array.isArray(router.query.alterationId)
      ? Number(router.query.alterationId)
      : '';
  const [isLoading, setIsLoading] = useState(true);

  const { status: applicationDataStatus, data: applicationData } =
    useApplicationQuery(applicationId);

  const application: Application = camelcaseKeys(applicationData || {}, {
    deep: true,
  });

  const alteration: ApplicationAlteration | null =
    application.alterations?.find(
      (candidate) => candidate.id === alterationId
    ) || null;

  useEffect(() => {
    if (
      router.isReady &&
      (!router.query.applicationId || !router.query.alterationId)
    ) {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const loadingDataStatuses = new Set(['idle', 'loading']);
    if (
      applicationId &&
      alterationId &&
      !loadingDataStatuses.has(applicationDataStatus)
    ) {
      setIsLoading(false);
    }
  }, [applicationId, alterationId, applicationDataStatus, applicationData]);

  return {
    application,
    alteration,
    isLoading,
    t,
  };
};

export default useAlterationHandling;
