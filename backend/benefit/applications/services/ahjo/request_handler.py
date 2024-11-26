from typing import List, Union

from applications.enums import AhjoRequestType
from applications.services.ahjo.enums import AhjoSettingName
from applications.services.ahjo.setting_response_handler import AhjoResponseHandler
from applications.services.ahjo_authentication import AhjoToken
from applications.services.ahjo_client import (
    AhjoApiClient,
    AhjoDecisionMakerRequest,
    AhjoRequest,
    AhjoSignerRequest,
)


class AhjoRequestHandler:
    def __init__(self, ahjo_token: AhjoToken, ahjo_request_type: AhjoRequest):
        self.ahjo_token = ahjo_token
        self.ahjo_request_type = ahjo_request_type

    def handle_request_without_application(self):
        if self.ahjo_request_type == AhjoRequestType.GET_DECISION_MAKER:
            self.get_setting_from_ahjo(
                request_class=AhjoDecisionMakerRequest,
                setting_name=AhjoSettingName.DECISION_MAKER,
            )
        if self.ahjo_request_type == AhjoRequestType.GET_SIGNER:
            self.get_setting_from_ahjo(
                request_class=AhjoSignerRequest,
                setting_name=AhjoSettingName.SIGNER,
            )

    def get_setting_from_ahjo(
        self, request_class: AhjoRequest, setting_name: AhjoSettingName
    ) -> Union[List, None]:
        ahjo_client = AhjoApiClient(self.ahjo_token, request_class())
        _, result = ahjo_client.send_request_to_ahjo()
        AhjoResponseHandler.handle_ahjo_query_response(
            setting_name=setting_name, data=result
        )
