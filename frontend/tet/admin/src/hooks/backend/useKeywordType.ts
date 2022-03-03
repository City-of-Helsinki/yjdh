import { ClassificationType, KeywordFn } from 'tet/admin/types/classification';
import { useQueries } from 'react-query';
import { getWorkFeatures, getWorkMethods } from 'tet/admin/backend-api/linked-events-api';

export type UseKeywordResult = {
  getKeywordType?: KeywordFn;
  isLoading: boolean;
  // TODO add error
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

  if (!workMethods.data || !workFeatures.data) {
    // TODO return error
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
