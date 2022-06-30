import logging
from datetime import datetime, timedelta

from django_extensions.management.jobs import HourlyJob

from events.linkedevents import LinkedEventsClient

logger = logging.getLogger(__name__)


def flatten(t):
    return [item for sublist in t for item in sublist]


# python manage.py runjobs hourly


class Job(HourlyJob):
    help = "Remove unused images from Linked Events tet data source"

    def execute(self):
        client = LinkedEventsClient()

        logger.info("Fetching all images and events under data source tet")

        # Currently this removes includes past events as well
        # but if past event handling is changed, their images might be removed
        events = client.list_ongoing_events_authenticated()
        event_images = [
            image["@id"] for image in flatten([e["images"] for e in events])
        ]

        for images in client.get_images():
            logger.warning(f"got {len(images)} images")
            for image in images:
                created_time = datetime.strptime(
                    image["created_time"], "%Y-%m-%dT%H:%M:%S.%fZ"
                )
                age = datetime.utcnow() - created_time

                # Skipping images that were created less than an hour ago
                # lest we delete images before the user has saved the TET posting
                image_is_old_enough = age > timedelta(hours=1)
                logger.debug(
                    f"{image['id']} age {age} is old enough: {image_is_old_enough}"
                )

                if image_is_old_enough and image["@id"] not in event_images:
                    status_code = client.delete_image(image["id"])
                    if 200 < status_code < 300:
                        logger.info(f"image id {image['id']} deleted")
                    else:
                        logger.warning(
                            f"deleting image id {image['id']} failed with status code {status_code}"
                        )
