import Application from 'shared/types/application';
import Employment from 'shared/types/employment';

export type HandlerSummerVoucher = Employment & {
  youth_application_id?: string;
};

// Note: HandlerEmployerApplication is the detail/serializer-shaped type extending Application
// with invoicer fields and created_at. Contrast with EmployerApplication (in application.ts),
// which is the list-shaped type containing submitted_at.
type HandlerEmployerApplication = Omit<Application, 'summer_vouchers'> & {
  is_separate_invoicer: boolean;
  invoicer_name: string;
  invoicer_email: string;
  invoicer_phone_number: string;
  created_at: string;
  summer_vouchers: HandlerSummerVoucher[];
};

export default HandlerEmployerApplication;
