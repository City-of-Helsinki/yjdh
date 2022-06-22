"""

Finnish auth: https://palveluhallinta.suomi.fi/fi/tuki/artikkelit/590ad07b14bbb10001966f50
eIDAS: https://palveluhallinta.suomi.fi/fi/tuki/artikkelit/5b2bb2ae9214c3002c36dbf2

Limited personal information
  - name: Sähköinen asiointitunnus, satu
    friendly_name: electronicIdentificationNumber
    uri: urn:oid:1.2.246.22
    description: Sähköinen asiointitunnus, joka yksilöi tunnistetun käyttäjän.
  - name: Henkilötunnus, hetu
    friendly_name: nationalIdentificationNumber
    uri: urn:oid:1.2.246.21
    description: Henkilötunnus, joka yksilöi tunnistetun käyttäjän.
  - name: Nimi, common name
    friendly_name: cn
    uri: urn:oid:2.5.4.3
    description: Henkilön nimi muodossa sukunimi + kaikki etunimet. Jos kyseessä on
      Katso-tunnistaja, palautetaan Katso-tunnisteeseen liitetty nimitieto.
  - name: Koko nimi
    friendly_name: displayName
    uri: urn:oid:2.16.840.1.113730.3.1.241
    description: Henkilön koko nimi muodossa "kutsumanimi sukunimi", jos henkilö on
      rekisteröinyt väestötietojärjestelmään kutsumanimen. Muussa tapauksessa "etunimi
      sukunimi".
  - name: Kutsumanimi
    friendly_name: givenName
    uri: urn:oid:2.5.4.42
    description: Kutsumanimi tai ensimmäinen etunimi, jos väestötietojärjestelmään
      ei ole rekisteröity kutsumanimeä.
  - name: Sukunimi
    friendly_name: sn
    uri: urn:oid:2.5.4.4
    description: Henkilön sukunimi.

Limited personal information + eIDAS:
  - name: Etunimet
    friendly_name: FirstName
    uri: http://eidas.europa.eu/attributes/naturalperson/CurrentGivenName
    description: Henkilön kaikki etunimet.

eIDAS:
  - name: Sukunimi
    friendly_name: FamilyName
    uri: http://eidas.europa.eu/attributes/naturalperson/CurrentFamilyName
    description: Henkilön tämänhetkinen sukunimi.
  - name: Syntymäaika
    friendly_name: DateOfBirth
    uri: http://eidas.europa.eu/attributes/naturalperson/DateOfBirth
    description: Henkilön syntymäaika muodossa xsd:date , YYYY + “-“ + MM + “-“ + DD
  - name: PersonalIdentifier
    friendly_name: PersonIdentifier
    uri: http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier
    description: EIDAS-asetuksen mukainen yksilöivä tunniste
"""

MAP = {
    "identifier": "urn:oasis:names:tc:SAML:2.0:attrname-format:uri",
    "fro": {
        # Limited personal information
        "urn:oid:1.2.246.22": "electronicIdentificationNumber",
        "urn:oid:1.2.246.21": "nationalIdentificationNumber",
        "urn:oid:2.5.4.3": "cn",
        "urn:oid:2.16.840.1.113730.3.1.241": "displayName",
        "urn:oid:2.5.4.42": "givenName",
        "urn:oid:2.5.4.4": "sn",
        # Limited personal information + eIDAS
        "http://eidas.europa.eu/attributes/naturalperson/CurrentGivenName": "FirstName",
        # eIDAS
        "http://eidas.europa.eu/attributes/naturalperson/CurrentFamilyName": "FamilyName",
        "http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier": "PersonIdentifier",
        "http://eidas.europa.eu/attributes/naturalperson/DateOfBirth": "DateOfBirth",
    },
    "to": {
        "electronicIdentificationNumber": "urn:oid:1.2.246.22",
        "nationalIdentificationNumber": "urn:oid:1.2.246.21",
        "cn": "urn:oid:2.5.4.3",
        "displayName": "urn:oid:2.16.840.1.113730.3.1.241",
        "givenName": "urn:oid:2.5.4.42",
        "sn": "urn:oid:2.5.4.4",
        # Limited personal information + eIDAS
        "FirstName": "http://eidas.europa.eu/attributes/naturalperson/CurrentGivenName",
        # eIDAS
        "FamilyName": "http://eidas.europa.eu/attributes/naturalperson/CurrentFamilyName",
        "PersonIdentifier": "http://eidas.europa.eu/attributes/naturalperson/PersonIdentifier",
        "DateOfBirth": "http://eidas.europa.eu/attributes/naturalperson/DateOfBirth",
    },
}
