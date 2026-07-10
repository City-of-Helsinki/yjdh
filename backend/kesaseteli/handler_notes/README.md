<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Handler Notes](#handler-notes)
  - [Table of Contents](#table-of-contents)
  - [Core Concept](#core-concept)
  - [Relations to Key Models](#relations-to-key-models)
  - [Django Generic Relations Details](#django-generic-relations-details)
    - [Database Fields](#database-fields)
  - [Note Types](#note-types)
  - [The `is_important` Field](#the-is_important-field)
  - [API Endpoints](#api-endpoints)
    - [Notes Endpoint vs. Timeline Endpoint](#notes-endpoint-vs-timeline-endpoint)
  - [Permissions & Ownership](#permissions--ownership)
  - [Future Enhancements](#future-enhancements)
  - [Usage Examples](#usage-examples)
    - [Creating a Note](#creating-a-note)
    - [Fetching a Timeline Queryset](#fetching-a-timeline-queryset)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Handler Notes

The `handler_notes` app provides a flexible and generic system for handlers to attach internal and external notes to various models in Kesäseteli (e.g., `YouthApplication`, `EmployerApplication`, and `Attachment`).

---

## Table of Contents
- [Core Concept](#core-concept)
- [Relations to Key Models](#relations-to-key-models)
- [Django Generic Relations Details](#django-generic-relations-details)
- [Note Types](#note-types)
- [The `is_important` Field](#the-is_important-field)
- [API Endpoints](#api-endpoints)
  - [Notes Endpoint vs. Timeline Endpoint](#notes-endpoint-vs-timeline-endpoint)
- [Permissions & Ownership](#permissions--ownership)
- [Future Enhancements](#future-enhancements)
- [Usage Examples](#usage-examples)

---

## Core Concept
Handler notes allow internal case handlers to record observations, document external communications, or highlight issues on specific application resources. By using Django's generic relations, notes can be attached to any model in the system without requiring specific database schema changes or new foreign key columns on the `Note` model.

---

## Relations to Key Models
Notes can target different entities in the application lifecycle:
1. **Youth Applications (`YouthApplication`)**: Handler comments regarding a youth's details, application validity, or processing status.
2. **Employer Applications (`EmployerApplication`)**: General feedback or observations about the employer or their summer vouchers.
3. **Attachments (`Attachment`)**: Specific notes on attached PDF/image documents (e.g., employment contracts, salary slips) associated with summer vouchers.
   - **Why are attachments commentable?**
     - *Dealing with Invalid Files*: Applicants may upload incorrect, blank, or false attachments. Handlers need to log these findings directly on the file entity.
     - *Pinpointing Critical Content*: Attachment files can be very large (e.g., a long collective agreement or multi-page contract). Notes allow handlers to write context pointing other processors to a specific narrow section/page of the document (e.g., "Salary info on page 4").
     - *Grading & Auditing*: Handlers can record that they have opened, read, and graded/assessed the attachment, detailing whether they accept or reject it and the rationale behind that decision.


---

## Django Generic Relations Details
To attach notes flexibly to various models, `Note` uses Django's `ContentType` framework.

### Database Fields
* **`content_type`**: Foreign key to Django's `ContentType` model (identifying the target class, e.g., `youthapplication`).
* **`object_id`**: A `UUIDField` representing the primary key of the target instance.
* **`content_object`**: A Django `GenericForeignKey` combining `content_type` and `object_id` to retrieve or set the related target instance dynamically.

```python
# From handler_notes/models.py
content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
object_id = models.UUIDField()
content_object = GenericForeignKey("content_type", "object_id")
```

---

## Note Types
The `NoteType` choices (defined in `handler_notes/enums.py`) categorize how the note was generated and its purpose:
* **`INTERNAL` (`"internal"`)**:
  - *Default choice.* Used for comments, remarks, or notes created by handlers for internal coordination.
* **`EXTERNAL_MESSAGE` (`"external_message"`)**:
  - Used to document correspondence sent to or received from the applicant/employer (such as emails or phone calls).

> [!IMPORTANT]
> **Validation Constraint**: Attachments are static documents and cannot have external messages. Only internal notes (`NoteType.INTERNAL`) can be attached to `Attachment` models. This is enforced by `NoteSerializer.validate()`.



---

## The `is_important` Field
The `is_important` field is a boolean flag (`default=False`) indicating whether a note is of critical importance:
* **UI Highlight**: Important notes are visually highlighted in the frontend (e.g., with distinct styling or warning indicators) to immediately catch the handler's attention.
* **Use Cases**: Useful for marking fraud alerts, missing crucial documents, or issues that must be addressed before approval.

---

## API Endpoints

### Notes Endpoint vs. Timeline Endpoint

The system exposes two ways to fetch note data via the REST API, serving different purposes:

| Feature | Notes Endpoint (`/api/v1/notes/`) | Timeline Endpoint (`/api/v1/applications/<id>/timeline/`) |
| :--- | :--- | :--- |
| **Path** | `/api/v1/notes/` | `/api/v1/youthapplications/<id>/timeline/`<br>`/api/v1/employerapplications/<id>/timeline/` |
| **HTTP Methods** | `GET`, `POST`, `PUT`, `PATCH`, `DELETE` (Standard CRUD) | `GET` (Read-only) |
| **Scope** | Returns notes strictly matching the requested `target_type` and `target_id` query parameters. | Automatically pools/aggregates notes from the parent application **AND** its child entities (like attachments). |
| **Sorting** | Chronological (configurable by query parameters). | Sorted chronologically descending (`-created_at`) to form a coherent event history. |
| **Main Use Case** | Used by individual components to fetch, add, or edit notes for a specific, isolated entity (e.g., a single Attachment). | Used to populate the "Unified Handler Timeline" sidebar on the application detail view, showing the full history of the application. |

---

## Permissions & Ownership
To prevent handlers from accidentally modifying or deleting each other's audit trails:
* **Read Access**: Any authenticated handler can view all notes.
* **Write/Delete Access**: Only the **author** of the note is allowed to edit (`update`, `partial_update`) or delete (`destroy`) the note.
* This restriction is enforced by the custom permission class `IsNoteAuthor` in `handler_notes/api/v1/views.py`.

---

## Future Enhancements
* **Automatic Email Synced Notes**: In the future, sending an email through the external messaging notes interface could trigger the actual dispatch of an email to the applicant.
* **Automatic Log Logging**: Incoming emails from applicants/employers could be automatically captured by the backend and written to the database as `EXTERNAL_MESSAGE` notes with their custom content.

---

## Usage Examples

### Creating a Note
```python
from handler_notes.models import Note
from handler_notes.enums import NoteType

# Create an internal note attached to an EmployerApplication
Note.objects.create(
    content_object=employer_application,
    content="Waiting for the applicant to submit the revised contract.",
    author=request.user,
    note_type=NoteType.INTERNAL,
    is_important=True
)
```

### Fetching a Timeline Queryset
```python
from handler_notes.models import Note

# Fetches notes for the application and its child attachments
timeline_qs = Note.objects.for_application_timeline(employer_application)
```
