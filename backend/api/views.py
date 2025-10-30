from django.db.models import Prefetch
from django.shortcuts import render
from prompt_toolkit.win32_types import COORD

from .models import User
from .models import CarparkSource,Carpark,CarparkAvailability
from .serializers import CarparkSourceSerializer
from rest_framework import generics
from .serializers import UserSerializer, TokenObtainPairSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .utils import CoordinateConverter

# Create your views here.

# Overwrite the default token obtain pair view with our custom one
# This also serves as the login view since obtaining a token is what login does
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class CarparkSourceListView(generics.ListAPIView):
    serializer_class = CarparkSourceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Efficiently fetch related carparks and availabilities
        return CarparkSource.objects.prefetch_related('carparks__availability').all()

class CarparksInBoundsView(generics.ListAPIView):
    serializer_class = CarparkSourceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        try:
            ne_lat = float(self.request.GET.get("ne_lat"))
            ne_lng = float(self.request.GET.get("ne_lng"))
            sw_lat = float(self.request.GET.get("sw_lat"))
            sw_lng = float(self.request.GET.get("sw_lng"))
        except (TypeError, ValueError):
            return CarparkSource.objects.none()

        # Convert bounds to DB x/y coordinates
        sw_x, sw_y = CoordinateConverter.convert_latlng_to_xy(sw_lat, sw_lng)
        ne_x, ne_y = CoordinateConverter.convert_latlng_to_xy(ne_lat, ne_lng)

        # Prefetch only carparks inside bounds
        filtered_carparks = Carpark.objects.filter(
            x_coord__gte=sw_x,
            x_coord__lte=ne_x,
            y_coord__gte=sw_y,
            y_coord__lte=ne_y
        ).prefetch_related("availability")

        # Prefetch into CarparkSource
        sources = CarparkSource.objects.prefetch_related(
            Prefetch("carparks", queryset=filtered_carparks)
        )

        return sources
