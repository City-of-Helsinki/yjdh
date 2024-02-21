import csv
import datetime
import decimal

import pytest

from applications.services.csv_export_base import CsvExportBase


def check_csv_cell_list_lines_generator(
    csv_export: CsvExportBase, expected_row_count_with_header
):
    assert expected_row_count_with_header >= 1
    lines_generator = csv_export.get_csv_cell_list_lines_generator()

    rows = [next(lines_generator) for _ in range(expected_row_count_with_header)]
    with pytest.raises(StopIteration):
        next(lines_generator)

    for row in rows:
        assert isinstance(row, list)
        for column in row:
            assert isinstance(column, (str, int, decimal.Decimal, datetime.date))

    header_row = rows[0]
    assert header_row == [column.heading for column in csv_export.CSV_COLUMNS]


def check_csv_string_lines_generator(
    csv_export: CsvExportBase, expected_row_count_with_header
):
    assert expected_row_count_with_header >= 1
    lines_generator = csv_export.get_csv_string_lines_generator()

    rows = [next(lines_generator) for _ in range(expected_row_count_with_header)]
    with pytest.raises(StopIteration):
        next(lines_generator)

    default_csv_dialect = csv.get_dialect("excel")

    for row in rows:
        assert isinstance(row, str)
        assert row.endswith(default_csv_dialect.lineterminator)

    header_row = rows[0]
    assert (
        header_row
        == csv_export.CSV_DELIMITER.join(
            (f'"{column.heading}"' for column in csv_export.CSV_COLUMNS)
        )
        + default_csv_dialect.lineterminator
    )
