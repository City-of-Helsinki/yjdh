import { useQueries } from 'react-query';
import useLocale from 'shared/hooks/useLocale';
import {
  getWorkFeatures,
  getWorkMethods,
  keywordToOptionType,
} from 'tet-shared/backend-api/linked-events-api';
import { ClassificationType, KeywordFn } from 'tet-shared/types/keywords';
import { OptionType } from 'tet-shared/types/classification';

export type UseKeywordResult = {
  getKeywordType?: KeywordFn;
  isLoading: boolean;
  error?: Error;
  workMethodsList?: OptionType[];
  workFeaturesList?: OptionType[];
};

type valueKey = 'id' | '@id';

const useKeywordType = (valueKey: valueKey = '@id'): UseKeywordResult => {
  const locale = useLocale();
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

  const workMethodsList =
    workMethods.data?.map((k) => keywordToOptionType(k, locale, valueKey)) ||
    [];

  const workFeaturesList =
    workFeatures.data?.map((k) => keywordToOptionType(k, locale, valueKey)) ||
    [];

  const getKeywordType: KeywordFn = (value, selector = '@id') => {
    if (workMethods.data.some((keyword) => keyword[selector] === value)) {
      return ClassificationType.WORKING_METHOD;
    }
    if (workFeatures.data.some((keyword) => keyword[selector] === value)) {
      return ClassificationType.WORKING_FEATURE;
    }

    return ClassificationType.KEYWORD;
  };

  return {
    isLoading: false,
    getKeywordType,
    workMethodsList,
    workFeaturesList,
  };
};

export default useKeywordType;
