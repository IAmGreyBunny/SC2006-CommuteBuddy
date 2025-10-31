from django.db.models import Prefetch

from ..utils import CoordinateConverter
from rest_framework.permissions import AllowAny
from rest_framework import generics

from ..models import CarparkSource,Carpark,CarparkAvailability
from ..serializers import CarparkSourceSerializer

class CarparkSourceListView(generics.ListAPIView):
    serializer_class = CarparkSourceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Efficiently fetch related carparks and availabilities
        return CarparkSource.objects.prefetch_related('carparks__availability').all()

class CarparkSourceCreateView(generics.CreateAPIView):
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