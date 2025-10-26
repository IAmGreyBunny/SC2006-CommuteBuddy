from .models import User
from .models import BusStop, BusRoute, BusSchedule, RealTimeBus, MRTLine, MRTStation, MRTSchedule, FavouriteRoute, UserPreference, TransportAlert
from .models import CarparkSource, Carpark, CarparkAvailability
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Overwrites the default simple jwt serializer
class TokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD  # uses "email"

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id","username","email","password"]
        extra_kwargs = {"password":{"write_only":True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class BusStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusStop
        fields = ["bus_stop_code", "road_name", "description", "latitude", "longitude"]

class BusRouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusRoute
        fields = ["service_no", "operator", "direction", "category"]

class BusScheduleSerializer(serializers.ModelSerializer):
    stop = BusStopSerializer(read_only=True)
    route = BusRouteSerializer(read_only=True)

    class Meta:
        model = BusSchedule
        fields = ["route", "stop", "arrival_time", "updated_at"]

class RealTimeBusSerializer(serializers.ModelSerializer):
    route = BusRouteSerializer(read_only=True)

    class Meta:
        model = RealTimeBus
        fields = ["id", "route", "latitude", "longitude", "last_updated"]

class MRTLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = MRTLine
        fields = ["line_code", "name"]

class MRTStationSerializer(serializers.ModelSerializer):
    lines = MRTLineSerializer(many=True, read_only=True)

    class Meta:
        model = MRTStation
        fields = ["station_code", "name", "latitude", "longitude", "lines"]

class MRTScheduleSerializer(serializers.ModelSerializer):
    station = MRTStationSerializer(read_only=True)
    line = MRTLineSerializer(read_only=True)

    class Meta:
        model = MRTSchedule
        fields = ["line", "station", "arrival_time", "updated_at"]

class FavouriteRouteSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

class UserPreferenceSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportAlert
        fields = ["id", "alert_type", "message", "severity", "active", "created_at", "expires_at"]

class CarparkSourceSerializer(serializers.ModelSerializer):
    carparks = CarparkSerializer(many=True, read_only=True)

    class Meta:
        model = CarparkSource
        fields = [
            'id',
            'name',
            'availability_api_url',
            'info_api_url',
            'headers',
            'field_mapping',
            'carparks',
        ]

class CarparkSerializer(serializers.ModelSerializer):
    availability = CarparkAvailabilitySerializer(many=True, read_only=True)

    class Meta:
        model = UserPreference
        fields = ["id", "user", "preferred_transport", "avoid_crowded_routes", "receive_alerts"]


class CarparkAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = FavouriteRoute
        fields = ["id", "user", "route_type", "route_id", "nickname", "created_at"]
        model = CarparkAvailability
        fields = ['id', 'available_lots', 'total_lots']
        model = Carpark
        fields = ['id', 'external_id', 'x_coord', 'y_coord', 'availability']