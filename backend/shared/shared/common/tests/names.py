ARABIC_NAME = "حَسَّان"  # Ḥassān (benefactor) in Arabic
CHINESE_NAME = "慧芬"  # Huì Fēn (wise scent) in Mandarin Chinese
ESTONIAN_NAME = "Õras"
FINNISH_NAME = "Matti Meikäläinen"
GERMAN_NAME = "Strauß Jünemann"
HEBREW_NAME = "אברהם"  # Abraham (father of many) in Hebrew
ICELANDIC_FEMALE_NAME = "María Kristín Þorkelsdóttir"
ICELANDIC_MALE_NAME = "Ingólfur Álfheiður"
RUSSIAN_NAME = "Мельник"  # Melnik (miller) in Russian
SHORT_CHINESE_NAME = "王"  # Wáng (king) in Mandarin Chinese
SPANISH_NAME = "Peña"
SWEDISH_NAME = "Åse-Marie Öllegård"
THAI_NAME = "อาทิตย์"  # Arthit (sun) in Thai
TURKISH_NAME = "Ümit"  # Ümit (hope) in Turkish

VALID_NAMES = [
    # should match Finnish first names, last names and full names
    "Helinä",
    "Aalto",
    "Kalle Väyrynen",
    "Janne Ö",
    # should match Swedish first names, last names and full names
    "Gun-Britt",
    "Lindén",
    "Ögge Ekström",
    # should match English first names, last names and full names
    "Eric",
    "Bradtke",
    "Daniela O'Brian",
    # should match special characters
    "!@#$%^&*()_+-=[]{}|;':\",./<>?",
    # should match digits
    "1234567890",
    # should match more languages than just Finnish, Swedish, English
    ARABIC_NAME,
    CHINESE_NAME,
    ESTONIAN_NAME,
    FINNISH_NAME,
    GERMAN_NAME,
    HEBREW_NAME,
    ICELANDIC_FEMALE_NAME,
    ICELANDIC_MALE_NAME,
    RUSSIAN_NAME,
    SHORT_CHINESE_NAME,
    SPANISH_NAME,
    SWEDISH_NAME,
    THAI_NAME,
    TURKISH_NAME,
]

INVALID_NAMES = [
    "",
    " ",
    "\t",
    "\r",
    "\n",
    "\r\n",
    " \t\r\n  ",
]
