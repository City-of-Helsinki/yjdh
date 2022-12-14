from contextlib import contextmanager
from copy import copy
from typing import Optional, Union

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db import transaction
from django.db.models import Model
from django.db.models.base import ModelBase
from django.http import Http404
from rest_framework.exceptions import NotAuthenticated, PermissionDenied
from rest_framework.viewsets import ModelViewSet

from shared.audit_log import audit_logging
from shared.audit_log.enums import Operation, Status

User = get_user_model()


class AuditLoggingModelViewSet(ModelViewSet):
    method_to_operation = {
        "POST": Operation.CREATE,
        "GET": Operation.READ,
        "PUT": Operation.UPDATE,
        "PATCH": Operation.UPDATE,
        "DELETE": Operation.DELETE,
    }
    created_instance: Optional[Model] = None

    def permission_denied(self, request, message=None, code=None):
        self._log_permission_denied()
        super().permission_denied(request, message, code)

    def _log_permission_denied(self):
        audit_logging.log(
            self._get_actor(),
            self._get_actor_backend(),
            self._get_operation(),
            self._get_target(),
            Status.FORBIDDEN,
            ip_address=self._get_ip_address(),
        )

    def update(self, request, *args, **kwargs):
        # Handle updates and treat 404 errors as permission denied errors, if
        # the target object actually exists
        try:
            return super().update(request, *args, **kwargs)
        except Http404:
            if self._get_target_object():
                # _get_target_object() performs the lookup using the unfiltered queryset.
                # Here we'll assume that the queryset was limited based on user's
                # permissions. Since the object exists, the 404 actually indicates
                # an attempt to access something they don't have permission to.
                self._log_permission_denied()
            raise

    def retrieve(self, request, *args, **kwargs):
        with self.record_action():
            return super().retrieve(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        with self.record_action():
            return super().list(request, *args, **kwargs)

    @transaction.atomic
    def perform_create(self, serializer):
        with self.record_action():
            super().perform_create(serializer)
            self.created_instance = serializer.instance

    @transaction.atomic
    def perform_update(self, serializer):
        with self.record_action():
            super().perform_update(serializer)

    @transaction.atomic
    def perform_destroy(self, instance):
        target = copy(instance)  # Will be destroyed, so we must save it
        with self.record_action(target=target):
            super().perform_destroy(instance)

    @contextmanager
    def record_action(
        self, target: Optional[Model] = None, additional_information: str = ""
    ):
        """
        This context manager will run the managed code in a transaction and writes
        a new audit log entry in the same transaction. If an exception is raised,
        the transaction will be rolled back. If the user has no permission to perform
        the given action, a "FORBIDDEN" audit log event will be recorded.
        """
        actor = copy(self._get_actor())  # May be destroyed if actor is also the target
        actor_backend = self._get_actor_backend()
        operation = self._get_operation()
        try:
            with transaction.atomic():
                yield
                audit_logging.log(
                    actor,
                    actor_backend,
                    operation,
                    target or self._get_target(),
                    ip_address=self._get_ip_address(),
                    additional_information=additional_information,
                )
        except (NotAuthenticated, PermissionDenied):
            audit_logging.log(
                actor,
                actor_backend,
                operation,
                target or self._get_target(),
                Status.FORBIDDEN,
                ip_address=self._get_ip_address(),
                additional_information=additional_information,
            )
            raise

    def _get_actor(self) -> Union[User, AnonymousUser]:
        return getattr(self.request.user, "profile", self.request.user)

    def _get_actor_backend(self) -> str:
        return self.request.session.get("_auth_user_backend", "")

    def _get_operation(self) -> Operation:
        return self.method_to_operation.get(self.request.method, Operation.READ)

    def _get_target(self) -> Optional[Union[Model, ModelBase]]:
        return (
            self._get_target_object()
            or self.created_instance
            or self._unfiltered_queryset().model
        )

    def _get_target_object(self):
        lookup_value = self.kwargs.get(self.lookup_field, None)
        if lookup_value is not None:
            return (
                self._unfiltered_queryset()
                .filter(**{self.lookup_field: lookup_value})
                .first()
            )
        else:
            return None

    def _unfiltered_queryset(self):
        return self.get_queryset().model.objects.all()

    def _get_ip_address(self) -> str:
        x_forwarded_for = self.request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = self.request.META.get("REMOTE_ADDR")
        return ip
