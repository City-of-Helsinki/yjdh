# Staff Admin Permissions

This app provides utilities to automatically manage an "admins" user group and simplify permission setup for staff users in **development environments**.

## Purpose

The main goals are:
1.  To ensure the `admins` group is created during the `post_migrate` process in all environments.
2.  To maintain full CRUD (Create, Read, Update, Delete) permissions for all models registered in the Django Admin in local development.
3.  To automatically assign this group to new staff users (e.g., mock users) during local development to avoid manual configuration.

## Management Command

### `setup_admin_permissions`

This command is responsible for calculating and assigning permissions to the `admins` group.

**Usage:**
```bash
python manage.py setup_admin_permissions
```

**What it does:**
1.  Creates or retrieves the `admins` group.
2.  Scans the Django Admin registry (`admin.site._registry`) to find all registered models.
3.  Collects `add`, `change`, `delete`, and `view` permissions for those models.
4.  Assigns these permissions to the `admins` group.

**When to run:**
- Run this manually whenever you register new models in the Django Admin or need to refresh the permissions for the `admins` group.

## Signals

### 1. `initialize_admins_group` (`post_migrate`)
- **Trigger**: Runs automatically after every `migrate`.
- **Action**: Checks if the `admins` group exists. If not, it creates it.
- **Note**: It does **not** assign permissions. This ensures the group exists so that automated tests or signals don't fail, but avoids the overhead of permissions calculation during every migration.

### 2. `assign_admins_group` (`post_save` on `User`)
- **Trigger**: Runs whenever a `User` is saved.
- **Action**: Checks if the user is newly created and has `is_staff=True`. If so, it adds them to the `admins` group.

## Security Restrictions

> [!WARNING]
> **Automatic Group Assignment is Disabled in Production**

The `assign_admins_group` signal has a strict security check:

- It **ONLY** adds the user to the `admins` group if `settings.AUTO_ASSIGN_ADMIN_TO_STAFF` is `True`.
- This creates a safeguard to prevent staff users from automatically gaining broad administrative privileges in production environments.
