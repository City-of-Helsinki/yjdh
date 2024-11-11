from django.shortcuts import get_object_or_404
from rest_framework import generics

from applications.api.v1.serializers.ahjo_setting import AhjoSettingSerializer
from applications.models import AhjoSetting
from common.permissions import BFIsHandler


class AhjoSettingDetailView(generics.RetrieveAPIView):
    permission_classes = [BFIsHandler]
    serializer_class = AhjoSettingSerializer

    def get_object(self):
        name = self.kwargs.get("name")
        queryset = AhjoSetting.objects.all()
        setting = get_object_or_404(queryset, name=name)
        return setting
