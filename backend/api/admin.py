
from django.contrib import admin
from .models import (
    User, CarparkSource, Carpark, CarparkAvailability, FavouriteCarpark,
    BusStop, BusRoute, BusSchedule, RealTimeBus,
    MRTStation, MRTLine, MRTSchedule, FavouriteRoute,
    UserPreference, TransportAlert
)

@admin.register(MRTStation)
class MRTStationAdmin(admin.ModelAdmin):
    list_display = ['station_code', 'name', 'display_lines', 'latitude', 'longitude']
    list_filter = ['lines']
    search_fields = ['station_code', 'name']
    filter_horizontal = ['lines']
    
    def display_lines(self, obj):
        lines = obj.lines.all()
        if lines:
            return ", ".join([line.line_code for line in lines])
        return "No lines"
    display_lines.short_description = 'Lines'

@admin.register(MRTLine)
class MRTLineAdmin(admin.ModelAdmin):
    list_display = ['line_code', 'name', 'station_count']
    search_fields = ['line_code', 'name']
    
    def station_count(self, obj):
        return obj.stations.count()
    station_count.short_description = 'Number of Stations'

# Register other models normally
admin.site.register(CarparkSource)
admin.site.register(Carpark)
admin.site.register(CarparkAvailability)
admin.site.register(BusStop)
admin.site.register(BusRoute)
admin.site.register(BusSchedule)
admin.site.register(RealTimeBus)
admin.site.register(MRTSchedule)
admin.site.register(UserPreference)
admin.site.register(FavouriteRoute)
admin.site.register(TransportAlert)
admin.site.register(FavouriteCarpark)

# Register User if not already registered
admin.site.register(User)
# try:
#     admin.site.register(User)
# except admin.sites.AlreadyRegistered:
#     pass