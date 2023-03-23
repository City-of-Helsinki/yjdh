from enum import Enum


class AssociationNameTypeMap(Enum):
    NAME = "P"
    AUXILARY_NAME = "A"


class AssociationStatusMap(Enum):
    # Works also for AssociationNameStatus
    PENDING = "V"
    REGISTERED = "R"
    DISCONTINIUED = "L"


class AssociationNameLanguageMap(Enum):
    FINNISH = "FI"
    SWEDISH = "SE"
    ENGLISH = "EN"
