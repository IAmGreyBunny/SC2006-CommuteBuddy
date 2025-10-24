from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView, MyTokenObtainPairView, bus_arrival, bus_arrival_processed   # Add bus_arrival here
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework import routers
from api.views import BusStopViewSet, BusRouteViewSet, BusScheduleViewSet, RealTimeBusViewSet, MRTLineViewSet, MRTStationViewSet, MRTScheduleViewSet, FavouriteRouteViewSet, UserPreferenceViewSet, AlertViewSet

router = routers.DefaultRouter()
router.register(r'bus-stops', BusStopViewSet, basename='bus-stop')
router.register(r'bus-routes', BusRouteViewSet, basename='bus-route')
router.register(r'bus-schedules', BusScheduleViewSet, basename='bus-schedule')
router.register(r'real-time-bus', RealTimeBusViewSet, basename='real-time-bus')
router.register(r'mrt-lines', MRTLineViewSet, basename='mrt-line')
router.register(r'mrt-stations', MRTStationViewSet, basename='mrt-station')
router.register(r'mrt-schedules', MRTScheduleViewSet, basename='mrt-schedule')
router.register(r'favourites', FavouriteRouteViewSet, basename='favourite')
router.register(r'preferences', UserPreferenceViewSet, basename='preference')
router.register(r'alerts', AlertViewSet, basename='alert')

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", MyTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    
    # ADD THE BUS ARRIVAL ENDPOINT HERE (BEFORE THE ROUTER)
    path("api/bus-arrival/<str:bus_stop_code>/", bus_arrival, name='bus_arrival'),
    path("api/bus-arrival-processed/<str:bus_stop_code>/", bus_arrival_processed, name='bus_arrival_processed'),
    
    # Keep the router include at the end
    path("api/", include(router.urls)),
]