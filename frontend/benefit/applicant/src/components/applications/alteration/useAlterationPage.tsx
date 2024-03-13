import useApplicationQuery from 'benefit/applicant/hooks/useApplicationQuery';
import { useTranslation } from 'benefit/applicant/i18n';
import { Application } from 'benefit-shared/types/application';
import camelcaseKeys from 'camelcase-keys';
import { useRouter } from 'next/router';
import { TFunction } from 'next-i18next';
import { useEffect, useState } from 'react';

type AlterationPageProps = {
  application: Application | null,
  t: TFunction,
  id: string,
  isLoading: boolean,
  isError: boolean,
};

const isApplicationLoaded = (id: number | string, status: string): boolean =>
  id && status !== 'idle' && status !== 'loading';

const useAlterationPage = (): AlterationPageProps => {
  const router = useRouter();
  const id = router?.query?.id?.toString() ?? '';
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  // query param used in edit mode. id from context used for updating newly created application
  const {
    status: existingApplicationStatus,
    data: existingApplication,
    error: existingApplicationError,
  } = useApplicationQuery(id);

  useEffect(() => {
    if (isApplicationLoaded(id, existingApplicationStatus)) {
      setIsLoading(false);
    }
  }, [existingApplicationStatus, id, existingApplication]);

  useEffect(() => {
    if (router.isReady && !router.query.id) {
      setIsLoading(false);
    }
  }, [router]);

  return {
    id,
    t,
    application: camelcaseKeys(existingApplication, { deep: true }) ?? null,
    isLoading,
    isError: !!existingApplicationError,
  }
}

export default useAlterationPage;
