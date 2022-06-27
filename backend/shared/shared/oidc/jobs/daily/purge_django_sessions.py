<<<<<<< HEAD
<<<<<<< HEAD
from django.core import management
from django_extensions.management.jobs import DailyJob
=======
from django_extensions.management.jobs import DailyJob
from django.core import management

<<<<<<< HEAD
from applications.models import Attachment
>>>>>>> ebfd08e2 (FIX move stale session data purging under shared.oidc so that it will be available to all YJDH services)

=======
>>>>>>> 78c324b9 (FIX remove unused imports)
=======
from django_extensions.management.jobs import DailyJob
from django.core import management

>>>>>>> 748ab5133845f50888ec860d7a1392382c6b4106

class Job(DailyJob):
    help = "Purge expired Django sessions by running clearsessions management command."

    def execute(self):
        management.call_command("clearsessions", verbosity=0)
