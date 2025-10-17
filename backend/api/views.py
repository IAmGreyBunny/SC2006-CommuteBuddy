from django.shortcuts import render
from .models import User
from .models import BusStop, BusRoute, BusSchedule, RealTimeBus
from rest_framework import generics
from .serializers import UserSerializer, TokenObtainPairSerializer
from .serializers import BusStopSerializer, BusRouteSerializer, BusScheduleSerializer, RealTimeBusSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import viewsets

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
