from typing import Optional


def get_contact_person_configuration(
    first_name: str = None,
    last_name: str = None,
    company: str = None,
    email: str = None,
    phone: str = None,
    contact_type: str = None,
) -> Optional[dict]:
    """Get contact person configuration. TESTING"""
    if not (first_name and last_name and email and contact_type):
        return None

    cp = {
        "given_name": first_name,
        "sur_name": last_name,
        "company": company,
        "phone": phone,
        "email_address": email,
        "contact_type": contact_type,
    }

    return {k: v for k, v in cp.items() if v}
