type TetPosting = {
  id?: string;
  title: string;
  description: string;
  // TODO react-hook-forms gets this as a string from `NumberInput`
  // but NumberInput expects it as a number
  contact_first_name: string;
  contact_last_name: string;
  contact_phone: string;
  contact_email: string;
  contact_language: string;
  spots: number;
  start_date: string;
  end_date?: string;
};

export default TetPosting;
