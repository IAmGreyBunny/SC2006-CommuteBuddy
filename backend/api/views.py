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



# Add these imports at the top of views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework import status
from django.utils import timezone
from datetime import datetime

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




# Add these view functions at the bottom of views.py
# --- BUS ARRIVAL API ENDPOINTS ---

@api_view(['GET'])
@permission_classes([AllowAny])
def bus_arrival(request, bus_stop_code):
    """
    Get real-time bus arrivals for a bus stop
    Example: GET /api/bus-arrival/83139/
    """
    # Validate bus stop code
    if not bus_stop_code or not bus_stop_code.isdigit() or len(bus_stop_code) != 5:
        return Response(
            {
                'success': False,
                'error': 'Invalid bus stop code. Must be 5 digits.',
                'bus_stop_code': bus_stop_code
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from .services.lta_service import LTADataService
        service = LTADataService()
        result = service.get_bus_arrival(bus_stop_code)
        
        if result['success']:
            return Response({
                'success': True,
                'bus_stop_code': bus_stop_code,
                'data': result['data'],
                'cached': result.get('cached', False)
            })
        else:
            return Response({
                'success': False,
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def bus_arrival_processed(request, bus_stop_code):
    """
    Get processed real-time bus arrivals with user-friendly format
    Example: GET /api/bus-arrival-processed/83139/
    """
    if not bus_stop_code or not bus_stop_code.isdigit() or len(bus_stop_code) != 5:
        return Response(
            {
                'success': False,
                'error': 'Invalid bus stop code. Must be 5 digits.',
                'bus_stop_code': bus_stop_code
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from .services.lta_service import LTADataService
        service = LTADataService()
        result = service.get_bus_arrival(bus_stop_code)
        
        if result['success']:
            # Process the raw data into user-friendly format
            processed_data = service.process_bus_arrival_data(result['data'])
            
            response_data = {
                'success': True,
                'bus_stop_code': bus_stop_code,
                'timestamp': timezone.now().isoformat(),
                'services': processed_data,
                'metadata': {
                    'cached': result.get('cached', False),
                    'total_services': len(processed_data),
                    'total_buses': sum(len(svc['buses']) for svc in processed_data)
                }
            }
            return Response(response_data)
        else:
            return Response({
                'success': False,
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)