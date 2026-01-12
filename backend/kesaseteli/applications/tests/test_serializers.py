import pytest
from django.utils import translation

from applications.api.v1.serializers import SummerVoucherConfigurationSerializer
from applications.target_groups import NinthGraderTargetGroup
from applications.tests.factories import SummerVoucherConfigurationFactory


@pytest.mark.django_db
def test_summer_voucher_configuration_serializer_target_group_description():
    # Arrange
    target_group_class = NinthGraderTargetGroup
    with translation.override("fi"):
        configuration = SummerVoucherConfigurationFactory(
            target_group=[target_group_class().identifier]
        )
        serializer = SummerVoucherConfigurationSerializer(configuration)

        # Act
        data = serializer.data

        # Assert
        target_group_name = str(target_group_class().name)
        target_group_description = str(target_group_class().description)

        assert "target_group_description" in data
        assert isinstance(data["target_group_description"], dict)
        assert (
            data["target_group_description"][target_group_name]
            == target_group_description
        )
