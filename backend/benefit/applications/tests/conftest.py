import os
import random
import uuid
from datetime import date, timedelta

import factory
import pytest
from django.conf import settings
from django.utils import timezone

from applications.enums import (
    AhjoDecisionDetails,
    AhjoRecordTitle,
    AhjoRecordType,
    ApplicationAlterationType,
    ApplicationBatchStatus,
    ApplicationStatus,
    BenefitType,
    DecisionType,
)
from applications.models import (
    APPLICATION_LANGUAGE_CHOICES,
    AhjoSetting,
    Application,
    ApplicationAlteration,
    ApplicationBatch,
)
from applications.services.ahjo_authentication import AhjoToken
from applications.services.ahjo_decision_service import (
    replace_decision_template_placeholders,
)
from applications.services.ahjo_payload import (
    resolve_payload_language,
    truncate_string_to_limit,
)
from applications.services.application_alteration_csv_report import (
    AlterationCsvConfigurableFields,
    ApplicationAlterationCsvService,
)
from applications.services.applications_csv_report import ApplicationsCsvService
from applications.services.applications_deminimis_csv_report import (
    ApplicationsDeminimisCsvService,
)
from applications.services.applications_power_bi_csv_report import (
    ApplicationsPowerBiCsvService,
)
from applications.services.talpa_csv_service import TalpaCsvService
from applications.tests.factories import (
    AcceptedDecisionProposalFactory,
    AhjoDecisionTextFactory,
    ApplicationAlterationFactory,
    ApplicationBatchFactory,
    ApplicationFactory,
    CancelledApplicationFactory,
    DecidedApplicationFactory,
    DeniedDecisionProposalFactory,
    EmployeeFactory,
    HandlingApplicationFactory,
    ReceivedApplicationFactory,
    RejectedApplicationFactory,
)
from common.tests.conftest import *  # noqa
from companies.tests.conftest import *  # noqa
from helsinkibenefit.tests.conftest import *  # noqa
from shared.common.tests.factories import UserFactory
from shared.service_bus.enums import YtjOrganizationCode
from terms.tests.conftest import *  # noqa
from terms.tests.factories import TermsOfServiceApprovalFactory


@pytest.fixture
def anonymous_application():
    with factory.Faker.override_default_locale("fi_FI"):
        return ApplicationFactory()


@pytest.fixture
def anonymous_handling_application():
    with factory.Faker.override_default_locale("fi_FI"):
        return HandlingApplicationFactory()


@pytest.fixture
def received_application(mock_get_organisation_roles_and_create_company):
    with factory.Faker.override_default_locale("fi_FI"):
        return ReceivedApplicationFactory(
            company=mock_get_organisation_roles_and_create_company
        )


@pytest.fixture
def handling_application(mock_get_organisation_roles_and_create_company):
    with factory.Faker.override_default_locale("fi_FI"):
        return HandlingApplicationFactory(
            company=mock_get_organisation_roles_and_create_company
        )


@pytest.fixture
def decided_application(mock_get_organisation_roles_and_create_company):
    with factory.Faker.override_default_locale("fi_FI"):
        return DecidedApplicationFactory(
            company=mock_get_organisation_roles_and_create_company
        )


@pytest.fixture
def rejected_decided_application(mock_get_organisation_roles_and_create_company):
    with factory.Faker.override_default_locale("fi_FI"):
        return RejectedApplicationFactory(
            company=mock_get_organisation_roles_and_create_company
        )


@pytest.fixture
def multiple_decided_applications(mock_get_organisation_roles_and_create_company):
    with factory.Faker.override_default_locale("fi_FI"):
        return DecidedApplicationFactory.create_batch(
            5, company=mock_get_organisation_roles_and_create_company
        )


@pytest.fixture
def multiple_handling_applications(mock_get_organisation_roles_and_create_company):
    with factory.Faker.override_default_locale("fi_FI"):
        return HandlingApplicationFactory.create_batch(
            5, company=mock_get_organisation_roles_and_create_company
        )


@pytest.fixture
def multiple_decided_applications_for_open_case(
    mock_get_organisation_roles_and_create_company,
):
    with factory.Faker.override_default_locale("fi_FI"):
        return DecidedApplicationFactory.create_batch(
            5, company=mock_get_organisation_roles_and_create_company
        )


@pytest.fixture
def application_batch():
    with factory.Faker.override_default_locale("fi_FI"):
        return ApplicationBatchFactory()


@pytest.fixture
def talpa_service(application_batch):
    return ApplicationsCsvService([application_batch])


@pytest.fixture
def talpa_service_with_one_application(talpa_service):
    talpa_service.get_applications().first().delete()
    assert talpa_service.get_applications().count() == 1
    return talpa_service


@pytest.fixture
def applications_csv_service():
    # retrieve the objects through the default manager so that annotations are added
    application1 = DecidedApplicationFactory(application_number=100001)
    application2 = DecidedApplicationFactory(application_number=100002)
    return ApplicationsCsvService(
        Application.objects.filter(pk__in=[application1.pk, application2.pk]).order_by(
            "application_number"
        )
    )


@pytest.fixture
def applications_csv_service_with_one_application(applications_csv_service):
    application1 = DecidedApplicationFactory(application_number=100001)
    return ApplicationsCsvService(Application.objects.filter(pk=application1.pk))


@pytest.fixture
def talpa_applications_csv_service():
    # retrieve the objects through the default manager so that annotations are added
    application1 = DecidedApplicationFactory(application_number=100001)
    application2 = DecidedApplicationFactory(application_number=100002)
    return TalpaCsvService(
        Application.objects.filter(pk__in=[application1.pk, application2.pk]).order_by(
            "application_number"
        ),
        True,
    )


@pytest.fixture
def talpa_applications_csv_service_with_one_application(application_batch):
    application1 = application_batch.applications.all().first()

    return TalpaCsvService(Application.objects.filter(pk=application1.pk), True)


@pytest.fixture
def sanitized_csv_service_with_one_application(application_batch):
    application1 = application_batch.applications.all().first()
    return ApplicationsCsvService(
        Application.objects.filter(pk=application1.pk), prune_sensitive_data=True
    )


@pytest.fixture
def applications_csv_with_no_applications():
    return ApplicationsCsvService([])


@pytest.fixture
def employee():
    with factory.Faker.override_default_locale("fi_FI"):
        return EmployeeFactory()


@pytest.fixture
def application(mock_get_organisation_roles_and_create_company):
    # Application which belongs to logged in user company
    with factory.Faker.override_default_locale("fi_FI"):
        app = ApplicationFactory()
        app.company = mock_get_organisation_roles_and_create_company
        app.save()
        return app


@pytest.fixture
def association_application(mock_get_organisation_roles_and_create_company):
    """
    :return: A valid application by an association
    """
    application = ApplicationFactory()
    application.company = mock_get_organisation_roles_and_create_company
    application.save()
    application.company.company_form = (
        YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT.label
    )
    application.company.company_form_code = (
        YtjOrganizationCode.ASSOCIATION_FORM_CODE_DEFAULT
    )
    application.company.save()
    application.benefit_type = BenefitType.SALARY_BENEFIT
    application.de_minimis_aid = None
    application.association_has_business_activities = False
    application.de_minimis_aid_set.all().delete()
    return application


@pytest.fixture()
def accept_tos(
    bf_user, mock_get_organisation_roles_and_create_company, terms_of_service
):
    return TermsOfServiceApprovalFactory(
        user=bf_user,
        company=mock_get_organisation_roles_and_create_company,
        terms=terms_of_service,
    )


@pytest.fixture()
def cancelled_applications():
    for _ in range(5):
        CancelledApplicationFactory()

    applications = Application.objects.filter(status=ApplicationStatus.CANCELLED)
    yield applications
    for application in applications:
        _delete_attachments(application)


@pytest.fixture()
def cancelled_delete_date():
    """Return a random date between 30 and 365 days ago"""
    return timezone.now() - timedelta(days=random.randint(30, 365))


@pytest.fixture()
def cancelled_to_delete(cancelled_delete_date, cancelled_applications):
    cancelled_applications.update(modified_at=cancelled_delete_date)
    yield cancelled_applications


@pytest.fixture()
def draft_applications():
    for _ in range(5):
        ApplicationFactory()

    applications = Application.objects.filter(status=ApplicationStatus.DRAFT)
    yield applications
    for application in applications:
        _delete_attachments(application)


@pytest.fixture()
def draft_delete_date():
    """Return a random date between 180 and 365 days ago"""
    return timezone.now() - timedelta(days=random.randint(180, 365))


@pytest.fixture()
def drafts_to_delete(draft_delete_date, draft_applications):
    draft_applications.update(modified_at=draft_delete_date)
    yield draft_applications


@pytest.fixture()
def draft_keep_date():
    return timezone.now() - timedelta(days=random.randint(1, 59))


@pytest.fixture()
def drafts_to_keep(draft_keep_date, draft_applications):
    draft_applications.update(modified_at=draft_keep_date)
    yield draft_applications


@pytest.fixture()
def draft_notification_date():
    return timezone.now() - timedelta(days=166)


@pytest.fixture()
def drafts_about_to_be_deleted(draft_notification_date, draft_applications):
    draft_applications.update(modified_at=draft_notification_date)
    yield draft_applications


@pytest.fixture()
def set_debug_to_true(settings):
    settings.DEBUG = True


@pytest.fixture()
def set_debug_to_false(settings):
    settings.DEBUG = False


@pytest.fixture()
def ahjo_payload_agents(decided_application):
    application = decided_application
    agent = application.calculation.handler
    return [
        {
            "Role": "mainCreator",
            "Name": f"{agent.last_name}, {agent.first_name}",
            "ID": agent.ad_username,
        }
    ]


@pytest.fixture()
def ahjo_record(decided_application, ahjo_payload_agents):
    application = decided_application
    acquired = application.created_at.isoformat()
    documents = []
    publicity_class = "Salassa pidettävä"

    return {
        "Title": "",
        "Type": "",
        "Acquired": acquired,
        "PublicityClass": publicity_class,
        "SecurityReasons": ["JulkL (621/1999) 24.1 § 25 k"],
        "Language": "fi",
        "PersonalData": "Sisältää erityisiä henkilötietoja",
        "MannerOfReceipt": "sähköinen asiointi",
        "Documents": documents,
        "Agents": ahjo_payload_agents,
    }


@pytest.fixture()
def ahjo_payload_record_for_application(ahjo_record):
    record = {
        **ahjo_record,
        "Title": AhjoRecordTitle.APPLICATION,
        "Type": AhjoRecordType.APPLICATION,
    }
    return record


@pytest.fixture()
def ahjo_payload_record_for_attachment(ahjo_record):
    record = {
        **ahjo_record,
        "Title": AhjoRecordTitle.ATTACHMENT,
        "Type": AhjoRecordType.ATTACHMENT,
    }
    record.pop("MannerOfReceipt", None)
    return record


@pytest.fixture()
def dummy_version_series_id():
    return "{12345678910}"


@pytest.fixture()
def ahjo_payload_record_for_attachment_update(
    ahjo_record, dummy_version_series_id, ahjo_payload_agents
):
    record = ahjo_record
    record.pop("MannerOfReceipt", None)
    record.pop("Documents", None)
    record.pop("Agents", None)

    record = {
        **record,
        "Title": AhjoRecordTitle.ATTACHMENT,
        "Type": AhjoRecordType.ATTACHMENT,
        "VersionSeriesId": dummy_version_series_id,
        "Documents": [],
        "Agents": ahjo_payload_agents,
    }

    return record


@pytest.fixture()
def ahjo_open_case_top_level_dict(decided_application):
    application = decided_application
    language = resolve_payload_language(application)

    handler = application.calculation.handler

    return {
        "Title": "a" * 512,
        "Acquired": application.created_at.isoformat("T", "seconds"),
        "ClassificationCode": "02 05 01 00",
        "ClassificationTitle": "Kunnan myöntämät avustukset",
        "Language": language,
        "PublicityClass": "Julkinen",
        "InternalTitle": "a" * 150,
        "Subjects": [
            {"Subject": "Helsinki-lisät", "Scheme": "hki-yhpa"},
            {"Subject": "kunnan myöntämät avustukset", "Scheme": "hki-yhpa"},
            {"Subject": "työnantajat", "Scheme": "hki-yhpa"},
            {"Subject": "työllisyydenhoito"},
        ],
        "PersonalData": "Sisältää erityisiä henkilötietoja",
        "Reference": f"{application.application_number}",
        "Records": [],
        "Agents": [
            {
                "Role": "sender_initiator",
                "CorporateName": truncate_string_to_limit(
                    application.company.name, 100
                ),
                "ContactPerson": application.contact_person,
                "Type": "External",
                "Email": application.company_contact_person_email,
                "AddressStreet": application.company.street_address,
                "AddressPostalCode": application.company.postcode,
                "AddressCity": application.company.city,
            },
            {
                "Role": "draftsman",
                "Name": f"{handler.last_name}, {handler.first_name}",
                "ID": handler.ad_username,
            },
        ],
    }


@pytest.fixture()
def accepted_ahjo_decision_section():
    return AcceptedDecisionProposalFactory()


@pytest.fixture()
def denied_ahjo_decision_section():
    return DeniedDecisionProposalFactory()


@pytest.fixture()
def accepted_ahjo_decision_text(decided_application):
    template = AcceptedDecisionProposalFactory()
    replaced_decision_text = replace_decision_template_placeholders(
        f"""
        <section id="paatos"><h1>Päätös</h1>{template.template_decision_text}</section>
        <section id="paatoksenperustelut">
        <h1>Päätöksen perustelut</h1>{template.template_justification_text}</section>""",
        DecisionType.ACCEPTED,
        decided_application,
    )
    return AhjoDecisionTextFactory(
        decision_type=DecisionType.ACCEPTED,
        application=decided_application,
        decision_text=replaced_decision_text,
        language=APPLICATION_LANGUAGE_CHOICES[0][0],
    )


def split_lines_at_semicolon(csv_string):
    # split CSV into lines and columns without using the csv library
    csv_lines = csv_string.splitlines()
    return [line.split(";") for line in csv_lines]


def _delete_attachments(application: Application):
    """Delete attachment files from the given application"""
    for attachment in application.attachments.all():
        attachment.attachment_file.delete()


def pytest_sessionfinish(session, exitstatus):
    try:
        # Delete all files in the media folder
        files_in_media = os.listdir(settings.MEDIA_ROOT)
        number_of_files = len(files_in_media)
        for file in files_in_media:
            os.remove(os.path.join(settings.MEDIA_ROOT, file))
        print(f"\nTests finished, deleted {number_of_files} files in the media folder")  # noqa: T201
    except OSError as e:
        print(f"Error while deleting file in media folder: {e}")  # noqa: T201


@pytest.fixture
def application_with_ahjo_case_id(decided_application):
    decided_application.ahjo_case_id = generate_ahjo_case_id()
    return decided_application


@pytest.fixture
def rejected_application_with_ahjo_case_id(rejected_decided_application):
    rejected_decided_application.ahjo_case_id = generate_ahjo_case_id()
    return rejected_decided_application


@pytest.fixture
def multiple_applications_with_ahjo_case_id(
    mock_get_organisation_roles_and_create_company,
):
    with factory.Faker.override_default_locale("fi_FI"):
        applications = DecidedApplicationFactory.create_batch(
            10, company=mock_get_organisation_roles_and_create_company
        )

        for a in applications:
            a.ahjo_case_id = generate_ahjo_case_id()
            a.save()
        return applications


def generate_ahjo_case_id():
    year = random.randint(2000, 2099)
    case_id = random.randint(10000, 99999)
    return f"HEL {year} {case_id}"


@pytest.fixture
def application_with_ahjo_decision(application_with_ahjo_case_id, fake_decisionmakers):
    template = AcceptedDecisionProposalFactory()
    replaced_decision_text = replace_decision_template_placeholders(
        f"""
        <section id="paatos"><h1>Päätös</h1>{template.template_decision_text}</section>
        <section id="paatoksenperustelut">
        <h1>Päätöksen perustelut</h1>{template.template_justification_text}</section>""",
        DecisionType.ACCEPTED,
        application_with_ahjo_case_id,
    )
    AhjoDecisionTextFactory(
        application=application_with_ahjo_case_id,
        decision_type=DecisionType.ACCEPTED,
        decision_text=replaced_decision_text,
        language="fi",
        decision_maker_id=fake_decisionmakers[0]["ID"],
        decision_maker_name=fake_decisionmakers[0]["Name"],
    )
    return application_with_ahjo_case_id


@pytest.fixture
def rejected_application_with_ahjo_decision(
    rejected_application_with_ahjo_case_id, fake_decisionmakers
):
    template = AcceptedDecisionProposalFactory()
    replaced_decision_text = replace_decision_template_placeholders(
        f"""
        <section id="paatos"><h1>Päätös</h1>{template.template_decision_text}</section>
        <section id="paatoksenperustelut">
        <h1>Päätöksen perustelut</h1>{template.template_justification_text}</section>""",
        DecisionType.DENIED,
        rejected_application_with_ahjo_case_id,
    )
    AhjoDecisionTextFactory(
        application=rejected_application_with_ahjo_case_id,
        decision_type=DecisionType.DENIED,
        decision_text=replaced_decision_text,
        language="fi",
        decision_maker_id=fake_decisionmakers[0]["ID"],
        decision_maker_name=fake_decisionmakers[0]["Name"],
    )
    return rejected_application_with_ahjo_case_id


@pytest.fixture
def ahjo_decision_detail_response(application_with_ahjo_decision):
    id = uuid.uuid4()
    handler = application_with_ahjo_decision.calculation.handler
    name = f"{handler.first_name} {handler.last_name}"
    company = application_with_ahjo_decision.company
    today = date.today()
    content = (
        '<html lang="fi"><head><META content="text/html; charset=UTF-8"'
        f' http-equiv="Content-Type"><META name="DhId" content="{id}"><META'
        ' name="ThisHTMLGenerated"'
        ' content="2024-04-09T13:48:35.106+03:00"><title>Avustuksen myöntäminen,'
        " Työllisyyspalvelut, työllisyydenhoidon"
        ' Helsinki-lisä</title></head><body><div class="paatos"><div'
        ' class="Otsikonviite"></div><div class="Otsikonviite2"></div><div'
        ' class="Asiapykala">16 §</div><h1 class="AsiaOtsikko">Avustuksen myöntäminen,'
        " Työllisyyspalvelut, työllisyydenhoidon Helsinki-lisä</h1><div"
        ' class="DnroTmuoto">HEL 2024-004415 T 02 05 01 00</div><div'
        ' class="Viite"></div><div class="Viite"></div><div class="SisaltoSektio"><h3'
        ' class="SisaltoOtsikko">Päätös</h3><div><p>Helsinki-lisä-suunnittelija päätti'
        f" myöntää {company}:lle työnantajan Helsinki-lisää käytettäväksi"
        " helsinkiläisen työllistämiseksi 448 euroa kuukaudessa palkkatuetulle ajalle"
        " 4.12.2023-3.10.2024 ja 800 euroa kuukaudessa ajalle 4.10.2024-3.12.2024,"
        " jolta työnantaja ei saa palkkatukea. Yhteensä Helsinki-lisää myönnetään 6080"
        " euroa. <br></p><p>Helsinki-lisään on varattu talousarviossa Helsingin"
        " kaupungin Työllisyyspalveluille vuosittain budjetoitu määräraha. Avustuksen"
        " kustannukset maksetaan kaupungin Työllisyyspalveluille osoitetusta"
        " määrärahasta talousarvion erikseen määritellyltä kohdalta. Työnantajan"
        " Helsinki-lisä on aina harkinnanvarainen.</p></div></div><div"
        ' class="SisaltoSektio"><h3'
        ' class="SisaltoOtsikko">Päätösteksti</h3><div><p>Helsingin'
        " kaupunginhallituksen elinkeinojaosto on 11.9.2023 § 30 päättänyt tukea"
        " rahallisesti yksityisen ja kolmannen sektorin työnantajia, jotka tarjoavat"
        " työtä kaupungin työllisyydenhoidon kohderyhmiin kuuluville"
        " helsinkiläisille.</p><h4>Avustus</h4><p>Kaupunginhallituksen elinkeinojaosto"
        " on päätöksellään 11.9.2023 § 30 hyväksynyt työnantajan Helsinki-lisän"
        " myöntämistä koskevat ehdot. Helsinki-lisän myöntämisessä noudatetaan lisäksi"
        " kaupunginhallituksen 28.10.2019 § 723 hyväksymiä Helsingin kaupungin"
        " avustusten yleisohjeita.</p><p>Helsinki-lisä on myönnetty työllistettävän"
        " henkilön palkkauksesta aiheutuviin kustannuksiin, ei kuitenkaan"
        " bruttopalkkaan siltä ajalta, jolta työnantaja saa myös palkkatukea. Tuen"
        " määrään vaikuttavat samoihin kustannuksiin myönnetyt muut tuet (esim."
        " palkkatuki ja oppisopimuksen koulutuskorvaus). Yritykselle ja taloudellista"
        " toimintaa harjoittavalle yhteisölle avustus myönnetään vähämerkityksisenä"
        " tukena eli ns. de minimis -tukena, ei koskaan yleisen ryhmäpoikkeusasetuksen"
        " (komission asetus (EU) N:o 651/2014) perusteella eli ns. RPA-tukena."
        " Yleishyödyllisille yhteisöille avustus myönnetään valtiontukisääntelyn"
        " ulkopuolisena tukena, jos yhdistys ei harjoita taloudellista"
        " toimintaa.</p><p>Avustusta myönnetään valtiontukisäännöissä määrätyn"
        " kasautumissäännön sekä tuen enimmäisintensiteetin mukaisesti (tuen määrä"
        " suhteessa tukikelpoisiin kustannuksiin). Helsinki-lisä voi olla enintään 800"
        " euroa kuukaudessa. Avustusta ei saa siirtää toisen tahon tai henkilön"
        " käytettäväksi. Avustus maksetaan hakemuksessa ilmoitetulle"
        " pankkitilille.</p><p>Helsinki-lisää saa käyttää ainoastaan"
        " kaupunginhallituksen elinkeinojaoston päätöksen 11.9.2023 §30 mukaisiin"
        " tarkoituksiin. Avustuksen saajan tulee viipymättä palauttaa virheellisesti,"
        " liikaa tai ilmeisen perusteettomasti saamansa avustus."
        " Väärinkäyttötapauksessa kaupunki voi periä maksetun avustuksen takaisin."
        " Avustuksen saaja sitoutuu antamaan tarvittaessa kaupungille tarvittavat"
        " tiedot sen varmistamiseksi, että avustusta ei ole käytetty ehtojen"
        " vastaisesti. Mikäli avustus maksetaan ennen päätöksen lainvoimaisuutta,"
        " avustuksen saaja sitoutuu palauttamaan jo maksetut avustukset, jos päätös"
        " muutoksenhaun johdosta"
        " muuttuu.</p><h4>Valtiontukiarviointi</h4><p>Yritykselle ja taloudellista"
        " toimintaa harjoittavalle yhteisölle avustus myönnetään vähämerkityksisenä"
        " tukena eli ns. de minimis -tukena. Tuen myöntämisessä noudatetaan komission"
        " asetusta (EU) 2023/2831, annettu 13.12.2023, Euroopan unionista tehdyn"
        " sopimuksen 107 ja 108 artiklan soveltamisesta vähämerkityksiseen tukeen"
        " (EUVL L2023/281, 15.12.2023).</p><p>Kullekin hakijalle myönnettävän de"
        " minimis -tuen määrä ilmenee hakijakohtaisesta liitteestä. Avustuksen"
        " saajalle voidaan myöntää de minimis -tukena enintään 300 000 euroa kuluvan"
        " vuoden ja kahden sitä edeltäneen kahden vuoden muodostaman jakson aikana."
        " Avustuksen saaja vastaa siitä, että eri tahojen (mm. ministeriöt,"
        " ministeriöiden alaiset viranomaiset, Business Finland, Finnvera Oyj, kunnat,"
        " maakuntien liitot) myöntämien de minimis -tukien yhteismäärä ei ylitä tätä"
        " määrää. Avustuksen saaja on avustushakemuksessa ilmoittanut kaupungille"
        " kaikkien saamiensa de minimis -tukien määrät ja"
        " myöntöajankohdat.</p></div></div><h3"
        f' class="LisatiedotOtsikko">Lisätiedot</h3><p>{name}, suunnittelija, puhelin:'
        " 12345789 <div>testi@testi.test</div></p><div"
        ' class="SahkoinenAllekirjoitusSektio"><p'
        ' class="SahkoisestiAllekirjoitettuTeksti">Päätös on sähköisesti'
        f' allekirjoitettu.</p><p><div class="Puheenjohtajanimi">{name}</div><div'
        ' class="Puheenjohtajaotsikko">helsinki-lisä-suunnittelija</div></p></div><h3'
        ' class="LiitteetOtsikko">Liitteet</h3><div>1 Salassa pidettävä<span> (Salassa'
        " pidettävä, JulkL (621/1999) 24.1 § 25 k)</span></div><h3"
        ' class="MuutoksenhakuOtsikko">Muutoksenhaku</h3><h4>OHJEET OIKAISUVAATIMUKSEN'
        " TEKEMISEKSI</h4><p>Tähän päätökseen tyytymätön voi tehdä kirjallisen"
        " oikaisuvaatimuksen. Päätökseen ei saa hakea muutosta valittamalla"
        " tuomioistuimeen.</p><h5>Oikaisuvaatimusoikeus</h5><p>Oikaisuvaatimuksen saa"
        " tehdä</p><div><ul><li>se, johon päätös on kohdistettu tai jonka oikeuteen,"
        " velvollisuuteen tai etuun päätös välittömästi vaikuttaa"
        " (asianosainen)</li><li>kunnan"
        " jäsen.</li></ul></div><h5>Oikaisuvaatimusaika</h5><p>Oikaisuvaatimus on"
        " tehtävä 14 päivän kuluessa päätöksen"
        " tiedoksisaannista.</p><p>Oikaisuvaatimuksen on saavuttava Helsingin"
        " kaupungin kirjaamoon määräajan viimeisenä päivänä ennen kirjaamon"
        " aukioloajan päättymistä.</p><p>Mikäli päätös on annettu tiedoksi postitse,"
        " asianosaisen katsotaan saaneen päätöksestä tiedon, jollei muuta näytetä,"
        " seitsemän päivän kuluttua kirjeen lähettämisestä. Kunnan jäsenen katsotaan"
        " saaneen päätöksestä tiedon seitsemän päivän kuluttua siitä, kun pöytäkirja"
        " on nähtävänä yleisessä tietoverkossa.</p><p>Mikäli päätös on annettu"
        " tiedoksi sähköisenä viestinä, asianosaisen katsotaan saaneen päätöksestä"
        " tiedon, jollei muuta näytetä, kolmen päivän kuluttua viestin"
        " lähettämisestä.</p><p>Tiedoksisaantipäivää ei lueta oikaisuvaatimusaikaan."
        " Jos oikaisuvaatimusajan viimeinen päivä on pyhäpäivä, itsenäisyyspäivä,"
        " vapunpäivä, joulu- tai juhannusaatto tai arkilauantai, saa"
        " oikaisuvaatimuksen tehdä ensimmäisenä arkipäivänä sen"
        " jälkeen.</p><h5>Oikaisuvaatimusviranomainen</h5><p>Viranomainen, jolle"
        " oikaisuvaatimus tehdään, on Helsingin"
        " kaupunginhallitus.</p><p>Oikaisuvaatimusviranomaisen asiointiosoite on"
        " seuraava:</p><p>Suojattu sähköposti: https://securemail.hel.fi/"
        " </p><p>Käytäthän aina suojattua sähköpostia, kun lähetät henkilökohtaisia"
        " tietojasi.</p><p>Muistathan asioinnin yhteydessä mainita kirjaamisnumeron"
        " (esim. HEL 2021-000123), mikäli asiasi on jo vireillä Helsingin"
        ' kaupungissa.</p><div><div><table><colgroup><col width="24.25%"><col'
        ' width="75.75%"></colgroup><tbody><tr><td><div>Sähköpostiosoite:</div></td><td><div>helsinki.kirjaamo@hel.fi</div></td></tr><tr><td><div>Postiosoite:</div></td><td><div>PL'
        " 10</div></td></tr><tr><td><div>&nbsp;</div></td><td><div>00099 HELSINGIN"
        " KAUPUNKI</div></td></tr><tr><td><div>Käyntiosoite:</div></td><td><div>Pohjoisesplanadi"
        " 11-13</div></td></tr><tr><td><div>Puhelinnumero:</div></td><td><div>09 310"
        " 13700</div></td></tr></tbody></table></div></div><p>Kirjaamon aukioloaika on"
        " maanantaista perjantaihin klo 08.15-16.00.</p><h5>Oikaisuvaatimuksen muoto"
        " ja sisältö</h5><p>Oikaisuvaatimus on tehtävä kirjallisena. Myös sähköinen"
        " asiakirja täyttää vaatimuksen kirjallisesta"
        " muodosta.</p><p>Oikaisuvaatimuksessa on ilmoitettava</p><div><ul><li>päätös,"
        " johon oikaisuvaatimus kohdistuu</li><li>miten päätöstä halutaan"
        " oikaistavaksi</li><li>millä perusteella päätöstä halutaan"
        " oikaistavaksi</li><li>oikaisuvaatimuksen tekijä</li><li>millä perusteella"
        " oikaisuvaatimuksen tekijä on oikeutettu tekemään"
        " vaatimuksen</li><li>oikaisuvaatimuksen tekijän"
        " yhteystiedot</li></ul></div><h5>Pöytäkirja</h5><p>Päätöstä koskevia"
        " pöytäkirjan otteita ja liitteitä lähetetään pyynnöstä. Asiakirjoja voi"
        " tilata Helsingin kaupungin kirjaamosta.</p><h3"
        ' class="OtteetOtsikko">Otteet</h3><table><thead><tr><th>Ote</th><th>Otteen'
        f" liitteet</th></tr></thead><tbody><tr><td>{company}</td><td><div>Oikaisuvaatimusohje,"
        " kaupunginhallitus</div><div>Liite"
        " 1</div></td></tr></tbody></table></div></body></html>"
    )

    return [
        {
            "links": [
                {
                    "rel": "self",
                    "href": (
                        "https://ahjo.hel.fi:9802/ahjorest/v1/decisions/%7B02A081B6-7B7C-4309-B95A-3A53D222B4CE%7D"
                    ),
                }
            ],
            "NativeId": "{02A081B6-7B7C-4309-B95A-3A53D222B4CE}",
            "Title": (
                "Avustuksen myöntäminen, Työllisyyspalvelut, työllisyydenhoidon"
                " Helsinki-lisä"
            ),
            "CaseIDLabel": f"{application_with_ahjo_decision.ahjo_case_id}",
            "Section": "16",
            "Content": content,
            "Motion": "",
            "ClassificationCode": "02 05 01 00",
            "ClassificationTitle": "Kunnan myöntämät avustukset",
            "Organization": {
                "links": [
                    {
                        "rel": "self",
                        "href": (
                            "https://ahjo.hel.fi:9802/ahjorest/v1/organization?orgid=U02120013070VH2&apireqlang=fi"
                        ),
                    }
                ],
                "Name": "Helsinki-lisä-suunnittelija",
                "ID": "U02120013070VH2",
                "TypeId": "12",
                "Existing": "true",
                "Formed": "2023-05-26T00:00:00.000",
                "Dissolved": "2100-01-01T00:00:00.000",
                "Type": "Viranhaltija",
                "Sector": {
                    "links": [],
                    "SectorID": "U50",
                    "Sector": "Keskushallinto",
                    "PendingCases": 0,
                },
                "OrganizationLevelAbove": {
                    "organizations": [
                        {
                            "links": [
                                {
                                    "rel": "self",
                                    "href": "https://test.test",
                                },
                                {
                                    "rel": "self",
                                    "href": "https:/test.test",
                                },
                            ],
                            "Name": "Työnantajille myönnettävät taloudelliset tuet",
                            "ID": "U02120013070",
                            "TypeId": "20",
                            "Existing": "true",
                            "Formed": "2023-03-01T00:00:00.000",
                            "Dissolved": "2100-01-01T00:00:00.000",
                        }
                    ],
                    "count": 1,
                    "links": [],
                },
                "OrganizationLevelBelow": {
                    "organizations": [],
                    "count": 0,
                    "links": [],
                },
            },
            "Meeting": None,
            "VotingResults": [],
            "Attachments": [
                {
                    "links": [],
                    "Title": "Salassa pidettävä",
                    "AttachmentNumber": "1",
                    "PublicityClass": "Salassa pidettävä",
                    "SecurityReasons": ["JulkL (621/1999) 24.1 § 25 k"],
                }
            ],
            "PreviousDecisions": [],
            "PDF": {
                "links": [
                    {
                        "rel": "self",
                        "href": "https://test.test",
                    }
                ],
                "Title": (
                    "Avustuksen myöntäminen, Työllisyyspalvelut, työllisyydenhoidon"
                    " Helsinki-lisä"
                ),
                "AttachmentNumber": None,
                "PublicityClass": "Julkinen",
                "SecurityReasons": None,
                "VersionSeriesId": "{6176A8B5-B5D3-CB83-86F4-8EC1DCA00004}",
                "NativeId": "{02A081B6-7B7C-4309-B95A-3A53D222B4CE}",
                "Type": "viranhaltijan päätös",
                "FileURI": (
                    "https://ahjojulkaisu.hel.fi/6176A8B5-B5D3-CB83-86F4-8EC1DCA00004.pdf"
                ),
                "Language": "fi",
                "PersonalData": "Sisältää henkilötietoja",
                "Issued": "2024-04-09T03:00:00.000",
            },
            "MinutesPDF": {
                "links": [],
                "Title": (
                    "Helsinki-lisä-suunnittelija viranhaltijan pöytäkirja"
                    " 09.04.2024/16, julkinen, julkaisujärjestelmä"
                ),
                "AttachmentNumber": None,
                "PublicityClass": "Julkinen",
                "SecurityReasons": None,
                "VersionSeriesId": "{157BBFB1-D9D8-C132-996B-8EC1DD100001}",
                "NativeId": "{15E07229-9B33-437D-BEAB-F0FE1F5C5F94}",
                "Type": "viranhaltijan pöytäkirja",
                "FileURI": (
                    "https://ahjojulkaisu.hel.fi/157BBFB1-D9D8-C132-996B-8EC1DD100001.pdf"
                ),
                "Language": "fi",
                "PersonalData": "Sisältää henkilötietoja",
                "Issued": "2024-04-09T03:00:00.000",
            },
            "DateDecision": f"{today}T03:00:00.000",
            "DecisionHistoryPDF": None,
            "DecisionHistoryHTML": "",
            "CaseID": f"{application_with_ahjo_decision.ahjo_case_id}",
        }
    ]


@pytest.fixture
def p2p_settings():
    return AhjoSetting.objects.create(
        name="p2p_settings",
        data={
            "acceptor_name": "Test Test",
            "inspector_name": "Test Inspector",
            "inspector_email": "inspector@test.test",
        },
    )


@pytest.fixture
def decision_details():
    return AhjoDecisionDetails(
        decision_maker_name="Test Test",
        decision_maker_title="Test Title",
        section_of_the_law="16 §",
        decision_date=timezone.now(),
    )


@pytest.fixture
def batch_for_decision_details(application_with_ahjo_decision):
    return ApplicationBatch.objects.create(
        handler=application_with_ahjo_decision.calculation.handler,
        auto_generated_by_ahjo=True,
    )


@pytest.fixture
def decided_application_with_decision_date(application_with_ahjo_decision):
    batch = ApplicationBatch.objects.create(
        handler=application_with_ahjo_decision.calculation.handler,
        auto_generated_by_ahjo=True,
        decision_date=date.today(),
    )
    batch.status = ApplicationBatchStatus.COMPLETED
    batch.save()
    application_with_ahjo_decision.calculation.granted_as_de_minimis_aid = True
    application_with_ahjo_decision.calculation.save()
    application_with_ahjo_decision.pay_subsidy_percent = 100
    application_with_ahjo_decision.batch = batch
    application_with_ahjo_decision.save()
    return application_with_ahjo_decision


@pytest.fixture
def rejected_decided_application_with_decision_date(
    rejected_application_with_ahjo_decision,
):
    batch = ApplicationBatch.objects.create(
        handler=rejected_application_with_ahjo_decision.calculation.handler,
        auto_generated_by_ahjo=True,
        decision_date=date.today(),
    )
    batch.status = ApplicationBatchStatus.COMPLETED
    batch.save()
    rejected_application_with_ahjo_decision.pay_subsidy_percent = 100
    rejected_application_with_ahjo_decision.batch = batch
    rejected_application_with_ahjo_decision.save()
    return rejected_application_with_ahjo_decision


@pytest.fixture
def application_alteration_csv_service():
    application_1 = DecidedApplicationFactory(application_number=100003)
    application_2 = DecidedApplicationFactory(application_number=100004)

    handled_by = UserFactory()

    ApplicationAlterationFactory(
        application=application_1,
        alteration_type=ApplicationAlterationType.TERMINATION,
        handled_by=handled_by,
    )

    ApplicationAlterationFactory(
        application=application_2,
        alteration_type=ApplicationAlterationType.SUSPENSION,
        handled_by=handled_by,
    )

    config = AlterationCsvConfigurableFields(
        account_number="123456",
    )

    return ApplicationAlterationCsvService(
        ApplicationAlteration.objects.filter(
            application_id__in=[application_1.id, application_2.id]
        ),
        config=config,
        current_user=handled_by,
    )


@pytest.fixture
def application_alteration(decided_application):
    return ApplicationAlterationFactory(
        application=decided_application,
        alteration_type=ApplicationAlterationType.TERMINATION,
        handled_by=decided_application.handler,
    )


@pytest.fixture
def application_deminimis_csv_service(decided_application_with_decision_date):
    return ApplicationsDeminimisCsvService(
        Application.objects.filter(id=decided_application_with_decision_date.id)
    )


@pytest.fixture
def application_powerbi_csv_service(decided_application_with_decision_date):
    return ApplicationsPowerBiCsvService(
        Application.objects.filter(id=decided_application_with_decision_date.id)
    )


@pytest.fixture
def decisionmaker_response():
    return (
        None,
        {
            "decisionMakers": [
                {
                    "Organization": {
                        "links": [],
                        "Name": (
                            "Tiimipäällikkö, työnantajille myönnettävät taloudelliset"
                            " tuet"
                        ),
                        "ID": "XYZÅÄÖ123",
                        "TypeId": "12",
                        "Existing": "true",
                        "Formed": "2023-03-01T00:00:00.000",
                        "Dissolved": "2100-01-01T00:00:00.000",
                        "Type": "Viranhaltija",
                        "Sector": {
                            "links": [],
                            "SectorID": "456",
                            "Sector": "Keskushallinto",
                            "PendingCases": 0,
                        },
                        "OrganizationLevelAbove": {
                            "organizations": [
                                {
                                    "links": [
                                        {
                                            "rel": "self",
                                            "href": "https://dummy.url",
                                        }
                                    ],
                                    "Name": (
                                        "Työnantajille myönnettävät taloudelliset tuet"
                                    ),
                                    "ID": "XYZÅÄÖ123",
                                    "TypeId": "20",
                                    "Existing": "true",
                                    "Formed": "2023-03-01T00:00:00.000",
                                    "Dissolved": "2100-01-01T00:00:00.000",
                                }
                            ],
                            "count": 1,
                            "links": [],
                        },
                        "OrganizationLevelBelow": {
                            "organizations": [],
                            "count": 0,
                            "links": [],
                        },
                        "IsDecisionMaker": True,
                    },
                    "Sector": {
                        "links": [],
                        "SectorID": "123",
                        "Sector": "Keskushallinto",
                        "PendingCases": 0,
                    },
                    "Composition": [],
                },
                {
                    "Organization": {
                        "links": [],
                        "Name": "Helsinki-lisä-suunnittelija",
                        "ID": "XYZÅÄÖ123",
                        "TypeId": "12",
                        "Existing": "true",
                        "Formed": "2023-05-26T00:00:00.000",
                        "Dissolved": "2100-01-01T00:00:00.000",
                        "Type": "Viranhaltija",
                        "Sector": {
                            "links": [],
                            "SectorID": "U50",
                            "Sector": "Keskushallinto",
                            "PendingCases": 0,
                        },
                        "OrganizationLevelAbove": {
                            "organizations": [
                                {
                                    "links": [
                                        {
                                            "rel": "self",
                                            "href": "https://dummy.url",
                                        }
                                    ],
                                    "Name": (
                                        "Työnantajille myönnettävät taloudelliset tuet"
                                    ),
                                    "ID": "XYZÅÄÖ123",
                                    "TypeId": "5",
                                    "Existing": "true",
                                    "Formed": "2023-03-01T00:00:00.000",
                                    "Dissolved": "2100-01-01T00:00:00.000",
                                }
                            ],
                            "count": 1,
                            "links": [],
                        },
                        "OrganizationLevelBelow": {
                            "organizations": [],
                            "count": 0,
                            "links": [],
                        },
                        "IsDecisionMaker": True,
                    },
                    "Sector": {
                        "links": [],
                        "SectorID": "123",
                        "Sector": "Keskushallinto",
                        "PendingCases": 0,
                    },
                    "Composition": [],
                },
                {
                    "Organization": {
                        "links": [],
                        "Name": "Työnantajille myönnettävät taloudelliset tuet",
                        "ID": "XYZÅÄÖ123",
                        "TypeId": "20",
                        "Existing": "true",
                        "Formed": "2023-03-01T00:00:00.000",
                        "Dissolved": "2100-01-01T00:00:00.000",
                        "Type": "Tiimi",
                        "Sector": {
                            "links": [],
                            "SectorID": "U50",
                            "Sector": "Keskushallinto",
                            "PendingCases": 0,
                        },
                        "OrganizationLevelAbove": {
                            "organizations": [
                                {
                                    "links": [
                                        {
                                            "rel": "self",
                                            "href": "https://dummy.url",
                                        }
                                    ],
                                    "Name": "Työllisyyspalvelut",
                                    "ID": "XYZÅÄÖ123",
                                    "TypeId": "10",
                                    "Existing": "true",
                                    "Formed": "2023-03-01T00:00:00.000",
                                    "Dissolved": "2100-01-01T00:00:00.000",
                                }
                            ],
                            "count": 1,
                            "links": [],
                        },
                        "OrganizationLevelBelow": {
                            "organizations": [
                                {
                                    "links": [
                                        {
                                            "rel": "self",
                                            "href": "https://dummy.url",
                                        }
                                    ],
                                    "Name": (
                                        "Tiimipäällikkö, työnantajille myönnettävät"
                                        " taloudelliset tuet"
                                    ),
                                    "ID": "ABCDEFG3456",
                                    "TypeId": "11",
                                    "Existing": "true",
                                    "Formed": "2023-03-01T00:00:00.000",
                                    "Dissolved": "2100-01-01T00:00:00.000",
                                },
                                {
                                    "links": [
                                        {
                                            "rel": "self",
                                            "href": "https://dummy.url",
                                        }
                                    ],
                                    "Name": "Helsinki-lisä-suunnittelija",
                                    "ID": "ABCDEFG123",
                                    "TypeId": "00",
                                    "Existing": "true",
                                    "Formed": "2023-05-26T00:00:00.000",
                                    "Dissolved": "2100-01-01T00:00:00.000",
                                },
                            ],
                            "count": 2,
                            "links": [],
                        },
                        "IsDecisionMaker": False,
                    },
                    "Sector": {
                        "links": [],
                        "SectorID": "ABCD",
                        "Sector": "Keskushallinto",
                        "PendingCases": 0,
                    },
                    "Composition": [],
                },
            ],
            "count": 3,
            "links": [
                {
                    "rel": "self",
                    "href": "https://dummy.url",
                }
            ],
        },
    )


@pytest.fixture
def invalid_decisionmaker_response():
    return {
        "decisionMakers": [
            {"Organization": {"Name": None, "ID": "ORG001", "IsDecisionMaker": True}},
            {"Organization": {"Name": "Test Org", "ID": None, "IsDecisionMaker": True}},
        ]
    }


@pytest.fixture
def fake_decisionmakers():
    return [
        {
            "ID": "ABCDEFGH12345678",
            "Name": "Tiimipäällikkö, työnantajille myönnettävät taloudelliset tuet",
        },
        {"ID": "HIJKLMNOPQRSTUWXYZ", "Name": "Helsinki-lisä-suunnittelija"},
    ]


@pytest.fixture
def fake_signers():
    return [
        {
            "ID": "ABCDEFGH12345678",
            "Name": "Testaaja, Timo",
        },
        {
            "ID": "HIJKLMNOPQRSTUWXYZ",
            "Name": "Testaaja, Tiina",
        },
    ]


@pytest.fixture
def decision_maker_settings(fake_decisionmakers):
    return AhjoSetting.objects.create(
        name="ahjo_decision_maker",
        data=fake_decisionmakers,
    )


@pytest.fixture
def signer_settings(fake_signers):
    return AhjoSetting.objects.create(
        name="ahjo_signer",
        data=fake_signers,
    )


@pytest.fixture
def signer_response():
    return {
        "agentList": [
            {
                "agentId": "kissa213",
                "links": [],
                "ID": "kissa213",
                "Name": "Testaaja, Tiina",
                "Title": None,
                "Role": "decisionMaker",
                "Email": None,
            },
            {
                "agentId": "koira123",
                "links": [],
                "ID": "koira123",
                "Name": "Testaaja, Timo",
                "Title": None,
                "Role": "decisionMaker",
                "Email": None,
            },
            {
                "agentId": "kala123",
                "links": [],
                "ID": "kala123",
                "Name": "Testaaja, Teppo",
                "Title": None,
                "Role": "decisionMaker",
                "Email": None,
            },
        ],
        "count": 3,
        "links": [],
    }


@pytest.fixture
def non_expired_token():
    return AhjoToken(
        access_token="access_token",
        refresh_token="refresh_token",
        expires_in=30000,
        created_at=timezone.now(),
    )
