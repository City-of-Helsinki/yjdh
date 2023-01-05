from faker import Faker

_faker = Faker(locale="fi")


def get_faker():
    return _faker
