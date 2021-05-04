from applications.models import Application, SummerVoucher


def update_summer_vouchers_using_api_data(
    summer_vouchers_data: list, instance: Application
) -> None:
    existing_summer_voucher_ids = []

    for summer_voucher_data in summer_vouchers_data:
        summer_voucher_id = summer_voucher_data.pop("id", None)
        if summer_voucher_id:
            # Update all SummerVouchers that had a provided id
            SummerVoucher.objects.filter(id=summer_voucher_id).update(
                **summer_voucher_data
            )
        else:
            # Create new SummerVouchers that did not provide an id
            summer_voucher = SummerVoucher.objects.create(
                application=instance, **summer_voucher_data
            )
            summer_voucher_id = summer_voucher.id
        existing_summer_voucher_ids.append(summer_voucher_id)

    # Delete all SummerVouchers that were not part of the provided ids
    SummerVoucher.objects.filter(application=instance).exclude(
        id__in=existing_summer_voucher_ids
    ).delete()
