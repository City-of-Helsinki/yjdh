import { AxiosResponse } from 'axios';

const handleResponse = async <R>(
  axiosPromise: Promise<AxiosResponse<R>>
): Promise<R> => {
  const { data } = await axiosPromise;
  return data;
};

export default handleResponse;
