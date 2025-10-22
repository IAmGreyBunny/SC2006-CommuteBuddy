from django.contrib import admin
from .models import CarparkSource, Carpark

# Register your models here.
admin.site.register(CarparkSource)
admin.site.register(Carpark)