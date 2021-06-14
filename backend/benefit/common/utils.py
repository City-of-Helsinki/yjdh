def update_object(obj, data):
    if not data:
        return
    for k, v in data.items():
        if v is None and not obj.__class__._meta.get_field(k).null:
            raise ValueError(f"{k} cannot be null.")
        setattr(obj, k, v)
    obj.save()
