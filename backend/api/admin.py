from django.contrib import admin
from .models import CarparkSource
from .models import BusStop, BusRoute, BusSchedule, RealTimeBus, MRTStation, MRTLine, MRTSchedule, FavouriteRoute, UserPreference, TransportAlert

# Register your models here.
admin.site.register(CarparkSource)
admin.site.register(BusStop)
admin.site.register(BusRoute)
admin.site.register(BusSchedule)
admin.site.register(RealTimeBus)
# MRT
admin.site.register(MRTStation)
admin.site.register(MRTLine)
admin.site.register(MRTSchedule)

# User preferences, favourites, alerts
admin.site.register(UserPreference)
admin.site.register(FavouriteRoute)
admin.site.register(TransportAlert)
