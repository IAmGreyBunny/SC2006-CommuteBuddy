
from django.contrib import admin
from django.urls import path,include
from api.views import CreateUserView,CarparkSourceListView, CarparkSourceCreateView, CarparksInBoundsView, CarparkWithinRadiusView
from api.views import AddFavouriteCarparkView, FavouriteCarparkListView
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView

from api.views import (
    CreateUserView, CarparkSourceListView, CarparkSourceCreateView,
    CarparksInBoundsView, CarparkWithinRadiusView,
    FavouriteRouteViewSet, UserPreferenceViewSet, AlertViewSet,
    BusStopViewSet, BusRouteViewSet, BusScheduleViewSet, RealTimeBusViewSet,
    MRTLineViewSet, MRTStationViewSet, MRTScheduleViewSet,
    bus_arrival, bus_arrival_processed, nearby_bus_stops,
    nearby_mrt_stations, mrt_crowd_real_time, mrt_crowd_forecast, mrt_service_alerts,
    user_favourites, add_favourite, remove_favourite,
    search_bus_stops, search_mrt_stations, search_bus_services,
    MyTokenObtainPairView, UserProfileView, ChangePasswordView, DeleteAccountView
)

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

    # JWT Authentication
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # User endpoints
    path('api/user/register/', CreateUserView.as_view(), name='register'),
    path('api/user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/user/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path("api/user/delete-account/", DeleteAccountView.as_view(), name="delete-account"),

    # Carpark endpoints
    path('api/carpark/get_carpark_list/', CarparkSourceListView.as_view(), name='get_carpark_list'),
    path('api/carpark/get_carpark_in_bound/', CarparksInBoundsView.as_view(), name='get_carparks_in_bound'),
    path('api/carpark/create_carpark_source/', CarparkSourceCreateView.as_view(), name='create_carpark_source'),
    path('api/carpark/get_carpark_within_radius/', CarparkWithinRadiusView.as_view(), name='get_carpark_within_radius'),
    path("api/carpark/add_favourite/",AddFavouriteCarparkView.as_view(),name='add_favourite_carpark'),
    path("api/carpark/get_favourite/",FavouriteCarparkListView.as_view(),name='add_favourite_carpark'),

    # Bus endpoints
    path('api/bus-arrival/<str:bus_stop_code>/', bus_arrival, name='bus_arrival'),
    path('api/bus-arrival-processed/<str:bus_stop_code>/', bus_arrival_processed, name='bus_arrival_processed'),
    path('api/nearby-bus-stops/', nearby_bus_stops, name='nearby_bus_stops'),

    # MRT endpoints
    path('api/nearby-mrt-stations/', nearby_mrt_stations, name='nearby_mrt_stations'),
    path('api/mrt-crowd/<str:train_line>/', mrt_crowd_real_time, name='mrt_crowd_real_time'),
    path('api/mrt-crowd-forecast/<str:train_line>/', mrt_crowd_forecast, name='mrt_crowd_forecast'),
    path('api/mrt-service-alerts/', mrt_service_alerts, name='mrt_service_alerts'),

    # User favourites
    path('api/user/favourites/', user_favourites, name='user_favourites'),
    path('api/user/favourites/add/', add_favourite, name='add_favourite'),
    path('api/user/favourites/remove/<int:favourite_id>/', remove_favourite, name='remove_favourite'),

    # Search endpoints
    path('api/search/bus-stops/', search_bus_stops, name='search_bus_stops'),
    path('api/search/mrt-stations/', search_mrt_stations, name='search_mrt_stations'),
    path('api/search/bus-services/', search_bus_services, name='search_bus_services'),

    # DRF router endpoints
    path('api/', include(router.urls)),

    # DRF auth login/logout
    path('api-auth/', include('rest_framework.urls')),
]
