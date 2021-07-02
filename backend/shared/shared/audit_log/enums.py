from enum import Enum


class Operation(Enum):
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


class Role(Enum):
    OWNER = "OWNER"
    USER = "USER"
    SYSTEM = "SYSTEM"
    ANONYMOUS = "ANONYMOUS"


class Status(Enum):
    SUCCESS = "SUCCESS"
    FORBIDDEN = "FORBIDDEN"
