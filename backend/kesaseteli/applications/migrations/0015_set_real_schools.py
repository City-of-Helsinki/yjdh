from django.db import migrations, transaction


REAL_SCHOOL_LIST = [
    "Aleksis Kiven peruskoulu",
    "Apollon yhteiskoulu",
    "Arabian peruskoulu",
    "Aurinkolahden peruskoulu",
    "Botby grundskola",
    "Elias-koulu",
    "Englantilainen koulu",
    "Grundskolan Norsen",
    "Haagan peruskoulu",
    "Helsingin Juutalainen Yhteiskoulu",
    "Helsingin Kristillinen koulu",
    "Helsingin Montessori-koulu",
    "Helsingin Rudolf Steiner -koulu",
    "Helsingin Saksalainen koulu",
    "Helsingin Suomalainen yhteiskoulu",
    "Helsingin Uusi yhteiskoulu",
    "Helsingin eurooppalainen koulu",
    "Helsingin normaalilyseo",
    "Helsingin ranskalais-suomalainen koulu",
    "Helsingin yhteislyseo",
    "Helsingin yliopiston Viikin normaalikoulu",
    "Herttoniemen yhteiskoulu",
    "Hiidenkiven peruskoulu",
    "Hoplaxskolan",
    "International School of Helsinki",
    "Itäkeskuksen peruskoulu",
    "Jätkäsaaren peruskoulu",
    "Kalasataman peruskoulu",
    "Kankarepuiston peruskoulu",
    "Kannelmäen peruskoulu",
    "Karviaistien koulu",
    "Kruununhaan yläasteen koulu",
    "Kruunuvuorenrannan peruskoulu",
    "Kulosaaren yhteiskoulu",
    "Käpylän peruskoulu",
    "Laajasalon peruskoulu",
    "Latokartanon peruskoulu",
    "Lauttasaaren yhteiskoulu",
    "Maatullin peruskoulu",
    "Malmin peruskoulu",
    "Marjatta-koulu",
    "Maunulan yhteiskoulu",
    "Meilahden yläasteen koulu",
    "Merilahden peruskoulu",
    "Minervaskolan",
    "Munkkiniemen yhteiskoulu",
    "Myllypuron peruskoulu",
    "Naulakallion koulu",
    "Oulunkylän yhteiskoulu",
    "Outamon koulu",
    "Pakilan yläasteen koulu",
    "Pasilan peruskoulu",
    "Pitäjänmäen peruskoulu",
    "Pohjois-Haagan yhteiskoulu",
    "Porolahden peruskoulu",
    "Puistolan peruskoulu",
    "Puistopolun peruskoulu",
    "Pukinmäenkaaren peruskoulu",
    "Ressu Comprehensive School",
    "Ressun peruskoulu",
    "Sakarinmäen peruskoulu",
    "Solakallion koulu",
    "Sophie Mannerheimin koulu",
    "Suomalais-venäläinen koulu",
    "Suutarinkylän peruskoulu",
    "Taivallahden peruskoulu",
    "Toivolan koulu",
    "Torpparinmäen peruskoulu",
    "Töölön yhteiskoulu",
    "Valteri-koulu",
    "Vartiokylän yläasteen koulu",
    "Vesalan peruskoulu",
    "Vuoniityn peruskoulu",
    "Yhtenäiskoulu",
    "Zacharias Topeliusskolan",
    "Åshöjdens grundskola",
    "Östersundom skola",
]


def set_real_schools(apps, schema_editor):
    school_model = apps.get_model("applications", "School")
    with transaction.atomic():
        school_model.objects.all().delete()
        for school in REAL_SCHOOL_LIST:
            school_model.objects.create(name=school)


class Migration(migrations.Migration):

    dependencies = [
        ("applications", "0014_set_default_schools"),
    ]

    operations = [
        migrations.RunPython(set_real_schools, migrations.RunPython.noop),
    ]
