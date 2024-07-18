class SaveAfterPostGenerationMixin:
    """
    Mixin for saving Django model instances after post-generation hooks.

    To use this derive the factory class that uses @factory.post_generation
    decorator from factory.django.DjangoModelFactory as well as this, e.g.
    class TestFactory(SaveAfterPostGenerationMixin, factory.django.DjangoModelFactory)

    NOTE: Needs to be before factory.django.DjangoModelFactory in the class
    definition to work, because of how Python resolves method resolution order (MRO).

    Rationale:
     - Because factory 3.3.0 has deprecated saving the instance after
       post-generation hooks, and will remove the functionality in the
       next major release.
    """

    @classmethod
    def _after_postgeneration(cls, instance, create, results=None):
        """Save again the instance if creating and at least one hook ran."""
        if create and results:
            # Some post-generation hooks ran, and may have modified us.
            instance.save()
