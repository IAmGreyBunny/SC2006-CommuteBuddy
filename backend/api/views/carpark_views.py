from django.db.models import Prefetch
from django.db.models import F, ExpressionWrapper, FloatField
from django.db.models.functions import Power

from ..utils import CoordinateConverter
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics

from ..models import CarparkSource,Carpark,CarparkAvailability
from ..models import FavouriteCarpark
from ..serializers import CarparkSourceSerializer, GetFavouriteCarparkSerializer
from ..serializers import AddFavouriteCarparkSerializer

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

class CarparkWithinRadiusView(generics.ListAPIView):
    serializer_class = CarparkSourceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        try:
            center_lat = float(self.request.GET.get("center_lat"))
            center_lng = float(self.request.GET.get("center_lng"))
            radius = float(self.request.GET.get("radius"))
        except (TypeError, ValueError):
            return CarparkSource.objects.none()

        center_x, center_y = CoordinateConverter.convert_latlng_to_xy(center_lat, center_lng)

        min_x = center_x - radius
        max_x = center_x + radius
        min_y = center_y - radius
        max_y = center_y + radius

        qs = Carpark.objects.filter(
            x_coord__gte=min_x, x_coord__lte=max_x,
            y_coord__gte=min_y, y_coord__lte=max_y
        ).annotate(
            distance_squared=ExpressionWrapper(
                Power(F('x_coord') - center_x, 2) + Power(F('y_coord') - center_y, 2),
                output_field=FloatField()
            )
        ).filter(distance_squared__lte=radius * radius)

        # Prefetch only carparks within radius
        sources = CarparkSource.objects.prefetch_related(
            Prefetch("carparks", queryset=qs)
        )

        return sources

class AddFavouriteCarparkView(generics.CreateAPIView):
    serializer_class = AddFavouriteCarparkSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save()

class FavouriteCarparkListView(generics.ListAPIView):
    serializer_class = GetFavouriteCarparkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FavouriteCarpark.objects.filter(user=self.request.user)