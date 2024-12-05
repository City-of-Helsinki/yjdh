from dataclasses import dataclass

from applications.models import Application


@dataclass
class AhjoFormattedError:
    application: Application
    context: str = ""
    error_id: str = "NO_ID"
    message_to_handler: str = (
        "Ahjo-pyynnössä tapahtui virhe, mutta tarkempia tietoja virheestä ei saatu."
    )


class AhjoErrorWriter:
    @staticmethod
    def write_error_to_ahjo_status(formatted_error: AhjoFormattedError) -> None:
        latest_ahjo_status = formatted_error.application.ahjo_status.latest()

        latest_ahjo_status.error_from_ahjo = {
            "id": formatted_error.error_id,
            "context": formatted_error.context,
            "message": formatted_error.message_to_handler,
        }
        latest_ahjo_status.save()

    @staticmethod
    def write_to_validation_error(formatted_error: AhjoFormattedError) -> None:
        """Write the error message to the Ahjo status of the application."""

        status = formatted_error.application.ahjo_status.latest()

        status.validation_error_from_ahjo = {
            "id": formatted_error.error_id,
            "context": formatted_error.context,
            "message": formatted_error.message_to_handler,
        }
        status.save()
