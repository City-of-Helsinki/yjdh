# -*- coding: utf-8 -*-
# snapshottest: v1 - https://goo.gl/zC4yUc
from __future__ import unicode_literals

from snapshottest import Snapshot

snapshots = Snapshot()

snapshots["test_generate_composed_template_html 1"] = [
    "Liite 1 Helsinki-lisä 2021 koontiliite yhteisöille mallipohja julkinen.pdf",
    "Helsinki-lisä 2021 koontiliite yhteisöille mallipohja salassa pidettävä.pdf",
    "Helsinki-lisä 2021 kielteiset päätökset hakijakohtainen mallipohja 125010-125010 salassa pidettävä.pdf",
    "Helsinki-lisä 2021 kielteiset päätökset koontiliite yrityksille 125010-125010 mallipohja salassa pidettävä.pdf",
]

snapshots[
    "test_generate_single_template_html[oy-False] 1"
] = """<!doctype html>

<html lang="fi">
<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
<head>
    <title>Ahjo PDF</title>
    <style>
    table, td, th {
        border: 1px solid black;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        text-align: center;
    }
    body {
        font-family: Arial, sans-serif;
    }
    </style>
</head>
<body>

<h1>Työllisyydenhoidon Helsinki-lisän myöntäminen yrityksille vuonna 2021, hakemus nro
    Y125007</h1>
<table aria-label="AHJO report""AHJO report" style="border: 1px solid black">
    <tr>
    <th scope="col">Hakemus-numero</th>
    <th scope="col">Hakija</th>
    <th scope="col">Y-tunnus</th>
    <th scope="col">Työllistetyn sukunimi</th>
    <th scope="col">Työllistetyn etunimi</th>
    <th scope="col">Alkaa</th>
    </tr>
    <tr>
        <td>Y125007</td>
        <td>Wind.</td>
        <td>4831990-7</td>
        <td>Paula</td>
        <td>Smith</td>
        <td>2021-10-17</td>
    </tr>
</table>

</body>
</html>"""

snapshots[
    "test_generate_single_template_html[oy-True] 1"
] = """<!doctype html>

<html lang="fi">
<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
<head>
    <title>Ahjo PDF</title>
    <style>
    table, td, th {
        border: 1px solid black;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        text-align: center;
    }
    body {
        font-family: Arial, sans-serif;
    }
    </style>
</head>
<body>

    <h1>Työllisyydenhoidon Helsinki-lisän myöntäminen yrityksille vuonna 2021, hakemus nro
        Y125008</h1>
    <table aria-label="AHJO report""AHJO report" style="border: 1px solid black">
        <tr>
        <th scope="col">Hakemus-numero</th>
        <th scope="col">Hakija</th>
        <th scope="col">Y-tunnus</th>
        <th scope="col">Työllistetyn sukunimi</th>
        <th scope="col">Työllistetyn etunimi</th>
        <th scope="col">Alkaa</th>
        </tr>
        <tr>
            <td>Y125008</td>
            <td>Wind.</td>
            <td>4831990-7</td>
            <td>Paula</td>
            <td>Smith</td>
            <td>2021-10-17</td>
        </tr>
    </table>

    <p>Tämän päätöksen suoma tuki myönnetään vähämerkityksisenä eli ns. de minimis -tukena. Tuen myöntämisessä noudatetaan komission asetusta (EU) 1407/2013, 24.12.2013, perustamissopimuksen 107 ja 108 artiklan soveltamisesta vähämerkityksiseen tukeen (EUVL nro L352, 24.12.2013).</p>

</body>
</html>"""

snapshots[
    "test_generate_single_template_html[ry-False] 1"
] = """<!doctype html>

<html lang="fi">
<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
<head>
    <title>Ahjo PDF</title>
    <style>
    table, td, th {
        border: 1px solid black;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        text-align: center;
    }
    body {
        font-family: Arial, sans-serif;
    }
    </style>
</head>
<body>


    <h1>Työllisyydenhoidon Helsinki-lisän myöntäminen yhteisöille vuonna 2021, hakemus nro
        R125006</h1>
    <table style="border: 1px solid black">
        <caption></caption>
        <tr>
            <th scope="col">Hakemus-numero</th>
            <th scope="col">Hakija</th>
            <th scope="col">Y-tunnus</th>
            <th scope="col">Työllistetyn sukunimi</th>
            <th scope="col">Työllistetyn etunimi</th>
            <th scope="col">Alkaa</th>
        </tr>
        <tr>
            <td>R125006</td>
            <td>Wind.</td>
            <td>4831990-7</td>
            <td>Paula</td>
            <td>Smith</td>
            <td>2021-10-17</td>
        </tr>
    </table>


</body>
</html>"""
