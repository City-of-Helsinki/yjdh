import type { EmployerApplicationStatus } from 'kesaseteli-shared/constants/employer-application-status';
import Application from 'shared/types/application';
import Employment from 'shared/types/employment';

import { KesaseteliAttachment } from 'shared/types/attachment';

export type HandlerAttachment = KesaseteliAttachment & {
  author_name?: string;
};

export type HandlerSummerVoucher = Omit<Employment, 'attachments'> & {
  youth_application_id?: string;
  attachments: HandlerAttachment[];
};

// Note: HandlerEmployerApplication is the detail/serializer-shaped type extending Application
// with invoicer fields and created_at. Contrast with EmployerApplication (in application.ts),
// which is the list-shaped type containing submitted_at.
type HandlerEmployerApplication = Omit<
  Application,
  'summer_vouchers' | 'status'
> & {
  status: EmployerApplicationStatus;
  is_separate_invoicer: boolean;
  invoicer_name: string;
  invoicer_email: string;
  invoicer_phone_number: string;
  created_at: string;
  summer_vouchers: HandlerSummerVoucher[];
};

export default HandlerEmployerApplication;
