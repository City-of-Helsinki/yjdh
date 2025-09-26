from django.db import migrations, transaction


DEFAULT_SCHOOL_LIST = [
    "Aleksis Kiven peruskoulu",
    "Arabian peruskoulu",
    "Aurinkolahden peruskoulu",
    "Botby grundskola",
    "Brändö lågstadieskola",
    "Degerö lågstadieskola",
    "Drumsö lågstadieskola",
    "Grundskolan Norsen",
    "Haagan peruskoulu",
    "Hertsikan ala-asteen koulu",
    "Herttoniemenrannan ala-asteen koulu",
    "Hietakummun ala-asteen koulu",
    "Hiidenkiven peruskoulu",
    "Hoplaxskolan",
    "Itäkeskuksen peruskoulu",
    "Jätkäsaaren peruskoulu",
    "Kaisaniemen ala-asteen koulu",
    "Kalasataman peruskoulu",
    "Kallion ala-asteen koulu",
    "Kankarepuiston peruskoulu",
    "Kannelmäen peruskoulu",
    "Karviaistien koulu",
    "Katajanokan ala-asteen koulu",
    "Keinutien ala-asteen koulu",
    "Konalan ala-asteen koulu",
    "Kontulan ala-asteen koulu",
    "Koskelan ala-asteen koulu",
    "Kottby lågstadieskola",
    "Kruununhaan yläasteen koulu",
    "Kruunuvuorenrannan peruskoulu",
    "Kulosaaren ala-asteen koulu",
    "Käpylän peruskoulu",
    "Laajasalon peruskoulu",
    "Laakavuoren ala-asteen koulu",
    "Latokartanon peruskoulu",
    "Lauttasaaren ala-asteen koulu",
    "Maatullin peruskoulu",
    "Malmin peruskoulu",
    "Malminkartanon ala-asteen koulu",
    "Maunulan ala-asteen koulu",
    "Meilahden ala-asteen koulu",
    "Meilahden yläasteen koulu",
    "Mellunmäen ala-asteen koulu",
    "Merilahden peruskoulu",
    "Metsolan ala-asteen koulu",
    "Minervaskolan",
    "Munkkiniemen ala-asteen koulu",
    "Munkkivuoren ala-asteen koulu",
    "Myllypuron peruskoulu",
    "Månsas lågstadieskola",
    "Naulakallion koulu",
    "Nordsjö lågstadieskola",
    "Oulunkylän ala-asteen koulu",
    "Outamon koulu",
    "Pakilan ala-asteen koulu",
    "Pakilan yläasteen koulu",
    "Paloheinän ala-asteen koulu",
    "Pasilan peruskoulu",
    "Pihkapuiston ala-asteen koulu",
    "Pihlajamäen ala-asteen koulu",
    "Pihlajiston ala-asteen koulu",
    "Pikku Huopalahden ala-asteen koulu",
    "Pitäjänmäen peruskoulu",
    "Pohjois-Haagan ala-asteen koulu",
    "Poikkilaakson ala-asteen koulu",
    "Porolahden peruskoulu",
    "Puistolan peruskoulu",
    "Puistolanraitin ala-asteen koulu",
    "Puistopolun peruskoulu",
    "Pukinmäenkaaren peruskoulu",
    "Puotilan ala-asteen koulu",
    "Ressu Comprehensive School",
    "Ressun peruskoulu",
    "Roihuvuoren ala-asteen koulu",
    "Ruoholahden ala-asteen koulu",
    "Sakarinmäen peruskoulu",
    "Santahaminan ala-asteen koulu",
    "Siltamäen ala-asteen koulu",
    "Snellmanin ala-asteen koulu",
    "Solakallion koulu",
    "Sophie Mannerheimin koulu",
    "Staffansby lågstadieskola",
    "Strömbergin ala-asteen koulu",
    "Suomenlinnan ala-asteen koulu",
    "Suutarilan ala-asteen koulu",
    "Suutarinkylän peruskoulu",
    "Tahvonlahden ala-asteen koulu",
    "Taivallahden peruskoulu",
    "Tapanilan ala-asteen koulu",
    "Tehtaankadun ala-asteen koulu",
    "Toivolan koulu",
    "Torpparinmäen peruskoulu",
    "Töölön ala-asteen koulu",
    "Vallilan ala-asteen koulu",
    "Vartiokylän ala-asteen koulu",
    "Vartiokylän yläasteen koulu",
    "Vattuniemen ala-asteen koulu",
    "Vesalan peruskoulu",
    "Vuoniityn peruskoulu",
    "Yhtenäiskoulu",
    "Zacharias Topeliusskolan",
    "Åshöjdens grundskola",
    "Östersundom skola",
]


def remove_schools(apps, schema_editor):
    school_model = apps.get_model("applications", "School")
    school_model.objects.all().delete()


def set_default_schools(apps, schema_editor):
    school_model = apps.get_model("applications", "School")
    with transaction.atomic():
        school_model.objects.all().delete()
        for school in DEFAULT_SCHOOL_LIST:
            school_model.objects.create(name=school)


class Migration(migrations.Migration):
    dependencies = [
        ("applications", "0013_school"),
    ]

    operations = [
        migrations.RunPython(set_default_schools, remove_schools),
    ]
