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