// TestCafe doesn't always export these directly, so we define them if needed
// or cast them from the respond callback arguments.
// There are problems e.g with linting phase (eslint).
export type MockRequest = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: Buffer | string;
};

export type MockResponse = {
  headers: Record<string, string>;
  statusCode: number;
  setBody: (body: string | object | Buffer) => void;
};

export type HeadersInput =
  | Record<string, unknown>
  | { toJSON(): Record<string, unknown> };

export const isAxiosHeaders = (
  headers: HeadersInput
): headers is { toJSON(): Record<string, unknown> } =>
  Boolean(
    headers &&
    typeof headers === 'object' &&
    'toJSON' in headers &&
    typeof (headers as { toJSON: () => Record<string, unknown> }).toJSON ===
    'function'
  );

export type VoucherData = {
  id: string;
  summer_voucher_serial_number?: string;
  target_group?: string;
  employee_name?: string;
  employee_ssn: string;
  employee_phone_number: string;
  employee_home_city: string;
  employee_postcode: string;
  employee_school: string;
};
