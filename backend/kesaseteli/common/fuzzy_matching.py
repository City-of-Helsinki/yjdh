import unicodedata

from polyleven import levenshtein

# Normalization mappings for characters that the Unicode canonical
# decomposition (i.e. normal form D / NFD) doesn't split or change:
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

# Characters whose nonspacing marks should not be removed
# in their NFD normalized (i.e. canonically decomposed) form.
#
# Keys of dictionary are the base characters without nonspacing marks,
# values of dictionary are sets containing the protected nonspacing marks
# that should not be removed from the key's base character.
#
# Character and nonspacing mark combinations can be checked from:
# https://www.unicode.org/Public/UNIDATA/UnicodeData.txt
PROTECTED_CHARS: dict[str, set[str]] = {
    "a": {"\N{COMBINING DIAERESIS}", "\N{COMBINING RING ABOVE}"},
    "o": {"\N{COMBINING DIAERESIS}"},
}


def normalize_dash_punctuation(s: str) -> str:
    """
    Normalize all Unicode characters in Dash Punctuation category (Pd)
    to ascii hyphen-minus. Not a perfect mapping, but easy to maintain,
    and should be good enough given the data in production as of February 2026.

    See https://www.compart.com/en/unicode/category/Pd
    """
    return "".join("-" if unicodedata.category(c) == "Pd" else c for c in s)


def remove_nonspacing_marks_except_protected(s: str) -> str:
    """
    Remove all Unicode characters from Nonspacing Mark category (Mn) from string,
    except from the combinations listed in PROTECTED_CHARS.

    See https://www.compart.com/en/unicode/category/Mn
    """
    filtered_chars = []
    prev_ch = None
    for ch in s:
        if unicodedata.category(ch) != "Mn" or (
            prev_ch in PROTECTED_CHARS and ch in PROTECTED_CHARS[prev_ch]
        ):
            filtered_chars.append(ch)
        prev_ch = ch
    return "".join(filtered_chars)


def normalize_name(name) -> str:
    """
    Normalize the given name for ease of comparison.
    Removes case, normalizes dashes & whitespace, removes accents & umlauts and
    other nonspacing marks, except from ä, ö and å—they are special cases.

    >>> normalize_name("Barišić")
    'barisic'
    >>> normalize_name("  John   Doe  ")
    'john doe'
    >>> normalize_name("Goðrúnarson-Æbeltoft")
    'godrunarson-aebeltoft'
    >>> normalize_name("Lepistö-Åström-Simões")
    'lepistö-åström-simoes'

    :param name: Name to normalize, falsy values are interpreted as empty string
    :return: Normalized name, falsy input values return empty string. Always in
        canonically composed Unicode form (a.k.a. NFC).

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
    s = remove_nonspacing_marks_except_protected(s)  # Remove decomposed marks, e.g. ü→u
    s = " ".join(s.split())  # Normalize whitespace & remove leading/trailing whitespace
    s = unicodedata.normalize("NFC", s)  # Canonically compose Unicode chars
    return s


def is_last_name_fuzzy_match_in_full_name(*, last_name, full_name):
    """
    Is last name a fuzzy match of a word-token prefix or suffix of full name?

    Both names are normalized before comparison (see normalize_name). Fuzziness
    tolerance follows Elasticsearch AUTO mode: exact match for 0–2 chars, one edit
    for 3–5 chars, two edits for ≥6 chars. The full name is split on whitespace and
    word-token prefixes and suffixes of increasing length are each compared against
    the last name, so word boundaries are respected.

    :param last_name: Last name to search for. Falsy last name values always match
        any full name.
    :param full_name: Full name to search in. Falsy full name values never match a
        non-empty last name.
    :return: True if the given last name fuzzily matches a word-token prefix or
        suffix of the given full name.

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
    # an increasing number of its words starting from left to the last name, and
    # similarly starting from the right. This is done to respect word boundaries
    # and not allow matches e.g. in the middle of the full name.
    #
    # NOTE: No need to calculate the Levenshtein distance if the strings' lengths are
    # apart enough to make their Levenshtein distance over max_dist anyway.
    long_parts = long.split()
    # Fuzzy match full name's words starting from left to last name:
    for part_count in range(len(long_parts) + 1):
        prefix = " ".join(long_parts[:part_count])
        if abs(len(prefix) - n) <= max_dist and levenshtein(prefix, short) <= max_dist:
            return True
    # Fuzzy match full name's words starting from right to last name:
    for part_count in range(len(long_parts) + 1):
        suffix = " ".join(long_parts[len(long_parts) - part_count :])
        if abs(len(suffix) - n) <= max_dist and levenshtein(suffix, short) <= max_dist:
            return True
    return False
