from auditlog_extra.mixins import AuditlogAdminViewAccessLogMixin
from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from django.contrib.contenttypes.models import ContentType
from django.utils.text import capfirst

from handler_notes.models import Note
from handler_notes.utils import get_note_target_model_names


class NoteTargetContentTypeFilter(SimpleListFilter):
    title = "target content type"
    parameter_name = "content_type"

    def lookups(self, request, model_admin):
        target_model_names = get_note_target_model_names()
        cts = ContentType.objects.filter(model__in=target_model_names)
        return [
            (ct.id, capfirst(ct.model_class()._meta.verbose_name))
            for ct in cts
            if ct.model_class()
        ]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(content_type_id=self.value())
        return queryset


@admin.register(Note)
class NoteAdmin(AuditlogAdminViewAccessLogMixin, admin.ModelAdmin):
    date_hierarchy = "created_at"
    list_display = [
        "id",
        "author",
        "note_type",
        "is_important",
        "created_at",
        "modified_at",
    ]
    list_filter = [
        "created_at",
        "modified_at",
        "note_type",
        "is_important",
        NoteTargetContentTypeFilter,
    ]
    search_fields = [
        "author__first_name",
        "author__last_name",
        "author__email",
        "content",
    ]
    readonly_fields = ["created_at", "modified_at"]
    autocomplete_fields = ["author"]

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """
        Override to limit the queryset of content type to the ones that are allowed.
        By default ContentType model has all ContentType models in its queryset.
        We only want to allow certain models to be target of notes.
        The ones that has generic relation to Note model.
        """
        if db_field.name == "content_type":
            kwargs["queryset"] = db_field.related_model.objects.filter(
                model__in=get_note_target_model_names()
            )
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
