from copy import copy
from typing import Optional, Union

from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.db.models import Model
from django.db.models.base import ModelBase
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

    def permission_denied(self, request, message=None, code=None):
        audit_logging.log(
            self._get_actor(),
            self._get_operation(),
            self._get_target(),
            Status.FORBIDDEN,
            ip_address=self._get_ip_address(),
        )
        super().permission_denied(request, message, code)

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        audit_logging.log(
            self._get_actor(),
            Operation.READ,
            self._get_target(),
            ip_address=self._get_ip_address(),
        )
        return response

    def perform_create(self, serializer):
        super().perform_create(serializer)
        audit_logging.log(
            self._get_actor(),
            Operation.CREATE,
            serializer.instance,
            ip_address=self._get_ip_address(),
        )

    def perform_update(self, serializer):
        target_status_before = None
        target_status_after = None

        if hasattr(serializer.instance, "status"):
            target_status_before = serializer.instance.status
        super().perform_update(serializer)
        if hasattr(serializer.instance, "status"):
            target_status_after = serializer.instance.status

        audit_logging.log(
            self._get_actor(),
            Operation.UPDATE,
            serializer.instance,
            ip_address=self._get_ip_address(),
            target_status_before=target_status_before,
            target_status_after=target_status_after,
        )

    def perform_destroy(self, instance):
        actor = copy(self._get_actor())
        target = copy(instance)
        super().perform_destroy(instance)
        audit_logging.log(
            actor,
            Operation.DELETE,
            target,
            ip_address=self._get_ip_address(),
        )

    def _get_actor(self) -> Union[User, AnonymousUser]:
        return getattr(self.request.user, "profile", self.request.user)

    def _get_operation(self) -> Operation:
        return self.method_to_operation[self.request.method]

    def _get_target(self) -> Optional[Union[Model, ModelBase]]:
        target = None
        lookup_value = self.kwargs.get(self.lookup_field, None)
        if lookup_value is not None:
            target = self.queryset.model.objects.filter(
                **{self.lookup_field: lookup_value}
            ).first()
        return target or self.queryset.model

    def _get_ip_address(self) -> str:
        x_forwarded_for = self.request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0]
        else:
            ip = self.request.META.get("REMOTE_ADDR")
        return ip
