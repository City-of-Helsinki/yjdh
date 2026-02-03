"""
Dataclasses representing the company data structure returned by the YTJ V3 API.
Includes logic for parsing the API response and extracting preferred fields
(e.g., Finnish names/addresses).

Full API documentation: https://avoindata.prh.fi/fi/ytj/swagger-ui
Local Schema Reference: ytj_schema.yaml (OpenAPI 3.0)
"""

# flake8: noqa: N815
from dataclasses import dataclass, field
from enum import IntEnum, StrEnum
from typing import List, Optional

from shared.ytj.exceptions import YTJParseError


class YTJLanguageCode(StrEnum):
    FI = "1"
    SV = "2"
    EN = "3"


class YTJNameType(StrEnum):
    MAIN_NAME = "1"


class YTJAddressType(IntEnum):
    VISITING_ADDRESS = 1
    POSTAL_ADDRESS = 2


@dataclass
class YTJDescription:
    """Description object with language code."""

    languageCode: str
    description: str


@dataclass
class YTJName:
    """Company name details."""

    name: str
    type: str
    registrationDate: Optional[str] = None
    version: Optional[int] = None
    source: Optional[str] = None
    endDate: Optional[str] = None


@dataclass
class YTJBusinessId:
    """Business ID details."""

    value: str
    registrationDate: Optional[str] = None
    source: Optional[str] = None


@dataclass
class YTJCompanyForm:
    """Company form (legal entity type) details."""

    type: Optional[str] = None
    version: Optional[int] = None
    source: Optional[str] = None
    registrationDate: Optional[str] = None
    endDate: Optional[str] = None
    descriptions: List[YTJDescription] = field(default_factory=list)


@dataclass
class YTJPostOffice:
    """Post office details including city name."""

    city: str
    languageCode: Optional[str] = None
    municipalityCode: Optional[str] = None


@dataclass
class YTJAddress:
    """Address details."""

    type: int
    registrationDate: Optional[str] = None
    source: Optional[str] = None
    street: Optional[str] = None
    postCode: Optional[str] = None
    postOffices: List[YTJPostOffice] = field(default_factory=list)
    buildingNumber: Optional[str] = None
    entrance: Optional[str] = None
    apartmentNumber: Optional[str] = None
    apartmentIdSuffix: Optional[str] = None
    co: Optional[str] = None
    postOfficeBox: Optional[str] = None
    country: Optional[str] = None
    freeAddressLine: Optional[str] = None


@dataclass
class YTJBusinessLine:
    """Main business line (industry) details."""

    source: Optional[str] = None
    registrationDate: Optional[str] = None
    type: Optional[str] = None
    descriptions: List[YTJDescription] = field(default_factory=list)
    typeCodeSet: Optional[str] = None


@dataclass
class YTJRegisteredEntry:
    """Registered entry details."""

    type: str
    register: str
    authority: str
    registrationDate: Optional[str] = None
    endDate: Optional[str] = None
    descriptions: List[YTJDescription] = field(default_factory=list)


def _parse_descriptions(d_list: list) -> List[YTJDescription]:
    return [YTJDescription(**d) for d in d_list] if d_list else []


def _parse_company_forms(data: list) -> List[YTJCompanyForm]:
    company_forms = []
    for cf in data:
        # Create a copy to avoid mutating original dict if reused
        cf = cf.copy()
        desc = _parse_descriptions(cf.pop("descriptions", []))
        company_forms.append(YTJCompanyForm(descriptions=desc, **cf))
    return company_forms


def _parse_addresses(data: list) -> List[YTJAddress]:
    addresses = []
    for addr in data:
        addr = addr.copy()
        po_list = [YTJPostOffice(**po) for po in addr.pop("postOffices", [])]

        # Safe unpacking helper
        known_fields = {
            "type",
            "registrationDate",
            "source",
            "street",
            "postCode",
            "buildingNumber",
            "entrance",
            "apartmentNumber",
            "apartmentIdSuffix",
            "co",
            "postOfficeBox",
            "country",
            "freeAddressLine",
        }
        addr_data = {k: v for k, v in addr.items() if k in known_fields}

        addresses.append(YTJAddress(postOffices=po_list, **addr_data))
    return addresses


def _parse_registered_entries(data: list) -> List[YTJRegisteredEntry]:
    registered_entries = []
    for re in data:
        re = re.copy()
        desc = _parse_descriptions(re.pop("descriptions", []))
        registered_entries.append(YTJRegisteredEntry(descriptions=desc, **re))
    return registered_entries


def _parse_main_business_line(data: dict) -> Optional[YTJBusinessLine]:
    if not data:
        return None
    data = data.copy()
    desc = _parse_descriptions(data.pop("descriptions", []))

    # Whitelist fields for BusinessLine to prevent TypeError from undocumented API
    # fields
    known_fields = {"source", "registrationDate", "type", "typeCodeSet"}
    line_data = {k: v for k, v in data.items() if k in known_fields}

    return YTJBusinessLine(descriptions=desc, **line_data)


@dataclass
class YTJCompany:
    """
    Root object for a company in the YTJ API response.
    Contains methods to parse JSON and properties to extract preferred display values.
    """

    businessId: YTJBusinessId
    names: List[YTJName] = field(default_factory=list)
    addresses: List[YTJAddress] = field(default_factory=list)
    companyForms: List[YTJCompanyForm] = field(default_factory=list)
    mainBusinessLine: Optional[YTJBusinessLine] = None
    # Add other fields as optional if needed (euId, website, etc)
    euId: Optional[dict] = None
    website: Optional[dict] = None
    companySituations: List[dict] = field(default_factory=list)
    registeredEntries: List[YTJRegisteredEntry] = field(default_factory=list)
    tradeRegisterStatus: Optional[str] = None
    status: Optional[str] = None
    registrationDate: Optional[str] = None
    endDate: Optional[str] = None
    lastModified: Optional[str] = None

    @classmethod
    def from_json(cls, data: dict) -> "YTJCompany":
        """
        Parse raw JSON data from YTJ V3 API into a YTJCompany object.
        """
        processed = {
            "businessId": YTJBusinessId(**data.get("businessId", {})),
            "names": [YTJName(**n) for n in data.get("names", [])],
            "companyForms": _parse_company_forms(data.get("companyForms", [])),
            "addresses": _parse_addresses(data.get("addresses", [])),
            "mainBusinessLine": _parse_main_business_line(data.get("mainBusinessLine")),
            "registeredEntries": _parse_registered_entries(
                data.get("registeredEntries", [])
            ),
        }
        return cls(**{**data, **processed})

    def _get_preferred_translation(
        self,
        items: list,
        attr_name: str,
        preferred_langs: Optional[List[YTJLanguageCode]] = None,
    ) -> Optional[str]:
        """
        Returns the first available translation for the given attribute name
        based on the provided language priority.
        """
        if preferred_langs is None:
            preferred_langs = [YTJLanguageCode.FI, YTJLanguageCode.SV]

        for lang in preferred_langs:
            match = next(
                (getattr(i, attr_name) for i in items if i.languageCode == lang),
                None,
            )
            if match:
                return match
        return None

    @property
    def business_id_value(self) -> str:
        """Returns the business ID string."""
        if not self.businessId or not self.businessId.value:
            raise YTJParseError("Business ID missing from YTJ data")
        return self.businessId.value

    @property
    def name(self) -> str:
        """
        Returns the preferred company name.
        Prioritizes the main name (type '1'). Falls back to the first available name.
        """
        # Name: prefer type 1 (main name?), fallback to first available
        name = next(
            (x.name for x in self.names if x.type == YTJNameType.MAIN_NAME), None
        )
        if not name and self.names:
            name = self.names[0].name

        if not name:
            raise YTJParseError("Company name missing from YTJ data")
        return name

    @property
    def company_form(self) -> str:
        """
        Returns the company form as a string description (e.g., "Osakeyhtiö").
        Prioritizes Finnish description. Falls back to type code.
        """
        company_form_obj = self.companyForms[0] if self.companyForms else None
        company_form = company_form_obj.type if company_form_obj else None

        # Try to find description in preferred languages
        if company_form_obj:
            translation = self._get_preferred_translation(
                company_form_obj.descriptions, "description"
            )
            if translation:
                company_form = translation
        return company_form

    @property
    def industry(self) -> str:
        """
        Returns the main industry/business line description.
        Prioritizes Finnish, then Swedish.
        """
        mbl = self.mainBusinessLine
        if not mbl:
            raise YTJParseError("Company industry missing from YTJ data")

        descriptions = mbl.descriptions
        industry = self._get_preferred_translation(descriptions, "description")

        if not industry:
            raise YTJParseError("Company industry missing from YTJ data")
        return industry

    @property
    def address(self) -> dict:
        """
        Returns a dict with street_address, postcode, and city.
        Prioritizes Visiting Address (type 1), then Postal Address (type 2).
        City is selected from postOffices list (prioritizing Finnish).
        """
        addresses = self.addresses
        # Type 1 is visiting address, Type 2 is postal
        company_address = next(
            (x for x in addresses if x.type == YTJAddressType.VISITING_ADDRESS),
            next(
                (x for x in addresses if x.type == YTJAddressType.POSTAL_ADDRESS), None
            ),
        )

        if not company_address:
            raise YTJParseError("Company address missing from YTJ data")

        # Safely extract city: Prioritize preferred languages, then anything available.
        city = None
        if company_address.postOffices:
            city = self._get_preferred_translation(company_address.postOffices, "city")
            if not city:
                city = company_address.postOffices[0].city

        return {
            "street_address": company_address.street,
            "postcode": company_address.postCode,
            "city": city,
        }
