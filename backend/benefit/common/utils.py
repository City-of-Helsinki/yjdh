from phonenumber_field.serializerfields import (
    PhoneNumberField as DefaultPhoneNumberField,
)


def update_object(obj, data):
    if not data:
        return
    for k, v in data.items():
        if v is None and not obj.__class__._meta.get_field(k).null:
            raise ValueError(f"{k} cannot be null.")
        setattr(obj, k, v)
    obj.save()


def xgroup(iter, n=2, check_length=False):
    """
    adapted from: comp.lang.python Thu Jun 5 22:58:05 CEST 2003

    >>> list(xgroup(range(9), 3))
    [(0, 1, 2), (3, 4, 5), (6, 7, 8)]
    """
    if check_length:
        num = len(iter)
        assert num % n == 0, "Length does not match"
    last = []
    for elt in iter:
        last.append(elt)
        if len(last) == n:
            yield tuple(last)
            last = []


class PhoneNumberField(DefaultPhoneNumberField):
    def to_representation(self, value):
        if not value:
            return ""
        return "0{}".format(value.national_number)
