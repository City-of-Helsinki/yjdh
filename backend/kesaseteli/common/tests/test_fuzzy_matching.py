import unicodedata

import pytest

from common.fuzzy_matching import (
    is_last_name_fuzzy_match_in_full_name,
    normalize_name,
)

# A semi-randomly chosen set of mostly European surnames, e.g.
# https://en.wikipedia.org/wiki/Lists_of_most_common_surnames_in_European_countries
# but also a few others.
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
    ("Mägi", "mägi"),
    # Finnish
    ("Korhonen", "korhonen"),
    ("Mäkinen", "mäkinen"),
    # Hungary
    ("Kovács", "kovacs"),
    ("Török", "török"),
    ("Gál", "gal"),
    # Icelandic
    ("Blöndal", "blöndal"),
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
    ("Öztürk", "özturk"),
    ("Şimşek", "simsek"),
    ("Erdoğan", "erdogan"),
    ("İpcioğlu", "ipcioglu"),
    # Irish
    ("O'Sullivan", "o'sullivan"),
    ("O’Brien", "o'brien"),
    ("Ó Súilleabháin", "o suilleabhain"),
    # Swedish
    ("Åberg", "åberg"),
    ("Österlund", "österlund"),
    # German
    ("Reiß", "reiss"),
    # Vietnamese
    ("Nguyễn", "nguyen"),
    ("Trương", "truong"),
    # Kazakhstan
    ("Ахметов", "ахметов"),
    # Made up combinations, alterations:
    ("Kocïse", "kocise"),
    ("Êriksønsðdahl", "eriksonsddahl"),
    ("Goðrúnarson-Wójcik García—Ó’Conchúir", "godrunarson-wojcik garcia-o'conchuir"),
    ("Goðrúnarson-Æbeltoft", "godrunarson-aebeltoft"),
    ("Lepistö-Åström-Simões", "lepistö-åström-simoes"),
]

NAMES_BEFORE_NORMALIZATION = [
    unnormalized_name for unnormalized_name, _ in NAMES_BEFORE_AND_AFTER_NORMALIZATION
]
NAMES_AFTER_NORMALIZATION = [
    normalized_name for _, normalized_name in NAMES_BEFORE_AND_AFTER_NORMALIZATION
]

# Semi-randomly chosen names that should not change at all when run through
# normalize_name function, e.g.
# https://en.wikipedia.org/wiki/Lists_of_most_common_surnames_in_Asian_countries
UNCHANGED_NAMES = [
    "王",  # Most common Chinese surname, Traditional & Simplified Chinese script
    "張",  # Third most common Chinese surname, Traditional Chinese script
    "张",  # Third most common Chinese surname, Simplified Chinese script
    "김",  # Most common Korean surname in Hangul script
    "金",  # Most common Korean surname in Hanja script
    "佐藤",  # Most common Japanese surname, Kanji script
    "כהן",  # Most common surname in Israel, Hebrew script
    "ბერიძე",  # Most common Georgian surname, Mkhedruli script
    # Already normalized European names:
    "ahsltröm",
    "korhonen",
    "mägi",
    "wojcik",
    "åberg",
]

FALSY_OR_WHITESPACE_VALUES = [None, {}, 0, set(), [], (), "", " " * 10, "\t\r\n   "]


@pytest.mark.parametrize("name, expected_result", NAMES_BEFORE_AND_AFTER_NORMALIZATION)
def test_normalize_name(name, expected_result):
    assert normalize_name(name) == expected_result


@pytest.mark.parametrize("name", UNCHANGED_NAMES)
def test_normalize_name_unchanged(name):
    """
    Test that already normalized names don't change when run through normalize_name.
    """
    assert normalize_name(name) == name


@pytest.mark.parametrize(
    "name",
    NAMES_BEFORE_NORMALIZATION + NAMES_AFTER_NORMALIZATION + UNCHANGED_NAMES,
)
def test_normalize_name_result_is_canonically_composed(name):
    """
    Test that normalize_name function's results are in canonically composed form (=NFC).
    """
    expected_result = unicodedata.normalize("NFC", normalize_name(name))
    assert normalize_name(name) == expected_result
    # Try all the normalization forms listed in
    # https://docs.python.org/3.12/library/unicodedata.html#unicodedata.normalize
    # for input data and test that they all produce NFC output:
    for form in "NFC", "NFD", "NFKC", "NFKD":
        assert normalize_name(unicodedata.normalize(form, name)) == expected_result


@pytest.mark.parametrize(
    "name, expected_result",
    [
        ("  Kï–Êrik \r Wójcik‒O\t  'Neill  \t \n", "ki-erik wojcik-o 'neill"),
        (" \t \r\n  Åberg  \n \t \t", "åberg"),
        ("  John   Doe  ", "john doe"),
    ],
)
def test_normalize_name_with_whitespace(name, expected_result):
    """
    Test that normalize_name removes trailing/leading whitespace and
    compacts consecutive inner whitespace to single space.
    """
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
    """
    Test that normalize_name normalizes dash punctuation to the
    Ascii hyphen minus character (i.e. "-").
    """
    assert normalize_name(f"Côté{dash_punctuation}López") == "cote\N{HYPHEN-MINUS}lopez"


@pytest.mark.parametrize("name", FALSY_OR_WHITESPACE_VALUES)
def test_normalize_name_with_expected_empty_result(name):
    """
    Test that normalize_name returns an empty string for falsy or
    whitespace only input values.
    """
    assert normalize_name(name) == ""


@pytest.mark.parametrize("name", [1, {1}, [1], {1: 1}, (1,), b"1"])
def test_normalize_name_with_invalid_input(name):
    """
    Test that normalize_name raises an error for invalid input.
    """
    with pytest.raises((AttributeError, TypeError)):
        normalize_name(name)


# ---------------------------------------------------------------------------
# is_last_name_fuzzy_match_in_full_name
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("last_name", FALSY_OR_WHITESPACE_VALUES)
def test_is_fuzzy_match_falsy_or_whitespace_last_name(last_name):
    """
    Falsy or whitespace only last name should always match.
    """
    for full_name in ("Mäkelä", None, ""):
        assert is_last_name_fuzzy_match_in_full_name(
            last_name=last_name, full_name=full_name
        )


@pytest.mark.parametrize("full_name", FALSY_OR_WHITESPACE_VALUES)
def test_is_fuzzy_match_falsy_or_whitespace_full_name(full_name):
    """
    Falsy or whitespace only full name should never match a non-empty last name.
    """
    for last_name in ("Åberg", "O"):
        assert not is_last_name_fuzzy_match_in_full_name(
            last_name=last_name, full_name=full_name
        )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("Korhonen", "Korhonen Mikael"),
        ("Korhonen", "korhonen mikael"),
        ("García", "García José"),
        ("García", "garcia jose"),
        ("Ó Súilleabháin", "Ó Súilleabháin Séan"),
        ("Ó Súilleabháin", "o suilleabhain sean"),
        ("Goðrúnarson-Æbeltoft", "Goðrúnarson-Æbeltoft Jón"),
        ("Goðrúnarson-Æbeltoft", "godrunarson-aebeltoft jon"),
    ],
)
def test_is_fuzzy_match_at_start(last_name, full_name):
    """
    Test that last names match at start of full name.
    """
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("Korhonen", "Mikael Korhonen"),
        ("Korhonen", "mikael korhonen"),
        ("Müller", "Hans Müller"),
        ("Müller", "hans muller"),
        ("Barišić", "Ivan Barišić"),
        ("Barišić", "ivan barisic"),
        ("Ó Súilleabháin", "Séan Ó Súilleabháin"),
        ("Ó Súilleabháin", "sean o suilleabhain"),
        ("Goðrúnarson-Æbeltoft", "Jón Goðrúnarson-Æbeltoft"),
        ("Goðrúnarson-Æbeltoft", "jon godrunarson-aebeltoft"),
    ],
)
def test_is_fuzzy_match_at_end(last_name, full_name):
    """
    Test that last names match at end of full name.
    """
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("Smith", "John Smith Doe"),
        ("Côté", "Mary Annabeth Côté Peterson Goðrúnarson-Æbeltoft"),
        ("Goðrúnarson-Æbeltoft", "Török Goðrúnarson-Æbeltoft Côté"),
        ("Korhonen", "Mikael Korhonen Virtanen"),
    ],
)
def test_is_fuzzy_match_no_match_at_middle(last_name, full_name):
    """
    Test that last names don't match at the middle of the full name.
    """
    assert not is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name, expected",
    [
        # --------------------------------------------------------------
        # 1st band: n=1..2, max_dist=0 — exact match required
        # --------------------------------------------------------------
        # Length 1 with 0 edits (Success):
        ("O", "O Neill", True),
        ("O", "Neill O", True),
        # Length 1 with 1 edit (Failure):
        ("O", "On Neill", False),
        ("O", "Neill On", False),
        ("O", "A Neill", False),
        ("O", "Neill A", False),
        # Length 2 with 0 edits (Success):
        ("Li", "Jon Li", True),
        ("Li", "Li Jon", True),
        # Length 2 with 1 edit (Failure):
        ("Li", "Jon La", False),
        ("Li", "La Jon", False),
        ("Li", "Jon Liu", False),
        ("Li", "Liu Jon", False),
        # --------------------------------------------------------------
        # 2nd band: n=3..5, max_dist=1 — one edit allowed
        # --------------------------------------------------------------
        # Length 3 with 0–1 edits (Success):
        ("Gál", "gal john", True),
        ("Gál", "john gal", True),
        ("Gál", "gale john", True),
        ("Gál", "john gale", True),
        ("Gál", "gil john", True),
        ("Gál", "john gil", True),
        # Length 3 with ≥2 edits (Failure):
        ("Gál", "galen john", False),
        ("Gál", "john galen", False),
        ("Gál", "cam john", False),
        ("Gál", "john cam", False),
        # Length 4 with 0–1 edits (Success):
        ("Côté", "cote gil", True),
        ("Côté", "gil cote", True),
        ("Côté", "coten gil", True),
        ("Côté", "gil coten", True),
        ("Côté", "cot gil", True),
        ("Côté", "gil cot", True),
        # Length 4 with ≥2 edits (Failure):
        ("Côté", "goten gil", False),
        ("Côté", "gil goten", False),
        ("Côté", "gate gil", False),
        ("Côté", "gil gate", False),
        # Length 5 with 0–1 edits (Success):
        ("Černý", "cerny anna", True),
        ("Černý", "anna cerny", True),
        ("Černý", "cernyz anna", True),
        ("Černý", "anna cernyz", True),
        ("Černý", "zerny anna", True),
        ("Černý", "anna zerny", True),
        # Length 5 with ≥2 edits (Failure):
        ("Černý", "zerne anna", False),
        ("Černý", "anna zerne", False),
        ("Černý", "carnyn anna", False),
        ("Černý", "anna carnyn", False),
        # --------------------------------------------------------------
        # 3rd band: n≥6, max_dist=2 — two edits allowed
        # --------------------------------------------------------------
        # Length 6 with 0–2 edits (Success):
        ("Müller", "Muller Hans", True),
        ("Müller", "Hans Muller", True),
        ("Müller", "Miller Hans", True),
        ("Müller", "Hans Mullir", True),
        ("Müller", "Millern Hans", True),
        ("Müller", "Hans Millern", True),
        ("Müller", "Muer Hans", True),
        ("Müller", "Hans Muer", True),
        ("Müller", "Mutter Hans", True),
        ("Müller", "Hans Mutter", True),
        ("Ælaß", "aelass", True),  # 0 edits because Æ→ae, ß→ss
        ("Ælaß", "aelas", True),  # 1 edit because Æ→ae, ß→ss
        ("Ælaß", "aela", True),  # 2 edits because Æ→ae, ß→ss
        ("Ælaß", "elas", True),  # 2 edits because Æ→ae, ß→ss
        ("Ælaß", "tepass", True),  # 2 edits because Æ→ae, ß→ss
        # Length 6 with ≥3 edits (Failure):
        ("Müller", "Millerns Hans", False),
        ("Müller", "Hans Millerns", False),
        ("Müller", "Mer Hans", False),
        ("Müller", "Hans Mer", False),
        ("Müller", "Ratler Hans", False),
        ("Müller", "Hans Ratler", False),
        ("Ælaß", "ess", False),  # 3 edits because Æ→ae, ß→ss
        ("Ælaß", "taelassen", False),  # 3 edits because Æ→ae, ß→ss
        ("Ælaß", "tepast", False),  # 3 edits because Æ→ae, ß→ss
        # Over length 6 with 0–2 edits (Success):
        ("Goðrúnarson-Æbeltoft", "godrunarson-aebeltoft", True),
        ("Goðrúnarson-Æbeltoft", "godrunarson-aebeltofte", True),
        ("Goðrúnarson-Æbeltoft", "godrunarson-abeltofte", True),
        ("Goðrúnarson-Æbeltoft", "godrunarson-aebeltoften", True),
        # Over length 6 with ≥3 edits (Failure):
        ("Goðrúnarson-Æbeltoft", "godrunarson-abeltoften", False),
        ("Goðrúnarson-Æbeltoft", "godrunarson-aebeltoftens", False),
    ],
)
def test_is_fuzzy_match_using_edit_distance(last_name, full_name, expected):
    """
    Test that fuzzy match allows specific edit distances based on normalized
    name length.
    """
    assert (
        is_last_name_fuzzy_match_in_full_name(last_name=last_name, full_name=full_name)
        is expected
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("Muller", "Hans Müller"),
        ("Barisic", "Ivan Barišić"),
        ("Wojcik", "Anna Wójcik"),
        ("Sorensen", "Erik Sørensen"),
        ("Yilmaz", "Ahmet Yılmaz"),
    ],
)
def test_is_fuzzy_match_ascii_last_name_unicode_full_name(last_name, full_name):
    """
    Test that last name written without diacritics can match
    a full name with diacritics.
    """
    assert last_name.isascii()
    assert not full_name.isascii()
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("Müller", "Hans Muller"),
        ("Barišić", "Ivan Barisic"),
        ("Wójcik", "Anna Wojcik"),
        ("Sørensen", "Erik Sorensen"),
        ("Yılmaz", "Ahmet Yilmaz"),
    ],
)
def test_is_fuzzy_match_unicode_last_name_ascii_full_name(last_name, full_name):
    """
    Test that last name written with diacritics can match
    a full name without diacritics.
    """
    assert not last_name.isascii()
    assert full_name.isascii()
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        # Multi-word last name matched as first/last word-tokens
        ("Ó Súilleabháin", "Séan Ó Súilleabháin"),
        ("Ó Súilleabháin", "Ó Súilleabháin Séan"),
        ("Ó Súilleabháin", "sean o suilleabhain"),
        ("Ó Súilleabháin", "o suilleabhain sean"),
        # Word-count mismatch: "de la" (2 tokens) typed as "Dela" (1 token);
        # suffix "dela cruz" has levenshtein dist=1 from "de la cruz" ≤ max_dist=2
        ("de la Cruz", "Maria Dela Cruz"),
    ],
)
def test_is_fuzzy_match_word_boundary_success(last_name, full_name):
    """
    Test that multipart last name can match on word boundaries.
    """
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        # Prefixes should not match
        ("Gil", "Gilgamesh Jon"),
        ("Gil", "Jon Gilgamesh"),
        ("Gil", "Jon Gilmore"),
        ("Gil", "Gilmore Jon"),
        # Suffixes should not match
        ("Gil", "Jon Mangil"),
        ("Gil", "Mangil Jon"),
        # Prefixes and suffixes in hyphenated parts should not match
        ("Gil", "Gil-Gil Jon"),
        ("Gil", "Jon Gil-Gil"),
        ("Gil", "Korhonen-Gil Jon"),
        ("Gil", "Jon Korhonen-Gil"),
        ("Gil", "Gil-Korhonen Jon"),
        ("Gil", "Jon Gil-Korhonen"),
    ],
)
def test_is_fuzzy_match_word_boundary_fail(last_name, full_name):
    """
    Test that prefixes and suffixes should not match, taking into account that
    they are distant enough in the allowed edit distance not to match
    simply because of the lax in edit distance.
    """
    assert not is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )


@pytest.mark.parametrize(
    "last_name, full_name",
    [
        ("  Korhonen   ", "mikael korhonen"),
        ("\t\r\nKorhonen\t\r\n", "Mikael Korhonen"),
        ("Korhonen", "Mikael   Korhonen"),
        ("  Ó Súilleabháin \t\n ", "  \t sean   o  \r\n    suilleabhain\n "),
    ],
)
def test_is_fuzzy_match_whitespace_in_inputs(last_name, full_name):
    """
    Test that fuzzy matching works with whitespace.
    """
    assert is_last_name_fuzzy_match_in_full_name(
        last_name=last_name, full_name=full_name
    )
