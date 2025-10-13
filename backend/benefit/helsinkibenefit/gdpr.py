def get_user(user):
    """
    Function used by the Helsinki Profile GDPR API to get the "user" instance from the
    "GDPR Model" instance. Since in our case the GDPR Model and the user are one and
    the same, we simply return the same User instance that is given as a parameter.

    :param user: the User instance whose GDPR data is being queried
    :return: the same User instance
    """
    return user


def deleter(obj, dry_run):
    """
    Simple deleter
    """
    obj.delete()
