from django.shortcuts import render
from .models import User
from .models import BusStop, BusRoute, BusSchedule, RealTimeBus
from .models import MRTLine, MRTSchedule, MRTStation, FavouriteRoute, UserPreference, TransportAlert
from rest_framework import generics
from .serializers import UserSerializer, TokenObtainPairSerializer
from .serializers import BusStopSerializer, BusRouteSerializer, BusScheduleSerializer, RealTimeBusSerializer
from .serializers import MRTLineSerializer, MRTScheduleSerializer, MRTStationSerializer, FavouriteRouteSerializer, UserPreferenceSerializer, AlertSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import viewsets, permissions
from rest_framework.decorators import action

# Create your views here.

# Overwrite the default token obtain pair view with our custom one
# This also serves as the login view since obtaining a token is what login does
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class BusStopViewSet(viewsets.ModelViewSet):
    queryset = BusStop.objects.all()
    serializer_class = BusStopSerializer
    permission_classes = [IsAuthenticated]

class BusRouteViewSet(viewsets.ModelViewSet):
    queryset = BusRoute.objects.all()
    serializer_class = BusRouteSerializer
    permission_classes = [IsAuthenticated]

class BusScheduleViewSet(viewsets.ModelViewSet):
    queryset = BusSchedule.objects.all()
    serializer_class = BusScheduleSerializer
    permission_classes = [IsAuthenticated]

class RealTimeBusViewSet(viewsets.ModelViewSet):
    queryset = RealTimeBus.objects.all()
    serializer_class = RealTimeBusSerializer
    permission_classes = [IsAuthenticated]

# MRT 
class MRTLineViewSet(viewsets.ModelViewSet):
    queryset = MRTLine.objects.all()
    serializer_class = MRTLineSerializer
    permission_classes = [permissions.AllowAny]

class MRTStationViewSet(viewsets.ModelViewSet):
    queryset = MRTStation.objects.all()
    serializer_class = MRTStationSerializer
    permission_classes = [permissions.AllowAny]

class MRTScheduleViewSet(viewsets.ModelViewSet):
    queryset = MRTSchedule.objects.all()
    serializer_class = MRTScheduleSerializer
    permission_classes = [permissions.AllowAny]


# --- USER PREFERENCES / FAVOURITES / ALERTS ---
class FavouriteRouteViewSet(viewsets.ModelViewSet):
    serializer_class = FavouriteRouteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavouriteRoute.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserPreferenceViewSet(viewsets.ModelViewSet):
    serializer_class = UserPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserPreference.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AlertViewSet(viewsets.ModelViewSet):
    queryset = TransportAlert.objects.all()
    serializer_class = AlertSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=["get"])
    def active(self, request):
        """Custom route to get only active alerts."""
        alerts = TransportAlert.objects.filter(active=True)
        serializer = self.get_serializer(alerts, many=True)
        return Response(serializer.data)
