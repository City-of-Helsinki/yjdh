from applications.enums import AhjoRequestType
from applications.management.commands.ahjo_base_command import AhjoRequestBaseClass


class Command(AhjoRequestBaseClass):
    help = (
        "Get the decision maker from Ahjo and store it in the database in Ahjo settings"
    )
    request_type = AhjoRequestType.GET_SIGNER
