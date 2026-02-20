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
