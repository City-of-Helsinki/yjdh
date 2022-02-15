import Axios, { AxiosInstance, AxiosResponse } from 'axios';
import { OptionType } from 'tet/admin/types/classification';

// TODO replacing these values with real data source names should be enough when they're available in LinkedEvents
export const workMethodDataSource = 'helmet';
export const workFeaturesDataSource = 'kulke';

type Keyword = {
  name: {
    fi: string;
  };
  '@id': string;
};

type Place = {
  name: {
    fi: string;
  };
  street_address: {
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

const apiHelsinki = Axios.create({
  baseURL: ' https://api.hel.fi/linkedevents',
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

const keywordToOptionType = (keyword: Keyword): OptionType => ({
  label: keyword.name.fi,
  name: keyword.name.fi,
  value: keyword['@id'],
});

export const getWorkMethods = async (): Promise<OptionType[]> => {
  const keywords = await query<Keyword>(linkedEvents, '/v1/keyword/', {
    show_all_keywords: 'true',
    data_source: workMethodDataSource,
    page_size: 3, // TODO omit when the real data source is created
  });
  return keywords.map((k) => keywordToOptionType(k));
};

export const getWorkFeatures = async (): Promise<OptionType[]> => {
  const keywords = await query<Keyword>(linkedEvents, '/v1/keyword/', {
    show_all_keywords: 'true',
    data_source: workFeaturesDataSource,
    page_size: 9, // TODO omit when the real data source is created
  });
  return keywords.map((k) => keywordToOptionType(k));
};

export const getWorkKeywords = async (search: string): Promise<OptionType[]> => {
  const keywords = await query<Keyword>(linkedEvents, '/v1/keyword/', {
    free_text: search,
  });
  return keywords.map((k) => keywordToOptionType(k));
};

export const getAddressList = (search: string): Promise<Place[]> =>
  query<Place>(linkedEvents, '/v1/place/', {
    show_all_places: 'true',
    nocache: 'true',
    text: search,
  });
