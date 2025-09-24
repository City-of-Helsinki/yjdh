from shared.common.tests.factories import StaffUserFactory


class BFHandlerUserFactory(StaffUserFactory):
    """
    Handlers are users with `is_staff=True`.
    Overrided just for clear naming.
    """
