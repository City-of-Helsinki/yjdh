def _new_from(object, keys):
    new = {}
    for key in keys:
        new[key] = object[key]
    return new

def event_to_job_posting(event):
    """Transform event into job posting

    
    """
    posting = _new_from(event, ('id', 'name'))
    return posting

def job_posting_to_event(posting):
    return {}
