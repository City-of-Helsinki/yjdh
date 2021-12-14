// 10mb
export const ATTACHMENT_MAX_SIZE = 10_485_760;

export const ATTACHMENT_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'application/pdf',
] as const;

export const ATTACHMENT_TYPES = ['employment_contract', 'payslip'] as const;
