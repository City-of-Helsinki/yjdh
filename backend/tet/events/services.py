from events.linkedevents import LinkedEventsClient


client = LinkedEventsClient()


def list_job_postings_for_user(user):
    events = client.list_ongoing_events_authenticated()
    return events


# not MVP?
def list_ended_job_postings_for_user(user):
    return []


def get_job_posting(user, id):
    return {}


def add_job_posting(user, posting):
    pass


def publish_job_posting(user, posting):
    pass


def update_job_posting(user, posting):
    pass


def delete_job_posting(user, posting):
    pass


def search_job_postings(q):
    pass

