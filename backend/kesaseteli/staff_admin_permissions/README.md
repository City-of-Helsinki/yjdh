<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Staff Admin Permissions](#staff-admin-permissions)
  - [Purpose](#purpose)
  - [Management Command](#management-command)
    - [`setup_admin_permissions`](#setup_admin_permissions)
  - [Signals](#signals)
    - [1. `initialize_admins_group` (`post_migrate`)](#1-initialize_admins_group-post_migrate)
    - [2. `assign_admins_group` (`post_save` on `User`)](#2-assign_admins_group-post_save-on-user)
  - [Security Restrictions](#security-restrictions)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Staff Admin Permissions

This app provides utilities to automatically manage a configurable admin user group (default `None`) and simplify permission setup for staff users in **development environments**.

## Purpose

The main goals are:
1.  To ensure the admin group (configured via `AD_ADMIN_GROUP_NAME`) is created during the `post_migrate` process in all environments.
2.  To maintain full CRUD (Create, Read, Update, Delete) permissions for all models registered in the Django Admin in local development.
3.  To automatically assign this group to new staff users (e.g., mock users) during local development to avoid manual configuration.

## Management Command

### `setup_admin_permissions`

This command is responsible for calculating and assigning permissions to the admin group.

**Usage:**
```bash
python manage.py setup_admin_permissions
```

**What it does:**
1.  Creates or retrieves the admin group (default `None`).
2.  Scans the Django Admin registry (`admin.site._registry`) to find all registered models.
3.  Collects `add`, `change`, `delete`, and `view` permissions for those models.
4.  Assigns these permissions to the admin group.

**When to run:**
- Run this manually whenever you register new models in the Django Admin or need to refresh the permissions for the admin group.

## Signals

### 1. `initialize_admins_group` (`post_migrate`)
- **Trigger**: Runs automatically after every `migrate`.
- **Action**: Checks if the admin group exists. If not, it creates it.
- **Note**: It does **not** assign permissions. This ensures the group exists so that automated tests or signals don't fail, but avoids the overhead of permissions calculation during every migration.

### 2. `assign_admins_group` (`post_save` on `User`)
- **Trigger**: Runs whenever a `User` is saved.
- **Action**: Checks if the user is newly created and has `is_staff=True`. If so, it adds them to the admin group (default `None`).

## Security Restrictions

> [!WARNING]
> **Automatic Group Assignment is Disabled in Production**

The `assign_admins_group` signal has a strict security check:

- It **ONLY** adds the user to the admin group if `settings.AUTO_ASSIGN_ADMIN_TO_STAFF` is `True`.
- This creates a safeguard to prevent staff users from automatically gaining broad administrative privileges in production environments.
