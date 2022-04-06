import { ClassificationType, KeywordFn } from 'tet-shared/types/keywords';
import { useQueries } from 'react-query';
import {
  getWorkFeatures,
  getWorkMethods,
} from 'tet-shared/backend-api/linked-events-api';

export type UseKeywordResult = {
  getKeywordType?: KeywordFn;
  isLoading: boolean;
  error?: Error;
};

const useKeywordType = (): UseKeywordResult => {
  const results = useQueries([
    { queryKey: 'workMethods', queryFn: getWorkMethods },
    { queryKey: 'workFeatures', queryFn: getWorkFeatures },
  ]);

  const [workMethods, workFeatures] = results;

  if (workMethods.isLoading || workFeatures.isLoading) {
    return {
      isLoading: true,
    };
  }

  if (workMethods.error || workFeatures.error) {
    const error = (workMethods.error || workFeatures.error) as Error;
    return {
      isLoading: false,
      error,
    };
  }

  if (!workMethods.data || !workFeatures.data) {
    return {
      isLoading: false,
    };
  }

  const getKeywordType: KeywordFn = (url: string) => {
    if (workMethods.data.some((keyword) => keyword['@id'] === url)) {
      return ClassificationType.WORKING_METHOD;
    }
    if (workFeatures.data.some((keyword) => keyword['@id'] === url)) {
      return ClassificationType.WORKING_FEATURE;
    }

    return ClassificationType.KEYWORD;
  };

  return {
    isLoading: false,
    getKeywordType,
  };
};

export default useKeywordType;
