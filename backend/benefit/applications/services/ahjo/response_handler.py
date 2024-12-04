import logging
import re
from datetime import datetime
from typing import Dict, List, Union

from django.conf import settings
from django.core.exceptions import ValidationError

from applications.enums import (
    AhjoDecisionDetails,
    AhjoStatus as AhjoStatusEnum,
    ApplicationBatchStatus,
    ApplicationStatus,
)
from applications.models import AhjoSetting, AhjoStatus, Application
from applications.services.ahjo.enums import AhjoSettingName
from applications.services.ahjo.exceptions import (
    AhjoDecisionDetailsParsingError,
    AhjoDecisionError,
)
from calculator.enums import InstalmentStatus
from calculator.models import Instalment

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


class AhjoDecisionDetailsResponseHandler:
    def handle_details_request_success(
        self, application: Application, response_dict: Dict
    ) -> str:
        """
        Extract the details from the dict and update the application batchwith the data.
        and data from the the p2p settings from ahjo_settings table"""

        details = self._parse_details_from_decision_response(response_dict)

        batch_status_to_update = ApplicationBatchStatus.DECIDED_ACCEPTED
        if application.status == ApplicationStatus.REJECTED:
            batch_status_to_update = ApplicationBatchStatus.DECIDED_REJECTED

        batch = application.batch
        batch.update_batch_after_details_request(batch_status_to_update, details)

        if (
            settings.PAYMENT_INSTALMENTS_ENABLED
            and application.status == ApplicationStatus.ACCEPTED
        ):
            self._update_instalments_as_accepted(application)

        AhjoStatus.objects.create(
            application=application, status=AhjoStatusEnum.DETAILS_RECEIVED_FROM_AHJO
        )

        return f"Successfully received and updated decision details \
for application {application.id} and batch {batch.id} from Ahjo"

    def _update_instalments_as_accepted(self, application: Application):
        calculation = application.calculation
        instalments = Instalment.objects.filter(
            calculation=calculation, status=InstalmentStatus.WAITING
        )
        if instalments.exists():
            instalments.update(status=InstalmentStatus.ACCEPTED)

    def _parse_details_from_decision_response(
        self, decision_data: Dict
    ) -> AhjoDecisionDetails:
        """Extract the decision details from the given decision data"""
        try:
            html_content = decision_data["Content"]
            decision_maker_name = self._parse_decision_maker_from_html(html_content)
            decision_maker_title = decision_data["Organization"]["Name"]
            section_of_the_law = decision_data["Section"]
            decision_date_str = decision_data["DateDecision"]
            decision_date = datetime.strptime(decision_date_str, "%Y-%m-%dT%H:%M:%S.%f")

            return AhjoDecisionDetails(
                decision_maker_name=decision_maker_name,
                decision_maker_title=decision_maker_title,
                section_of_the_law=f"{section_of_the_law} §",
                decision_date=decision_date,
            )
        except KeyError as e:
            raise AhjoDecisionDetailsParsingError(
                f"Error in parsing decision details: {e}"
            )
        except ValueError as e:
            raise AhjoDecisionDetailsParsingError(
                f"Error in parsing decision details date: {e}"
            )

    def _parse_decision_maker_from_html(self, html_content: str) -> str:
        """Parse the decision maker from the given html string"""
        match = re.search(
            r'<div class="Puheenjohtajanimi">([^<]+)</div>', html_content, re.I
        )
        if match:
            return match.group(1)
        else:
            raise AhjoDecisionError(
                "Decision maker not found in the decision content html", html_content
            )
