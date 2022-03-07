class LockForUpdateMixin:
    def lock_for_update(self, *args, **kwargs):
        """
        Lock current model instance for update using select_for_update

        :param args: Optional positional arguments to select_for_update function
        :param kwargs: Optional keyword arguments to select_for_update function
        :return: The locked model instance
        """
        return self.__class__.objects.select_for_update(*args, **kwargs).get(pk=self.pk)
