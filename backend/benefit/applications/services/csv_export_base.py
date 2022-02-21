import csv
import datetime
import decimal
import operator
from dataclasses import dataclass
from io import StringIO
from typing import Any, Callable, Union

from applications.enums import OrganizationType

NO_DEFAULT_VALUE = object()


@dataclass
class CsvColumn:
    heading: str
    cell_data_source: Union[Callable, str]
    formatter: Union[Callable, None] = None
    default_value: Any = NO_DEFAULT_VALUE


def get_organization_type(application):
    return str(
        OrganizationType.resolve_organization_type(application.company.company_form)
    )


def nested_queryset_attr(
    related_name, queryset_idx, nested_attr_name, default_value=""
):
    """
    Return a function that:
    * takes an "item" object as a parameter
      "item" should be an object with an RelatedManager attribute named related_name
    * returns item.attr_name[idx].nested_attr_name
    * In case the attribute is missing, return the default value
    * dotted attribute access (like "a.b" is supported for attr_name and nested_attr_name
    """

    def getter(item):
        try:
            nested_obj = operator.attrgetter(related_name)(item).all()[queryset_idx]
            return operator.attrgetter(nested_attr_name)(nested_obj)
        except (
            AttributeError,
            IndexError,
        ):
            return default_value

    return getter


class CsvExportBase:
    """
    Common code for CSV export interfaces.

    Classes deriving from CsvExportBase need to define:
    * CSV_COLUMNS: a list of CsvColumn objects
    * get_row_items: a function that returns a sequence of any objects. These objects
      must be compatible with the CsvColumn.cell_data_source (see get_csv_lines)
    """

    CSV_DELIMITER = ";"
    FILE_ENCODING = "utf-8"

    def _get_header_row(self):
        return [col.heading for col in self.CSV_COLUMNS]

    def write_csv_file(self, path):
        csv_string = self.get_csv_string()
        with open(path, encoding=self.FILE_ENCODING, mode="w") as f:
            f.write(csv_string)

    def get_csv_string(self):
        return self._make_csv(self.get_csv_lines())

    def get_csv_lines(self):
        """
        Iterate through the objects returned by get_row_items. Use the CsvColumn objects in CSV_COLUMNS to
        construct a CSV row from each item. Notes:
        * If cell_data_source is callable, then each item is passed as a paremeter to it,
          and the resulting value is used to construct the CSV cell value
        * if cell_data_source is a string, then it is treated as a dotted attribute reference (like "x" or "a.b")
          and the corresponding attribute should be found in the item
        """
        lines = [self._get_header_row()]
        for item in self.get_row_items():
            line = []
            for column in self.CSV_COLUMNS:
                if callable(column.cell_data_source):
                    cell_value = column.cell_data_source(item)
                else:
                    cell_value = None
                    try:
                        cell_value = operator.attrgetter(column.cell_data_source)(item)
                    except AttributeError:
                        if column.default_value is NO_DEFAULT_VALUE:
                            raise

                if cell_value is None and column.default_value is not NO_DEFAULT_VALUE:
                    cell_value = column.default_value

                if column.formatter:
                    # most common case: a dotted property like company.name
                    cell_value = column.formatter(cell_value)
                if not isinstance(
                    cell_value, (str, int, decimal.Decimal, datetime.date)
                ):
                    raise ValueError("Invalid type in CSV export")
                line.append(cell_value)
            lines.append(line)
        return lines

    def _make_csv(self, lines):
        if len(lines) == 0:
            return ""
        first_length = len(lines[0])
        assert all([len(line) == first_length for line in lines])

        io = StringIO()
        csv_writer = csv.writer(
            io, delimiter=self.CSV_DELIMITER, quoting=csv.QUOTE_NONNUMERIC
        )
        for line in lines:
            csv_writer.writerow(line)

        return io.getvalue()
