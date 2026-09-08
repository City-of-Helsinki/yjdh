export const assertUnreachable = (param: never, message?: string): never => {
  throw new Error(`${message || 'Unknown parameter'}: ${param as string}`);
};
