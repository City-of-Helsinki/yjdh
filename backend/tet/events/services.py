from events.linkedevents import LinkedEventsClient
from events.transformations import event_to_job_posting, enrich_create_event, reduce_get_event


client = LinkedEventsClient()


def list_job_postings_for_user(user):
    events = client.list_ongoing_events_authenticated()
    # TODO what happens if an event cannot be transformed into posting?
    # We should expect this can happen, so probably we should disregard that particular event
    # But how can we monitor these?
    job_postings = [event_to_job_posting(e) for e in events]
    # TODO group by status?
    return job_postings


# not MVP?
def list_ended_job_postings_for_user(user):
    return []


def get_job_posting(user, id):
    return {}


def add_tet_event(validated_data, user):
    event = enrich_create_event(validated_data, "ahjo:00001", user.email)
    created_event = client.create_event(event)
    return reduce_get_event(created_event)


def publish_job_posting(user, posting):
    pass


def update_job_posting(user, posting):
    pass


def delete_job_posting(user, posting):
    pass


def search_job_postings(q):
    pass

