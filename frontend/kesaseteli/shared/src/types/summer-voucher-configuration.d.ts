type SummerVoucherConfiguration = {
  year: number;
  voucher_value_in_euros: number;
  min_work_compensation_in_euros: number;
  min_work_hours: number;
  target_group_name: string;
  target_group_description: Record<string, string>;
  target_group: string[];
};

export default SummerVoucherConfiguration;
