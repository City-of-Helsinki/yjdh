import Axios, { AxiosInstance } from 'axios';

const linkedEvents = Axios.create({
  baseURL: 'https://linkedevents-api.dev.hel.ninja/linkedevents-dev',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiHelsinki = Axios.create({
  baseURL: ' https://api.hel.fi/linkedevents',
  timeout: 1000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getWorkMethods = async () => {
  try {
    const result = await linkedEvents.get('/v1/keyword/?show_all_keywords=true&data_source=helmet&page_size=3');
    return result.data;
  } catch (err) {
    throw err;
  }
};

export const getWorkFeatures = async () => {
  try {
    const result = await linkedEvents.get('/v1/keyword/?show_all_keywords=true&data_source=kulke&page_size=9');
    return result.data;
  } catch (err) {
    throw err;
  }
};

export const getWorkKeyWords = async (search) => {
  console.log(search);
  try {
    const result = await apiHelsinki.get(`/v1/keyword/?free_text=${search}`);
    return result.data;
  } catch (err) {
    throw err;
  }
};

export const getAddressList = async (search) => {
  console.log(search);
  try {
    const result = await linkedEvents.get(`/v1/place?show_all_places=true&text=${search}&nocache=true`);
    return result.data;
  } catch (err) {
    throw err;
  }
};
