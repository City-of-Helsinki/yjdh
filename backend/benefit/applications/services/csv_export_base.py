import csv
import datetime
import decimal
import operator
from dataclasses import dataclass
from io import StringIO
from typing import Any, Callable, Generator, List, Union

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
        OrganizationType.resolve_organization_type(
            application.company.company_form_code
        ).label
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
      must be compatible with the CsvColumn.cell_data_source (see get_csv_cell_list_lines_generator)
    """

    CSV_DELIMITER = ";"
    FILE_ENCODING = "utf-8"

    def _get_header_row(self) -> List[str]:
        return [col.heading for col in self.CSV_COLUMNS]

    def write_csv_file(self, path) -> None:
        csv_string = self.get_csv_string()
        with open(path, encoding=self.FILE_ENCODING, mode="w") as f:
            f.write(csv_string)

    def get_csv_string(self, remove_quotes: bool = False) -> str:
        return "".join(  # Lines end with '\r\n' already so no need to add newlines here
            self.get_csv_string_lines_generator(
                remove_quotes=remove_quotes, add_bom=True
            )
        )

    def get_csv_cell_list_lines_generator(
        self,
    ) -> Generator[List[Union[str, int, decimal.Decimal, datetime.date]], None, None]:
        """
        Iterate through the objects returned by get_row_items. Use the CsvColumn objects in CSV_COLUMNS to
        construct a CSV row from each item. Notes:
        * If cell_data_source is callable, then each item is passed as a paremeter to it,
          and the resulting value is used to construct the CSV cell value
        * if cell_data_source is a string, then it is treated as a dotted attribute reference (like "x" or "a.b")
          and the corresponding attribute should be found in the item
        """
        yield self._get_header_row()
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
            yield line

    def get_csv_string_lines_generator(
        self, remove_quotes: bool = False, add_bom: bool = False
    ) -> Generator[str, None, None]:
        """
        Generate CSV's string lines using self.get_csv_cell_list_lines_generator().

        :return: Generator which generates list of strings that each end with '\r\n'.
        Passing remove_quotes=True will disable quoting of values as it is required by the Talpa integration.
        Passing add_bom=True will add a BOM (Byte Order Mark) at the beginning of the file.
        """
        quoting = csv.QUOTE_NONE if remove_quotes else csv.QUOTE_NONNUMERIC

        io = StringIO()
        csv_writer = csv.writer(io, delimiter=self.CSV_DELIMITER, quoting=quoting)
        line_length_set = set()

        # Add BOM as the first item in the generator
        if add_bom:
            yield "\ufeff"

        for line in self.get_csv_cell_list_lines_generator():
            line_length_set.add(len(line))
            assert len(line_length_set) == 1, (
                "Each CSV line must have same column count"
            )
            csv_writer.writerow(line)
            yield io.getvalue()
            # Reset StringIO object
            io.truncate(0)
            io.seek(0)
