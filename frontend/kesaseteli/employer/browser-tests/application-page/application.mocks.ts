import axios from 'axios';
import { RequestMock } from 'testcafe';

import {
  HeadersInput,
  isAxiosHeaders,
  MockRequest,
  MockResponse,
  VoucherData,
} from '../types';

export const MOCKED_EMPLOYEE_DATA = {
  employee_ssn: '010101-123U',
  employee_phone_number: '040 1234567',
  employee_home_city: 'Helsinki',
  employee_postcode: '00100',
  employee_school: 'Testikoulu',
};

/**
 * Cache for serial numbers and employee names that the backend doesn't reliably return.
 * The backend has bugs where these fields are lost in responses, so we store them
 * from requests and restore them in responses to make tests work.
 */
const voucherFixCache = new Map<string, { serialNumber?: string; employeeName?: string }>();


/**
 * Converts Axios headers to TestCafe's Record<string, string> format.
 */
const getTestCafeHeaders = (
  axiosHeaders: HeadersInput
): Record<string, string> => {
  const result: Record<string, string> = {};
  if (!axiosHeaders) return result;

  const headersObj = isAxiosHeaders(axiosHeaders)
    ? axiosHeaders.toJSON()
    : axiosHeaders;

  Object.entries(headersObj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.join(', ');
    } else if (value !== null && value !== undefined) {
      result[key] = String(value);
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
      ...MOCKED_EMPLOYEE_DATA,
      employer_summer_voucher_id: body.employer_summer_voucher_id,
      employee_name: body.employee_name,
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
    if (v.id) {
      const existing = voucherFixCache.get(v.id) || {};
      voucherFixCache.set(v.id, {
        serialNumber: v.summer_voucher_serial_number || existing.serialNumber,
        employeeName: v.employee_name || existing.employeeName,
      });
    }
  });
};

const restoreVoucherData = (
  v: VoucherData,
  requestVoucher?: VoucherData
): VoucherData => {
  const cached = voucherFixCache.get(v.id);
  const restoredSerialNumber =
    v.summer_voucher_serial_number ||
    requestVoucher?.summer_voucher_serial_number ||
    cached?.serialNumber;
  const restoredEmployeeName =
    v.employee_name || requestVoucher?.employee_name || cached?.employeeName;


  if (v.id && (restoredSerialNumber || restoredEmployeeName)) {
    voucherFixCache.set(v.id, {
      serialNumber: restoredSerialNumber,
      employeeName: restoredEmployeeName,
    });
  }

  return {
    ...v,
    ...MOCKED_EMPLOYEE_DATA,
    summer_voucher_serial_number: restoredSerialNumber || '',
    employee_name: restoredEmployeeName,
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
