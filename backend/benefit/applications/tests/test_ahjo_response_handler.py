from applications.services.ahjo_integration import AhjoResponseHandler


def test_ahjo_response_handler_filter_decision_makers(decisionmaker_response):
    result = AhjoResponseHandler.filter_decision_makers(decisionmaker_response[1])
    assert len(result) == 2
    assert result == [
        {
            "Name": decisionmaker_response[1]["decisionMakers"][0]["Organization"][
                "Name"
            ],
            "ID": decisionmaker_response[1]["decisionMakers"][0]["Organization"]["ID"],
        },
        {
            "Name": decisionmaker_response[1]["decisionMakers"][1]["Organization"][
                "Name"
            ],
            "ID": decisionmaker_response[1]["decisionMakers"][1]["Organization"]["ID"],
        },
    ]
