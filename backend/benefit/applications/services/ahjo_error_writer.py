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
