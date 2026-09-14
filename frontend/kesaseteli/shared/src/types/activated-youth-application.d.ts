import AdditionalInfoApplication from './additional-info-application';
import CreatedYouthApplication from './created-youth-application';
import VtjData from './vtj-data';
import type { KesaseteliAttachment } from './attachment';

export type LinkedEmployerApplication = {
  id: string;
  company_name: string;
  company_business_id: string;
  summer_voucher_serial_number: string;
  submitted_at: string;
};

type ActivatedYouthApplication = CreatedYouthApplication &
  Partial<AdditionalInfoApplication> & {
    receipt_confirmed_at: string | null;
    additional_info_provided_at?: string;
    encrypted_handler_vtj_json: VtjData;
    is_vtj_data_restricted?: boolean;
    employer_applications?: LinkedEmployerApplication[];
    attachments?: KesaseteliAttachment[];
  };

export default ActivatedYouthApplication;
