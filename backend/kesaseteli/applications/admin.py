from django.apps import apps
from django.contrib import admin

from applications.models import School

if apps.is_installed("django.contrib.admin"):
    admin.site.register(School)
