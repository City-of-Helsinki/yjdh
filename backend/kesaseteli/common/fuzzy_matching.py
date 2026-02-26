import unicodedata

from polyleven import levenshtein

# Characters Unicode canonical decomposition (i.e. normal form D / NFD)
# doesn't split or handle:
NORMALIZE_SPECIAL_CHARS = str.maketrans(
    {
        "\N{LATIN SMALL LETTER AE}": "ae",  # æ U+00E6 → ae U+0061 + U+0065
        "\N{LATIN SMALL LETTER O WITH STROKE}": "o",  # ø U+00F8 → o U+006F
        "\N{LATIN SMALL LETTER DOTLESS I}": "i",  # ı U+0131 → i U+0069
        "\N{LATIN SMALL LETTER D WITH STROKE}": "d",  # đ U+0111 → d U+0064
        "\N{LATIN SMALL LETTER ETH}": "d",  # ð U+00F0 → d U+0064
        "\N{RIGHT SINGLE QUOTATION MARK}": "'",  # ’ U+2019 → ' U+0027
    }
)


def normalize_dash_punctuation(s: str) -> str:
    """
    Normalize all Unicode characters in Dash Punctuation category (Pd)
    to ascii hyphen-minus. Not a perfect mapping, but easy to maintain,
    and should be good enough given the data in production as of February 2026.

    See https://www.compart.com/en/unicode/category/Pd
    """
    return "".join("-" if unicodedata.category(c) == "Pd" else c for c in s)


def remove_nonspacing_marks(s: str) -> str:
    """
    Remove all Unicode characters from Nonspacing Mark category (Mn) from string.

    See https://www.compart.com/en/unicode/category/Mn
    """
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def normalize_name(name) -> str:
    """
    Normalize the given name for ease of comparison.
    Removes case, normalizes dashes & whitespace, removes accents & umlauts.

    >>> normalize_name("Barišić")
    'barisic'
    >>> normalize_name("  John   Doe  ")
    'john doe'
    >>> normalize_name("Goðrúnarson-Æbeltoft")
    'godrunarson-aebeltoft'

    :param name: Name to normalize, falsy values are interpreted as empty string
    :return: Normalized name, falsy input values return empty string

    Sources:
    - Casefolding: https://docs.python.org/3.12/library/stdtypes.html#str.casefold
    - Unicode normalization: https://docs.python.org/3.12/library/unicodedata.html#unicodedata.normalize
    - Dash Punctuation: https://www.compart.com/en/unicode/category/Pd
    - Nonspacing Mark: https://www.compart.com/en/unicode/category/Mn
    - Whitespace normalization: https://docs.python.org/3.12/library/stdtypes.html#str.split
    """
    s = name or ""  # Falsy values, e.g. None or {} → ""
    s = unicodedata.normalize("NFC", s)  # Canonically compose Unicode chars
    s = s.casefold()  # Remove all case distinctions from string, e.g. Ä→ä, ß → ss
    s = s.translate(NORMALIZE_SPECIAL_CHARS)  # Map chars that aren't otherwise handled
    s = normalize_dash_punctuation(s)  # Normalize dashes to the ascii hyphen-minus
    s = unicodedata.normalize("NFD", s)  # Canonically decompose Unicode chars
    s = remove_nonspacing_marks(s)  # Remove decomposed accents etc, e.g. ä→a, ü→u, ñ→n
    s = " ".join(s.split())  # Normalize whitespace & remove leading/trailing whitespace
    return s


def is_last_name_fuzzy_match_in_full_name(*, last_name, full_name):
    """
    Is last name a fuzzy match of a word-token prefix or suffix of full name?

    Both names are normalized before comparison (see normalize_name). Fuzziness
    tolerance follows Elasticsearch AUTO mode: exact match for 1–2 chars, one edit
    for 3–5 chars, two edits for ≥6 chars. The full name is split on whitespace and
    word-token prefixes and suffixes of increasing length are each compared against
    the last name, so word boundaries are respected and multi-word last names are
    handled correctly.

    :param last_name: Last name to search for; falsy values always match
    :param full_name: Full name to search in; falsy never matches a non-empty last name
    :return: True if last_name fuzzily matches word-token prefix or suffix of full_name

    >>> is_last_name_fuzzy_match_in_full_name(last_name="Gil", full_name="Jon Gil")
    True
    >>> is_last_name_fuzzy_match_in_full_name(last_name="Gil", full_name="Gil Jon")
    True
    >>> is_last_name_fuzzy_match_in_full_name(last_name="Gil", full_name="Gilmore Jon")
    False
    >>> is_last_name_fuzzy_match_in_full_name(last_name="Magi", full_name="Mägi Jon")
    True

    Sources:
    - Elasticsearch AUTO fuzziness:
      https://www.elastic.co/docs/reference/elasticsearch/rest-apis/common-options#fuzziness
    """
    short, long = normalize_name(last_name), normalize_name(full_name)
    # Allow similar edit distance as Elasticsearch in AUTO fuzziness mode
    # https://www.elastic.co/docs/reference/elasticsearch/rest-apis/common-options#fuzziness
    n = len(short)
    match n:
        case 0 | 1 | 2:
            max_dist = 0
        case 3 | 4 | 5:
            max_dist = 1
        case _:
            max_dist = 2
    # Split the normalized full name into words on whitespace, and try matching
    # increasing number of its words at last name's start and end.
    #
    # NOTE: No need to calculate the Levenshtein distance if the strings' lengths are
    # apart enough to make their Levenshtein distance over max_dist anyway.
    long_parts = long.split()
    # Fuzzy match word-token prefixes:
    for part_count in range(len(long_parts) + 1):
        prefix = " ".join(long_parts[:part_count])
        if abs(len(prefix) - n) <= max_dist and levenshtein(prefix, short) <= max_dist:
            return True
    # Fuzzy match word-token suffixes:
    for part_count in range(len(long_parts) + 1):
        suffix = " ".join(long_parts[len(long_parts) - part_count :])
        if abs(len(suffix) - n) <= max_dist and levenshtein(suffix, short) <= max_dist:
            return True
    return False
