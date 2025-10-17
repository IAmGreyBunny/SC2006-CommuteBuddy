from django.contrib import admin
from .models import CarparkSource
from .models import BusStop, BusRoute, BusSchedule, RealTimeBus

# Register your models here.
admin.site.register(CarparkSource)
admin.site.register(BusStop)
admin.site.register(BusRoute)
admin.site.register(BusSchedule)
admin.site.register(RealTimeBus)