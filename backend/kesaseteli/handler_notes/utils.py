from django.apps import apps
from django.contrib.contenttypes.fields import GenericRelation

from handler_notes.models import Note


def get_note_target_models() -> list:
    """
    Returns a list of model classes that have a GenericRelation to Note.
    """
    return [
        model
        for model in apps.get_models()
        for field in model._meta.private_fields
        if isinstance(field, GenericRelation) and field.related_model == Note
    ]


def get_note_target_model_names() -> list[str]:
    """
    Returns a list of model names (lowercased) that have a GenericRelation to Note.
    """
    return [model._meta.model_name for model in get_note_target_models()]


def get_note_target_model(model_name: str):
    """
    Finds and returns the model class matching `model_name` (case-insensitive)
    if it has a GenericRelation to Note. Returns None otherwise.
    """
    if not model_name:
        return None

    model_name_lower = model_name.lower()
    for model in get_note_target_models():
        if model._meta.model_name == model_name_lower:
            return model

    return None
