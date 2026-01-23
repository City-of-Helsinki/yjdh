<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Applications Module](#applications-module)
  - [Summer Voucher Configuration](#summer-voucher-configuration)
    - [Target Groups Management](#target-groups-management)
      - [Adding a New Target Group](#adding-a-new-target-group)
  - [Email Template Handling](#email-template-handling)
    - [File-Based Initialization](#file-based-initialization)
    - [Restoration and Synchronization](#restoration-and-synchronization)
      - [1. Management Command](#1-management-command)
      - [2. Admin Interface Action](#2-admin-interface-action)
      - [3. Reinitialize Selected Templates](#3-reinitialize-selected-templates)
  - [School Management](#school-management)
    - [API Endpoint](#api-endpoint)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Applications Module

This module handles the core logic for youth and employer applications, including configuration and email communication.

## Summer Voucher Configuration

The `SummerVoucherConfiguration` model stores annual configuration settings for the Summer Voucher application process. Key settings include:

-   **Year**: The applicable year for the configuration.
-   **Voucher Value**: The monetary value of the voucher.
-   **Minimum Work Requirements**: Minimum hours and compensation required.
-   **Target Groups**: Defines which youth target groups are active for the year (e.g., specific age ranges or schools).

This configuration is managed via the Django Admin interface and is used to validate incoming applications.

NOTE: The `SummerVoucherConfiguration` model is also initialized via a management command. This is done automatically via the docker entrypoint script.

```shell
python manage.py create_summervoucher_configuration
```

### Target Groups Management

The system supports defining different groups of applicants eligible for the voucher (e.g., specific age groups or student statuses). The logic for these groups is consolidated in [`target_groups.py`](target_groups.py).

#### Adding a New Target Group

1.  Open `applications/target_groups.py`.
2.  Create a new class that inherits from `AbstractTargetGroup`.
3.  Define the required properties:
    *   `name`: The localized user-facing name.
    *   `identifier`: A unique string identifier (e.g., `"new_student_group"`).
4.  Implement the `is_valid` method to define the eligibility logic (e.g., age checks, residency).

**Example:**
```python
class VocationalStudentTargetGroup(AbstractTargetGroup):
    name = _("Vocational Student")
    identifier = "vocational_student"

    def is_valid(self, application):
        return application.age == 18 and application.is_helsinkian
```

> [!WARNING]
> The `identifier` string is stored directly in the database to link vouchers to their target group. **Changing an existing class's identifier will break data integrity** for historical records. If you need to rename an identifier, a database migration is required.


## Email Template Handling

The system uses the `EmailTemplate` model to manage localized email content sent to applicants and employers.

### File-Based Initialization

Templates are initially defined as HTML files in `applications/templates/email/`. Each template corresponds to a type (e.g., `activation`, `processing`) and a language (`fi`, `sv`, `en`).

### Restoration and Synchronization

Because templates are stored in the database but sourced from files, a restoration mechanism is available to ensure the database matches the file system.

#### 1. Management Command
Use the following command to create missing templates and populate them with content from the corresponding files:

```bash
python manage.py ensure_email_templates
```

#### 2. Admin Interface Action
Administrators can trigger the restoration process directly from the Django Admin:
1.  Navigate to **Applications** > **Email Templates**.
2.  Click the **"Reproduce Missing Templates"** button at the top of the list.

Both methods use the `EmailTemplateService.ensure_templates_exist()` method to scan for all supported type/language combinations and create any that are missing.

#### 3. Reinitialize Selected Templates

To update existing templates with the latest content from the file system (e.g., after a code deployment):
1.  Navigate to **Applications** > **Email Templates**.
2.  Select the templates you wish to update using the checkboxes.
3.  Choose **"Reinitialize selected templates from file"** from the **Action** dropdown menu.
4.  Click **Go**.

### Validation and Preview

To ensure email quality and prevent errors:

1.  **Syntax Validation**: The system validates template syntax (Jinja2/Django) whenever an Email Template is saved. If the syntax is invalid (e.g., unclosed tags), the save is blocked and an error is displayed.
2.  **Preview Feature**: A **"Preview"** button is available on the Email Template change form. Clicking this opens a new window showing the rendered email populated with realistic mock data (e.g., test names, dates, links), allowing administrators to verify the layout and variable usage.
3.  **Send Test Email**: An admin action **"Send selected email templates to me"** is available in the Email Template list view. This allows administrators to verify the final email delivery by sending the rendered template (with mock data) to their own email address.

## School Management

The `School` model stores the list of schools available for selection in youth applications. The **School Admin** interface allows administrators to:

-   View the list of schools.
-   Search schools by name.
-   Filter schools by creation and modification dates.
-   Add or remove schools as needed.

### Import Schools

Administrators with sufficient permissions (add permission for School model) can bulk import schools via the Admin interface.

1.  Navigate to **Applications** > **Schools**.
2.  Click the **"Import Schools"** button.
3.  Enter the names of the schools in the text area, one per line.
4.  Click **Import**.

The system will skip any schools that already exist in the database (matching by exact name) and only create new ones.

### API Endpoint

Frontend clients can retrieve the list of available schools using the following endpoint:

-   **URL**: `/v1/schools/`
-   **Method**: `GET`
-   **Description**: Returns a list of all schools, sorted by name using Finnish collation rules.

## Youth Summer Vouchers

The `YouthSummerVoucher` model represents the actual voucher assigned to a youth applicant.

### Resend Summer Voucher

In cases where a youth needs their voucher email resent (e.g., accidental deletion or email delivery issues), administrators can trigger a resend from the admin interface.

1.  Navigate to **Applications** > **Youth Summer Vouchers**.
2.  Select the vouchers you wish to resend using the checkboxes.
3.  Choose **"Resend summer voucher to selected applicants and to the handler"** from the **Action** dropdown menu.
4.  Click **Go**.

The system will attempt to resend the voucher email to the youth's email address and report the number of successful and failed attempts.

