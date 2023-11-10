from dateutil.parser import parse
from django import template

register = template.Library()


@register.filter(name="date_fi")
def date_fi(value):
    if value is None:
        return ""
    date = parse(f"{value}")
    return date.strftime("%-d.%-m.%Y")


@register.filter
def dot_to_comma(value):
    if str(value):
        return str(value).replace(".", ",")
    return value


@register.filter(name="to_euro")
def to_euro(value):
    comma_value = dot_to_comma(value)
    return f"{comma_value} €"


@register.filter(name="iban")
def iban(value, n=4):
    def split_at(w, n):
        for i in range(0, len(w), n):
            yield w[i : i + n]

    return " ".join(split_at(value, n))
