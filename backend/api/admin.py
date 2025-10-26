from django.contrib import admin
from .models import (
    User, CarparkSource, Carpark, CarparkAvailability,
    BusStop, BusRoute, BusSchedule, RealTimeBus, 
    MRTStation, MRTLine, MRTSchedule, FavouriteRoute, 
    UserPreference, TransportAlert
)

# Register your models here.
admin.site.register(CarparkSource)
admin.site.register(Carpark)
admin.site.register(CarparkAvailability)

admin.site.register(BusStop)
admin.site.register(BusRoute)
admin.site.register(BusSchedule)
admin.site.register(RealTimeBus)

# MRT Models
admin.site.register(MRTStation)
admin.site.register(MRTLine)
admin.site.register(MRTSchedule)

# User preferences, favourites, alerts
admin.site.register(UserPreference)
admin.site.register(FavouriteRoute)
admin.site.register(TransportAlert)

# Only register User if it exists and you want it in admin
try:
    admin.site.register(User)
except admin.sites.AlreadyRegistered:
    pass