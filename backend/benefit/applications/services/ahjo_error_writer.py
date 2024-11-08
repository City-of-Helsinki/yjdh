from applications.models import Application


class AhjoErrorWriter:
    @staticmethod
    def write_error_to_ahjo_status(application: Application, error: str) -> None:
        latest_ahjo_status = application.ahjo_status.latest()
        latest_ahjo_status.error_from_ahjo = {
            "id": "NO_ID",
            "context": f"{error}",
            "message": "Ahjo-pyynnössä tapahtui virhe, mutta Ahjo ei palauttanut tarkempia tietoja.",
        }
        latest_ahjo_status.save()

    @staticmethod
    def write_to_validation_error(application: Application, error_message: str) -> None:
        """Write the error message to the Ahjo status of the application."""

        status = application.ahjo_status.latest()
        status.validation_error_from_ahjo = error_message
        status.save()
