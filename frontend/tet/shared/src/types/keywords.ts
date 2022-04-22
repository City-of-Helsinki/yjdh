// Note: `export enum` inside a `.d.ts` file results in module not found error
export enum ClassificationType {
  WORKING_METHOD = 'WORKING_METHOD',
  WORKING_FEATURE = 'WORKING_FEATURE',
  KEYWORD = 'KEYWORD',
}

export type KeywordFn = (
  value: string,
  selector: '@id' | 'id'
) => ClassificationType;
