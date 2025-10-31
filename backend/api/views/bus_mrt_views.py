from django.db import models

from ..models import BusStop, BusRoute, BusSchedule, RealTimeBus
from ..models import MRTLine, MRTSchedule, MRTStation, FavouriteRoute, UserPreference, TransportAlert
from ..serializers import BusStopSerializer, BusRouteSerializer, BusScheduleSerializer, RealTimeBusSerializer
from ..serializers import MRTLineSerializer, MRTScheduleSerializer, MRTStationSerializer, FavouriteRouteSerializer, UserPreferenceSerializer, AlertSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
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



class BusStopViewSet(viewsets.ModelViewSet):
    queryset = BusStop.objects.all()
    serializer_class = BusStopSerializer
    permission_classes = [AllowAny]  # Changed from IsAuthenticated

class BusRouteViewSet(viewsets.ModelViewSet):
    queryset = BusRoute.objects.all()
    serializer_class = BusRouteSerializer
    permission_classes = [AllowAny]  # Changed from IsAuthenticated

class BusScheduleViewSet(viewsets.ModelViewSet):
    queryset = BusSchedule.objects.all()
    serializer_class = BusScheduleSerializer
    permission_classes = [AllowAny]  # Changed from IsAuthenticated

class RealTimeBusViewSet(viewsets.ModelViewSet):
    queryset = RealTimeBus.objects.all()
    serializer_class = RealTimeBusSerializer
    permission_classes = [AllowAny]  # Changed from IsAuthenticated

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
        from ..services.lta_service import LTADataService
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
        from ..services.lta_service import LTADataService
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

@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_bus_stops(request):
    """
    Find nearby bus stops based on coordinates
    Example: GET /api/nearby-bus-stops/?lat=1.3521&lng=103.8198&radius=500
    """
    lat = request.GET.get('lat')
    lng = request.GET.get('lng')
    radius = int(request.GET.get('radius', 500))

    if not lat or not lng:
        return Response({
            'success': False,
            'error': 'Latitude and longitude parameters are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        lat = float(lat)
        lng = float(lng)
        radius = min(radius, 2000)  # Max radius 2km

        from django.db.models import F, ExpressionWrapper, FloatField
        from django.db.models.functions import ACos, Cos, Radians, Sin

        # Haversine formula to calculate distance
        distance_expr = ExpressionWrapper(
            6371 * ACos(
                Cos(Radians(lat)) *
                Cos(Radians(F('latitude'))) *
                Cos(Radians(F('longitude')) - Radians(lng)) +
                Sin(Radians(lat)) *
                Sin(Radians(F('latitude')))
            ),
            output_field=FloatField()
        )

        nearby_stops = BusStop.objects.annotate(
            distance_km=distance_expr
        ).filter(
            distance_km__lte=radius/1000  # Convert meters to kilometers
        ).order_by('distance_km')[:20]

        serializer = BusStopSerializer(nearby_stops, many=True)

        return Response({
            'success': True,
            'location': {'lat': lat, 'lng': lng},
            'radius': radius,
            'stops': serializer.data,
            'count': len(nearby_stops)
        })

    except ValueError:
        return Response({
            'success': False,
            'error': 'Invalid latitude or longitude format'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def nearby_mrt_stations(request):
    """
    Find nearby MRT stations based on coordinates
    Example: GET /api/nearby-mrt-stations/?lat=1.3521&lng=103.8198&radius=500
    """
    lat = request.GET.get('lat')
    lng = request.GET.get('lng')
    radius = int(request.GET.get('radius', 500))

    if not lat or not lng:
        return Response({
            'success': False,
            'error': 'Latitude and longitude parameters are required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        lat = float(lat)
        lng = float(lng)
        radius = min(radius, 2000)  # Max radius 2km

        from django.db.models import F, ExpressionWrapper, FloatField
        from django.db.models.functions import ACos, Cos, Radians, Sin

        # Haversine formula to calculate distance
        distance_expr = ExpressionWrapper(
            6371 * ACos(
                Cos(Radians(lat)) *
                Cos(Radians(F('latitude'))) *
                Cos(Radians(F('longitude')) - Radians(lng)) +
                Sin(Radians(lat)) *
                Sin(Radians(F('latitude')))
            ),
            output_field=FloatField()
        )

        nearby_stations = MRTStation.objects.annotate(
            distance_km=distance_expr
        ).filter(
            distance_km__lte=radius/1000  # Convert meters to kilometers
        ).order_by('distance_km')[:20]

        serializer = MRTStationSerializer(nearby_stations, many=True)

        return Response({
            'success': True,
            'location': {'lat': lat, 'lng': lng},
            'radius': radius,
            'stations': serializer.data,
            'count': len(nearby_stations)
        })

    except ValueError:
        return Response({
            'success': False,
            'error': 'Invalid latitude or longitude format'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def mrt_crowd_real_time(request, train_line):
    """Get real-time MRT crowd density"""
    try:
        from ..services.lta_service import LTADataService
        service = LTADataService()
        result = service.get_mrt_crowd_real_time(train_line)

        if result['success']:
            return Response({
                'success': True,
                'train_line': train_line,
                'data': result['data'],
                'cached': result.get('cached', False),
                'timestamp': timezone.now().isoformat()
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
def mrt_crowd_forecast(request, train_line):
    """Get MRT crowd density forecast"""
    try:
        from ..services.lta_service import LTADataService
        service = LTADataService()
        result = service.get_mrt_crowd_forecast(train_line)

        if result['success']:
            return Response({
                'success': True,
                'train_line': train_line,
                'data': result['data'],
                'cached': result.get('cached', False),
                'timestamp': timezone.now().isoformat()
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
def mrt_service_alerts(request):
    """Get MRT service alerts and disruptions"""
    try:
        from ..services.lta_service import LTADataService
        service = LTADataService()
        result = service.get_train_service_alerts()

        if result['success']:
            return Response({
                'success': True,
                'data': result['data'],
                'cached': result.get('cached', False),
                'timestamp': timezone.now().isoformat()
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
@permission_classes([IsAuthenticated])
def user_favourites(request):
    """Get user's favourite bus stops and MRT stations"""
    try:
        bus_favourites = FavouriteRoute.objects.filter(
            user=request.user,
            route_type='bus'
        )
        mrt_favourites = FavouriteRoute.objects.filter(
            user=request.user,
            route_type='mrt'
        )

        bus_serializer = FavouriteRouteSerializer(bus_favourites, many=True)
        mrt_serializer = FavouriteRouteSerializer(mrt_favourites, many=True)

        return Response({
            'success': True,
            'bus_favourites': bus_serializer.data,
            'mrt_favourites': mrt_serializer.data
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_favourite(request):
    """Add a bus stop or MRT station to favourites"""
    try:
        route_type = request.data.get('route_type')
        route_id = request.data.get('route_id')
        nickname = request.data.get('nickname', '')

        if not route_type or not route_id:
            return Response({
                'success': False,
                'error': 'route_type and route_id are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        favourite, created = FavouriteRoute.objects.get_or_create(
            user=request.user,
            route_type=route_type,
            route_id=route_id,
            defaults={'nickname': nickname}
        )

        serializer = FavouriteRouteSerializer(favourite)

        return Response({
            'success': True,
            'created': created,
            'favourite': serializer.data
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_favourite(request, favourite_id):
    """Remove a favourite"""
    try:
        favourite = FavouriteRoute.objects.get(id=favourite_id, user=request.user)
        favourite.delete()

        return Response({
            'success': True,
            'message': 'Favourite removed successfully'
        })

    except FavouriteRoute.DoesNotExist:
        return Response({
            'success': False,
            'error': 'Favourite not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def search_bus_stops(request):
    """
    Search bus stops by description, road name, or bus stop code
    """
    query = request.GET.get('q', '').strip().lower()

    if not query or len(query) < 2:
        return Response({
            'success': False,
            'error': 'Search query must be at least 2 characters'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Search in description, road name, and bus stop code
        bus_stops = BusStop.objects.filter(
            models.Q(description__icontains=query) |
            models.Q(road_name__icontains=query) |
            models.Q(bus_stop_code__icontains=query)
        ).order_by('description')[:20]  # Limit to 20 results

        serializer = BusStopSerializer(bus_stops, many=True)

        return Response({
            'success': True,
            'query': query,
            'results': serializer.data,
            'count': len(bus_stops)
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_mrt_stations(request):
    """
    Search MRT stations by name or station code
    """
    query = request.GET.get('q', '').strip().lower()

    if not query or len(query) < 2:
        return Response({
            'success': False,
            'error': 'Search query must be at least 2 characters'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Search in station name and code
        stations = MRTStation.objects.filter(
            models.Q(name__icontains=query) |
            models.Q(station_code__icontains=query)
        ).order_by('name')[:20]  # Limit to 20 results

        serializer = MRTStationSerializer(stations, many=True)

        return Response({
            'success': True,
            'query': query,
            'results': serializer.data,
            'count': len(stations)
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def search_bus_services(request):
    """
    Search bus services by service number
    """
    service_no = request.GET.get('service_no', '').strip().upper()

    if not service_no:
        return Response({
            'success': False,
            'error': 'Bus service number is required'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        # For now, we'll return bus stops that have this service
        from ..services.lta_service import LTADataService
        service = LTADataService()

        # Get some popular bus stops that might have this service
        popular_stops = BusStop.objects.filter(
            models.Q(description__icontains='INT') |
            models.Q(description__icontains='STN')
        )[:10]

        results = []
        for stop in popular_stops:
            result = service.get_bus_arrival(stop.bus_stop_code, service_no)
            if result['success'] and result['data'].get('Services'):
                # This stop has the bus service we're looking for
                results.append({
                    'bus_stop': BusStopSerializer(stop).data,
                    'arrivals': service.process_bus_arrival_data(result['data'])
                })

        return Response({
            'success': True,
            'service_no': service_no,
            'results': results,
            'count': len(results)
        })

    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
