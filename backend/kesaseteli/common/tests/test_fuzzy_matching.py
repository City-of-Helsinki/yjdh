import pytest

from common.fuzzy_matching import (
    is_last_name_fuzzy_match_in_full_name,
    normalize_name,
)

# A semi-randomly chosen set of European surnames, e.g.
# https://en.wikipedia.org/wiki/Lists_of_most_common_surnames_in_European_countries
NAMES_BEFORE_AND_AFTER_NORMALIZATION = [
    # Spanish
    ("García", "garcia"),
    ("Fernández", "fernandez"),
    ("López", "lopez"),
    ("Álvarez", "alvarez"),
    ("Muñoz", "munoz"),
    ("Gutiérrez", "gutierrez"),
    ("Gil", "gil"),
    # French
    ("Côté", "cote"),
    ("Gagné", "gagne"),
    ("Lefèvre", "lefevre"),
    ("François", "francois"),
    # Moldova
    ("Țurcan", "turcan"),
    ("Guțu", "gutu"),
    # Austria
    ("Müller", "muller"),
    # Bosniaks
    ("Hodžić", "hodzic"),
    ("Čengić", "cengic"),
    ("Delić", "delic"),
    # Serbs
    ("Kovačević", "kovacevic"),
    ("Đurić", "duric"),
    ("Božić", "bozic"),
    # Croatia
    ("Barišić", "barisic"),
    # Czech Republic
    ("Novotný", "novotny"),
    ("Dvořák", "dvorak"),
    ("Černý", "cerny"),
    # Danish
    ("Sørensen", "sorensen"),
    ("Æbeltoft", "aebeltoft"),
    ("Rokkjær", "rokkjaer"),
    # Estonian
    ("Mägi", "magi"),
    # Finnish
    ("Korhonen", "korhonen"),
    ("Mäkinen", "makinen"),
    # Hungary
    ("Kovács", "kovacs"),
    ("Török", "torok"),
    ("Gál", "gal"),
    # Icelandic
    ("Blöndal", "blondal"),
    ("Norðdahl", "norddahl"),
    ("Goðrúnarson", "godrunarson"),
    ("Rúnarsdóttir", "runarsdottir"),
    # Latvian
    ("Bērziņš", "berzins"),
    ("Pētersons", "petersons"),
    ("Kārkliņš", "karklins"),
    # Polish
    ("Wójcik", "wojcik"),
    ("Dąbrowski", "dabrowski"),
    # Portugal
    ("Simões", "simoes"),
    # Slovakia
    ("Kováč", "kovac"),
    ("Tóth", "toth"),
    # Turkey
    ("Yılmaz", "yilmaz"),
    ("Şahin", "sahin"),
    ("Çelik", "celik"),
    ("Yıldırım", "yildirim"),
    ("Öztürk", "ozturk"),
    ("Şimşek", "simsek"),
    ("Erdoğan", "erdogan"),
    ("İpcioğlu", "ipcioglu"),
    # Irish
    ("O'Sullivan", "o'sullivan"),
    ("O’Brien", "o'brien"),
    ("Ó Súilleabháin", "o suilleabhain"),
    # Swedish
    ("Åberg", "aberg"),
    ("Österlund", "osterlund"),
    # German
    ("Reiß", "reiss"),
    # Made up combinations, alterations:
    ("Kocïse", "kocise"),
    ("Êriksønsðdahl", "eriksonsddahl"),
    ("Goðrúnarson-Wójcik García—Ó’Conchúir", "godrunarson-wojcik garcia-o'conchuir"),
    ("Goðrúnarson-Æbeltoft", "godrunarson-aebeltoft"),
]

FALSY_OR_WHITESPACE_VALUES = [None, {}, 0, set(), [], (), "", " " * 10, "\t\r\n   "]


@pytest.mark.parametrize("name, expected_result", NAMES_BEFORE_AND_AFTER_NORMALIZATION)
def test_normalize_name(name, expected_result):
    assert normalize_name(name) == expected_result


@pytest.mark.parametrize(
    "name, expected_result",
    [
        ("  Kï–Êrik \r Wójcik‒O\t  'Neill  \t \n", "ki-erik wojcik-o 'neill"),
        (" \t \r\n  Åberg  \n \t \t", "aberg"),
        ("  John   Doe  ", "john doe"),
    ],
)
def test_normalize_name_with_whitespace(name, expected_result):
    assert normalize_name(name) == expected_result


@pytest.mark.parametrize(
    "dash_punctuation",
    [
        "\N{HYPHEN-MINUS}",
        "\N{HYPHEN}",
        "\N{NON-BREAKING HYPHEN}",
        "\N{FIGURE DASH}",
        "\N{EN DASH}",
        "\N{EM DASH}",
        "\N{HORIZONTAL BAR}",
        "\N{TWO-EM DASH}",
        "\N{THREE-EM DASH}",
        "\N{SMALL EM DASH}",
        "\N{SMALL HYPHEN-MINUS}",
        "\N{FULLWIDTH HYPHEN-MINUS}",
    ],
)
def test_normalize_name_with_dash_punctuation(dash_punctuation):
    assert normalize_name(f"Côté{dash_punctuation}López") == "cote\N{HYPHEN-MINUS}lopez"


@pytest.mark.parametrize("name", FALSY_OR_WHITESPACE_VALUES)
def test_normalize_name_with_expected_empty_result(name):
    assert normalize_name(name) == ""


@pytest.mark.parametrize("name", [1, {1}, [1], {1: 1}, (1,), b"1"])
def test_normalize_name_with_invalid_input(name):
    with pytest.raises(AttributeError):
        normalize_name(name)


# ---------------------------------------------------------------------------
# is_last_name_fuzzy_match_in_full_name
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("last_name", FALSY_OR_WHITESPACE_VALUES)
def test_is_fuzzy_match_falsy_or_whitespace_last_name(last_name):
    """
    Falsy or whitespace only last name should always match.
    """
    for full_name in ["Goðrúnarson-Æbeltoft", "Zu", "Mäkelä", None, ""]:
        assert is_last_name_fuzzy_match_in_full_name(
            last_name=last_name, full_name=full_name
        )


@pytest.mark.parametrize("full_name", FALSY_OR_WHITESPACE_VALUES)
def test_is_fuzzy_match_falsy_or_whitespace_full_name(full_name):
    """
    Falsy or whitespace only full name should never match a non-empty last name.
    """
    for last_name in ["Goðrúnarson-Æbeltoft", "Zu", "Mäkelä"]:
        assert not is_last_name_fuzzy_match_in_full_name(
            last_name=last_name, full_name=full_name
        )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("Korhonen", "Korhonen Mikael"),  # Finnish
        ("García", "García José"),  # Spanish, acute accent
        ("Ó Súilleabháin", "Ó Súilleabháin Séan"),  # Irish, multi-word
        ("Goðrúnarson-Æbeltoft", "Goðrúnarson-Æbeltoft Jón"),  # hyphenated
    ],
)
def test_is_fuzzy_match_exact_at_start(last_name, full_name):
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("Korhonen", "Mikael Korhonen"),  # Finnish
        ("Müller", "Hans Müller"),  # German, umlaut
        ("Barišić", "Ivan Barišić"),  # Croatian, háček
        ("Ó Súilleabháin", "Séan Ó Súilleabháin"),  # Irish, multi-word
        ("Goðrúnarson-Æbeltoft", "Jón Goðrúnarson-Æbeltoft"),  # hyphenated
    ],
)
def test_is_fuzzy_match_exact_at_end(last_name, full_name):
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        # Last name only in the middle, not at start or end
        ("Smith", "John Smith Doe"),
        ("Korhonen", "Mikael Korhonen Virtanen"),
        # Completely different name at both ends
        ("García", "Jon Korhonen"),
        ("Müller", "Jan Novotný"),
    ],
)
def test_is_fuzzy_match_no_match(last_name, full_name):
    assert not is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name, expected",
    [
        # Band 0: n=1..2, max_dist=0 — exact match required
        ("Li", "Jon Li", True),  # n=2, dist=0 ≤ 0
        ("Li", "Jon Liu", False),  # n=2, levenshtein("liu","li")=1 > 0
        # Band 1: n=3..5, max_dist=1 — one edit allowed
        ("Gil", "Jon Gil", True),  # n=3, dist=0 ≤ 1 at end
        ("Gil", "Gil Jon", True),  # n=3, dist=0 ≤ 1 at start
        ("Gil", "Gal Smith", True),  # n=3, dist=1 ≤ 1 at start
        ("Gil", "Jon Gal", True),  # n=3, dist=1 ≤ 1 at end
        ("Gil", "Jon Foo", False),  # n=3, dist=3 > 1 at any point
        ("Magi", "Mägi Jon", True),  # n=4, dist=0 after normalization at start
        ("Smith", "Smyth Jones", True),  # n=5, dist=1 ≤ 1 at start (y→i)
        ("Smith", "Jon Smyth", True),  # n=5, dist=1 ≤ 1 at end
        ("Smith", "Jon Smiley", False),  # n=5, levenshtein("smiley","smith")=3 > 1
        # Band 2: n≥6, max_dist=2 — two edits allowed
        ("Müller", "Mullar Hans", True),  # n=6, dist=1 ≤ 2 at start (a→e)
        ("Müller", "Millar Hans", True),  # n=6, dist=2 ≤ 2 at start (i→u, a→e)
        ("Müller", "Hans Kovács", False),  # n=6, dist=6 > 2 at both ends
    ],
)
def test_is_fuzzy_match_fuzziness_bands(last_name, full_name, expected):
    assert (
        is_last_name_fuzzy_match_in_full_name(last_name=last_name, full_name=full_name)
        is expected
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("Muller", "Hans Müller"),  # typed without umlaut
        ("Barisic", "Ivan Barišić"),  # typed without háček
        ("Wojcik", "Anna Wójcik"),  # typed without ogonek
        ("Sorensen", "Erik Sørensen"),  # typed without ø
        ("Yilmaz", "Ahmet Yılmaz"),  # typed without dotless i
    ],
)
def test_is_fuzzy_match_ascii_last_name_unicode_full_name(last_name, full_name):
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("Müller", "Hans Muller"),  # typed without umlaut
        ("Barišić", "Ivan Barisic"),  # typed without háček
        ("Wójcik", "Anna Wojcik"),  # typed without ogonek
        ("Sørensen", "Erik Sorensen"),  # typed without ø
        ("Yılmaz", "Ahmet Yilmaz"),  # typed without dotless i
    ],
)
def test_is_fuzzy_match_unicode_last_name_ascii_full_name(last_name, full_name):
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        # ß expands to ss: normalize_name("Reiß") = "reiss" so n=5, not 4
        ("Reiß", "Hans Reiß"),  # both unicode, dist=0
        ("Reiss", "Hans Reiß"),  # typed ASCII form vs unicode stored, dist=0
        ("Reis", "Hans Reiß"),  # one char short of expansion: n=4, max_dist=1, dist=1≤1
        # æ expands to ae: normalize_name("Æbeltoft") = "aebeltoft" so n=9, not 8
        ("Æbeltoft", "Jón Æbeltoft"),  # both unicode, dist=0
        ("Aebeltoft", "Jón Æbeltoft"),  # typed ae form vs unicode stored, dist=0
    ],
)
def test_is_fuzzy_match_length_expanding_normalization(last_name, full_name):
    # ß→ss and æ→ae expand the normalized length beyond the raw Unicode char count;
    # n is computed from the normalized form so the fuzziness budget is always correct
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name, expected",
    [
        # Character-prefix of a word — the word-token loop respects word boundaries
        ("Gil", "Gilgamesh Jon", False),
        ("Gil", "Jon Gilgamesh", False),
        # Character-suffix of a word — the word-token loop respects word boundaries
        ("Gil", "Jon Gilmore", False),
        ("Gil", "Gilmore Jon", False),
        # Multi-word last name matched as last k word-tokens
        ("Ó Súilleabháin", "Séan Ó Súilleabháin", True),
        # Word-count mismatch: "de la" (2 tokens) typed as "Dela" (1 token);
        # suffix "dela cruz" has levenshtein dist=1 from "de la cruz" ≤ max_dist=2
        ("de la Cruz", "Maria Dela Cruz", True),
    ],
)
def test_is_fuzzy_match_word_boundary(last_name, full_name, expected):
    assert (
        is_last_name_fuzzy_match_in_full_name(last_name=last_name, full_name=full_name)
        is expected
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        # Leading/trailing whitespace on last_name must not inflate n
        ("  Korhonen  ", "Mikael Korhonen"),
        ("\t\r\nKorhonen\t\r\n", "Mikael Korhonen"),
        # Internal multiple spaces in full_name must collapse before matching
        ("Korhonen", "Mikael   Korhonen"),
        # Both sides have excess whitespace, including multi-word last name
        ("  Ó Súilleabháin  ", "  Séan   Ó Súilleabháin  "),
    ],
)
def test_is_fuzzy_match_whitespace_in_inputs(last_name, full_name):
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("Goðrúnarson-Æbeltoft", "Jón Emil Goðrúnarson-Æbeltoft"),  # at end
        ("Goðrúnarson-Æbeltoft", "Goðrúnarson-Æbeltoft Auer Jón"),  # at start
        ("Wójcik-Goðrúnarson", "Anna Gustavson Wójcik-Goðrúnarson"),  # at end
    ],
)
def test_is_fuzzy_match_compound_hyphenated_names(last_name, full_name):
    # Hyphenated names are one token after normalization; matched as a single word-token
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )
