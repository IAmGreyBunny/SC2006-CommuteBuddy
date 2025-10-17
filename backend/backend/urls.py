
from django.contrib import admin
from django.urls import path,include
from api.views import CreateUserView
from api.views import MyTokenObtainPairView, BusStopViewSet, BusRouteViewSet, BusScheduleViewSet, RealTimeBusViewSet
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = routers.DefaultRouter()
router.register(r'bus-stops', BusStopViewSet, basename='bus-stop')
router.register(r'bus-routes', BusRouteViewSet, basename='bus-route')
router.register(r'bus-schedules', BusScheduleViewSet, basename='bus-schedule')
router.register(r'real-time-bus', RealTimeBusViewSet, basename='real-time-bus')

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", MyTokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/",include("rest_framework.urls")),
    path("api/", include(router.urls))
]
