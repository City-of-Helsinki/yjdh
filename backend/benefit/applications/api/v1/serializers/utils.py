from rest_framework import serializers


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    """
    A ModelSerializer that takes an additional `fields` argument that
    controls which fields should be displayed and exclude_fields parameter argument that controls
    which fields should not be displayed and exclude_fields parameter argument that controls which
    fields should not be displayed.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Empty "fields" argument is treated the same as no argument at all
        fields = self.context.get("fields", []) or self.fields.keys()
        exclude_fields = self.context.get("exclude_fields", [])

        existing = set(self.fields)
        allowed = set(fields) - set(exclude_fields)
        for field_name in existing - allowed:
            self.fields.pop(field_name)
