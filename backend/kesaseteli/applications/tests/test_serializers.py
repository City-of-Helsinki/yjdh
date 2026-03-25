import pytest
from django.utils import translation

from applications.api.v1.serializers import SummerVoucherConfigurationSerializer
from applications.target_groups import NinthGraderTargetGroup
from applications.tests.factories import SummerVoucherConfigurationFactory


@pytest.mark.django_db
def test_summer_voucher_configuration_serializer_target_groups():
    # Arrange
    target_group_class = NinthGraderTargetGroup
    with translation.override("fi"):
        configuration = SummerVoucherConfigurationFactory(
            target_group=[target_group_class().identifier]
        )
        serializer = SummerVoucherConfigurationSerializer(configuration)
        data = serializer.data

        assert "target_groups" in data
        assert len(data["target_groups"]) == 1
        tg_data = data["target_groups"][0]
        assert tg_data["id"] == target_group_class().identifier
        assert tg_data["name"] == str(target_group_class().name)
        assert tg_data["description"] == str(target_group_class().description)
