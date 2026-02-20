import axios, { AxiosResponseHeaders } from 'axios';
import { RequestMock } from 'testcafe';

import { MockRequest, MockResponse } from '../types';

export const MOCKED_EMPLOYEE_DATA = {
  employee_ssn: '010101-123U',
  employee_phone_number: '040 1234567',
  employee_home_city: 'Helsinki',
  employee_postcode: '00100',
  employee_school: 'Testikoulu',
  target_group: 'secondary_target_group',
};

/**
 * Cache for serial numbers and target groups that the backend doesn't reliably return.
 * The backend has bugs where these fields are lost in responses, so we store them
 * from requests and restore them in responses to make tests work.
 */
const serialNumberFixes = new Map<string, string>();
const targetGroupFixes = new Map<string, string>();

interface VoucherData {
  id: string;
  summer_voucher_serial_number?: string;
  target_group?: string;
}

/**
 * Converts Axios headers to TestCafe's Record<string, string> format.
 */
const getTestCafeHeaders = (
  axiosHeaders: AxiosResponseHeaders
): Record<string, string> => {
  const result: Record<string, string> = {};
  Object.entries(axiosHeaders).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.join(', ');
    }
  });
  return result;
};

const handleFetchEmployeeData = (req: MockRequest, res: MockResponse): void => {
  // eslint-disable-next-line no-console
  console.log('MOCK POST fetch_employee_data hit:', req.url);
  try {
    const body = JSON.parse(req.body.toString()) as {
      employer_summer_voucher_id: string;
      employee_name: string;
    };
    // Manual CORS headers needed because this endpoint doesn't exist on backend
    res.headers['content-type'] = 'application/json';
    res.headers['access-control-allow-origin'] = req.headers.origin || '*';
    res.headers['access-control-allow-credentials'] = 'true';
    res.statusCode = 200;
    res.setBody({
      employer_summer_voucher_id: body.employer_summer_voucher_id,
      employee_name: body.employee_name,
      ...MOCKED_EMPLOYEE_DATA,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('MOCK POST fetch_employee_data FAILED:', error);
    res.statusCode = 500;
  }
};

const cacheVoucherFixes = (vouchers?: VoucherData[]): void => {
  if (!vouchers) return;
  vouchers.forEach((v) => {
    if (v.id && v.summer_voucher_serial_number) {
      serialNumberFixes.set(v.id, v.summer_voucher_serial_number);
    }
    if (v.id && v.target_group) {
      targetGroupFixes.set(v.id, v.target_group);
    }
  });
};

const restoreVoucherData = (
  v: VoucherData,
  requestVoucher?: VoucherData
): VoucherData => {
  const restoredSerialNumber =
    v.summer_voucher_serial_number ||
    requestVoucher?.summer_voucher_serial_number ||
    serialNumberFixes.get(v.id);
  const restoredTargetGroup =
    v.target_group ||
    requestVoucher?.target_group ||
    targetGroupFixes.get(v.id);

  if (v.id && restoredSerialNumber) {
    serialNumberFixes.set(v.id, restoredSerialNumber);
  }
  if (v.id && restoredTargetGroup) {
    targetGroupFixes.set(v.id, restoredTargetGroup);
  }

  return {
    ...v,
    summer_voucher_serial_number: restoredSerialNumber || '',
    target_group: restoredTargetGroup || '',
  };
};

const handleEmployerApplicationsPut = async (
  req: MockRequest,
  res: MockResponse
): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log('MOCK PUT employerapplications hit:', req.url);
  try {
    const body = JSON.parse(req.body.toString()) as {
      summer_vouchers?: VoucherData[];
    };

    cacheVoucherFixes(body.summer_vouchers);

    const response = await axios.put<{ summer_vouchers?: VoucherData[] }>(
      req.url,
      body,
      { headers: req.headers }
    );

    const responseBody = response.data;

    if (responseBody.summer_vouchers) {
      responseBody.summer_vouchers = responseBody.summer_vouchers.map((v, i) =>
        restoreVoucherData(v, body.summer_vouchers?.[i])
      );
    }

    res.headers = getTestCafeHeaders(response.headers);
    res.statusCode = response.status;
    res.setBody(responseBody as object);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // eslint-disable-next-line no-console
      console.error('Proxy PUT failed', error, error.response?.data);
      res.statusCode = error.response?.status || 500;
      res.setBody((error.response?.data as object) || {});
    } else {
      res.statusCode = 500;
    }
  }
};

const handleEmployerApplicationsGet = async (
  req: MockRequest,
  res: MockResponse
): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log('MOCK GET employerapplications hit:', req.url);
  try {
    const response = await axios.get<{ summer_vouchers?: VoucherData[] }>(
      req.url,
      { headers: req.headers }
    );

    const responseBody = response.data;

    if (responseBody.summer_vouchers) {
      responseBody.summer_vouchers = responseBody.summer_vouchers.map((v) =>
        restoreVoucherData(v)
      );
    }

    res.headers = getTestCafeHeaders(response.headers);
    res.statusCode = response.status;
    res.setBody(responseBody as object);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      // eslint-disable-next-line no-console
      console.error('Proxy GET failed', error, error.response?.data);
      res.statusCode = error.response?.status || 500;
      res.setBody((error.response?.data as object) || {});
    } else {
      res.statusCode = 500;
    }
  }
};

export const fetchEmployeeDataMock = RequestMock()
  .onRequestTo({ url: /fetch_employee_data/, method: 'POST' })
  .respond(handleFetchEmployeeData)
  .onRequestTo({
    url: /employerapplications\/[\da-f-]+\/$/,
    method: 'PUT',
  })
  .respond(handleEmployerApplicationsPut)
  .onRequestTo({
    url: /employerapplications\/[\da-f-]+\/$/,
    method: 'GET',
  })
  .respond(handleEmployerApplicationsGet);

// Proxy target_groups requests to the real backend
export const targetGroupsMock = RequestMock()
  .onRequestTo({
    url: /target_groups/,
    method: 'GET',
  })
  .respond(
    async (req: MockRequest, res: MockResponse) => {
      // eslint-disable-next-line no-console
      console.log('MOCK GET target_groups hit:', req.url);
      try {
        const response = await axios.get(req.url, {
          headers: req.headers,
        });
        res.headers = getTestCafeHeaders(response.headers);
        res.statusCode = response.status;
        res.setBody(response.data as object);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.error('Proxy GET target_groups failed', error);
          res.statusCode = error.response?.status || 500;
          res.setBody((error.response?.data as object) || {});
        } else {
          res.statusCode = 500;
        }
      }
    },
    200,
    { 'access-control-allow-origin': '*' }
  );

export const attachmentsMock = RequestMock()
  .onRequestTo({
    url: /attachments/,
    method: 'POST',
  })
  .respond(
    async (req: MockRequest, res: MockResponse) => {
      // eslint-disable-next-line no-console
      console.log('MOCK POST attachments hit:', req.url);
      try {
        // Proxy to real backend so attachments are actually stored
        const response = await axios.post(req.url, req.body, {
          headers: req.headers,
        });
        res.headers = getTestCafeHeaders(response.headers);
        res.statusCode = response.status;
        res.setBody(response.data as object);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          // eslint-disable-next-line no-console
          console.error('Proxy POST attachments failed', error);
          res.statusCode = error.response?.status || 500;
          res.setBody((error.response?.data as object) || {});
        } else {
          res.statusCode = 500;
        }
      }
    },
    201,
    { 'access-control-allow-origin': '*' }
  );
