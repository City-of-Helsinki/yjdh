import logging
from typing import Dict, List, Union

from django.core.exceptions import ValidationError

from applications.models import AhjoSetting
from applications.services.ahjo.enums import AhjoSettingName

LOGGER = logging.getLogger(__name__)


class AhjoResponseHandler:
    @staticmethod
    def handle_ahjo_query_response(
        setting_name: AhjoSettingName, data: Union[None, dict]
    ) -> None:
        """
        Handle the decision maker response from Ahjo API.

        Args:
            response: Variable that is either None or the JSON response data

        Raises:
            ValueError: If response data is invalid
            ValidationError: If data validation fails
        """

        if not data:
            raise ValueError(
                f"Failed to process Ahjo API response for setting {setting_name}, no data received from Ahjo."
            )

        try:
            # Validate response structure
            if not isinstance(data, dict):
                raise ValidationError(
                    f"Invalid response format for setting {setting_name}: expected dictionary"
                )
            if setting_name == AhjoSettingName.DECISION_MAKER:
                filtered_data = AhjoResponseHandler.filter_decision_makers(data)
            if setting_name == AhjoSettingName.SIGNER:
                filtered_data = AhjoResponseHandler.filter_signers(data)

            if not filtered_data:
                LOGGER.warning("No valid decision makers found in response")
                return

            # Store the filtered data
            AhjoResponseHandler._save_ahjo_setting(
                setting_name=setting_name, filtered_data=filtered_data
            )

            LOGGER.info(f"Successfully processed {len(filtered_data)} decision makers")

        except Exception as e:
            LOGGER.error(
                f"Failed to process Ahjo api response for setting {setting_name}: {str(e)}",
                exc_info=True,
            )
            raise

    @staticmethod
    def filter_decision_makers(data: Dict) -> List[Dict[str, str]]:
        """
        Filter the decision makers Name and ID from the Ahjo response.

        Args:
            data: Response data dictionary

        Returns:
            List of filtered decision maker dictionaries

        Raises:
            ValidationError: If required fields are missing
        """
        try:
            # Validate required field exists
            if "decisionMakers" not in data:
                raise ValidationError("Missing decisionMakers field in response")

            result = []
            for item in data["decisionMakers"]:
                try:
                    organization = item.get("Organization", {})

                    # Skip if not a decision maker
                    if not organization.get("IsDecisionMaker"):
                        continue

                    # Validate required fields
                    name = organization.get("Name")
                    org_id = organization.get("ID")

                    if not all([name, org_id]):
                        LOGGER.warning(
                            f"Missing required fields for organization: {organization}"
                        )
                        continue

                    result.append({"Name": name, "ID": org_id})

                except Exception as e:
                    LOGGER.warning(f"Failed to process decision maker: {str(e)}")
                    continue

            return result

        except Exception as e:
            LOGGER.error(f"Error filtering decision makers: {str(e)}")
            raise ValidationError(f"Failed to filter decision makers: {str(e)}")

    @staticmethod
    def _save_ahjo_setting(
        setting_name: AhjoSettingName, filtered_data: List[Dict[str, str]]
    ) -> None:
        """
        Save an ahjo setting to database.

        Args:
            filtered_data: List of filtered setting data dictionaries

        Raises:
            ValidationError: If database operation fails
        """
        try:
            AhjoSetting.objects.update_or_create(
                name=setting_name, defaults={"data": filtered_data}
            )
        except Exception as e:
            LOGGER.error(f"Failed to save setting {setting_name}: {str(e)}")
            raise ValidationError(
                f"Failed to save setting {setting_name} to database: {str(e)}"
            )

    @staticmethod
    def filter_signers(data: Dict) -> List[Dict[str, str]]:
        """
        Filter the signers Name and ID from the Ahjo response.

        Args:
            data: Response data dictionary

        Returns:
            List of filtered signer dictionaries

        Raises:
            ValidationError: If required fields are missing
        """
        result = []
        for item in data["agentList"]:
            result.append({"ID": item["ID"], "Name": item["Name"]})
        return result

