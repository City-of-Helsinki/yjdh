import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Language } from 'shared/i18n/i18n';
import { OptionType } from 'tet-shared/types/classification';
import { IdObject } from 'tet-shared/types/linkedevents';

// By using an environment variable we can set this to yso-helsinki in prod, but keep yso in dev (if needed)
export const keywordsDataSource =
  process.env.NEXT_PUBLIC_KEYWORDS_DATA_SOURCE || 'yso';

type Keyword = IdObject & {
  name: {
    fi: string;
    en?: string;
    sv?: string;
  };
};

type Place = {
  name: {
    fi: string;
  };
  street_address: {
    fi: string;
  };
  address_locality: {
    fi: string;
  };
  postal_code: string;
  '@id': string;
};

const linkedEvents = Axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_LINKEDEVENTS_URL ||
    'https://linkedevents-api.dev.hel.ninja/linkedevents-dev/v1',
  timeout: 4000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function query<T>(
  axiosInstance: AxiosInstance,
  path: string,
  params: Record<string, string | number>
): Promise<T[]> {
  const result: AxiosResponse<{ data: T[] }> = await axiosInstance.get(path, {
    params,
  });
  return result?.data?.data || [];
}

async function queryKeywordSet<T>(
  axiosInstance: AxiosInstance,
  path: string,
  params: Record<string, string | number>
): Promise<T[]> {
  const result: AxiosResponse<{ keywords: T[] }> = await axiosInstance.get(
    path,
    { params }
  );
  return result?.data?.keywords || [];
}

export const keywordToOptionType = (
  keyword: Keyword,
  language: Language = 'fi',
  valueKey: 'id' | '@id' = '@id'
): OptionType => ({
  label: keyword.name[language] ?? keyword.name.fi,
  name: keyword.name[language] ?? keyword.name.fi,
  value: keyword[valueKey] ?? keyword['@id'],
});

export const getWorkMethods = (): Promise<Keyword[]> =>
  queryKeywordSet<Keyword>(linkedEvents, 'keyword_set/tet:wm/', {
    include: 'keywords',
  });

export const getWorkFeatures = (): Promise<Keyword[]> =>
  queryKeywordSet<Keyword>(linkedEvents, 'keyword_set/tet:attr/', {
    include: 'keywords',
  });

export const getWorkKeywords = (search: string): Promise<Keyword[]> =>
  query<Keyword>(linkedEvents, 'keyword/', {
    free_text: search,
    data_source: keywordsDataSource,
  });

export const getAddressList = (search: string): Promise<Place[]> =>
  query<Place>(linkedEvents, 'place/', {
    show_all_places: 'true',
    nocache: 'true',
    text: search,
  });
