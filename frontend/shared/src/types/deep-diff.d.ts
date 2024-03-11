declare module 'deep-diff' {
  export type Difference = {
    lhs: string | number;
    rhs: string | number;
    path: string[];
  };

  export function deepDiff(
    lhs: Record<unknown, unknown>,
    rhs: Record<unknown, unknown>,
    prefilter?: (path: string[], key: string) => boolean
  ): Difference[];

  export default deepDiff;
}
