# Generated by Django 3.2.4 on 2021-11-25 09:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("bf_messages", "0001_initial"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="message",
            options={
                "ordering": ["created_at"],
                "verbose_name": "message",
                "verbose_name_plural": "messages",
            },
        ),
    ]
