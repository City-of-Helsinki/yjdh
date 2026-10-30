from weasyprint import HTML


def string_to_pdf(input: str) -> bytes:
    return HTML(string=input).write_pdf()
