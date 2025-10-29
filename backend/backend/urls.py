
from django.contrib import admin
from django.urls import path,include
from api.views import CreateUserView,CarparkSourceListView, CarparksInBoundsView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenObtainPairView.as_view(), name="refresh"),
    path("api-auth/",include("rest_framework.urls")),
    path("api/carpark/get_carpark_list/",CarparkSourceListView.as_view(),name="get_carpark_list"),
    path('api/carpark/get_carpark_in_bound/', CarparksInBoundsView.as_view(), name='get_carparks_in_bound')
]
