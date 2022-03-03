import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import { OptionType } from 'tet/admin/types/classification';
import { IdObject } from 'tet/admin/types/linkedevents';

// TODO replacing these values with real data source names should be enough when they're available in LinkedEvents
export const workMethodDataSource = 'helmet';
export const workFeaturesDataSource = 'kulke';
// By using an environment variable we can set this to yso-helsinki in prod, but keep yso in dev (if needed)
export const keywordsDataSource = process.env.NEXT_PUBLIC_KEYWORDS_DATA_SOURCE || 'yso';

type Keyword = IdObject & {
  name: {
    fi: string;
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
  baseURL: 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

async function query<T>(
  axiosInstance: AxiosInstance,
  path: string,
  params: Record<string, string | number>,
): Promise<T[]> {
  try {
    const result: AxiosResponse<{ data: T[] }> = await axiosInstance.get(path, { params });
    return result?.data?.data || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function queryKeywordSet<T>(
  axiosInstance: AxiosInstance,
  path: string,
  params: Record<string, string | number>,
): Promise<T[]> {
  try {
    const result: AxiosResponse<{ keywords: T[] }> = await axiosInstance.get(path, { params });
    return result?.data?.keywords || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export const keywordToOptionType = (keyword: Keyword): OptionType => ({
  label: keyword.name.fi,
  name: keyword.name.fi,
  value: keyword['@id'],
});

export const getWorkMethods = (): Promise<Keyword[]> =>
  queryKeywordSet<Keyword>(linkedEvents, '/v1/keyword_set/tet:wm/', {
    include: 'keywords',
  });

export const getWorkFeatures = (): Promise<Keyword[]> =>
  queryKeywordSet<Keyword>(linkedEvents, '/v1/keyword_set/tet:attr/', {
    include: 'keywords',
  });

export const getWorkKeywords = (search: string): Promise<Keyword[]> =>
  query<Keyword>(linkedEvents, '/v1/keyword/', {
    free_text: search,
    data_source: keywordsDataSource,
  });

export const getAddressList = (search: string): Promise<Place[]> =>
  query<Place>(linkedEvents, '/v1/place/', {
    show_all_places: 'true',
    nocache: 'true',
    text: search,
  });
