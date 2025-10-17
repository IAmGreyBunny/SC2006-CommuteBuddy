from .models import User
from .models import CarparkSource, Carpark
from .models import BusStop, BusRoute, BusSchedule, RealTimeBus
from .models import MRTLine, MRTStation, MRTSchedule, FavouriteRoute, UserPreference, TransportAlert
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

class CarparkSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarparkSource
        fields = ["id","name","api_url","field_mapping"]
        extra_kwargs = {"id": {"read_only": True}}

class CarparkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Carpark
        fields = ["id","source_id","external_id","lat","lon","available_lots","total_lots"]
        extra_kwargs = {"id": {"read_only": True}}

# Public Transport
class BusStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusStop
        fields = ["stop_id", "name", "latitude", "longitude"]

class BusRouteSerializer(serializers.ModelSerializer):
    start_stop = BusStopSerializer(read_only=True)
    end_stop = BusStopSerializer(read_only=True)

    class Meta:
        model = BusRoute
        fields = ["route_id", "name", "start_stop", "end_stop"]

class BusScheduleSerializer(serializers.ModelSerializer):
    stop = BusStopSerializer(read_only=True)
    route = BusRouteSerializer(read_only=True)

    class Meta:
        model = BusSchedule
        fields = ["route", "stop", "arrival_time", "updated_at"]

class RealTimeBusSerializer(serializers.ModelSerializer):
    route = BusRouteSerializer(read_only=True)
    current_stop = BusStopSerializer(read_only=True)

    class Meta:
        model = RealTimeBus
        fields = ["id", "route", "current_stop", "latitude", "longitude", "last_updated"]


# --- MRT ---
class MRTLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = MRTLine
        fields = ["line_id", "name", "color"]

class MRTStationSerializer(serializers.ModelSerializer):
    line = MRTLineSerializer(read_only=True)

    class Meta:
        model = MRTStation
        fields = ["station_id", "name", "latitude", "longitude", "line"]

class MRTScheduleSerializer(serializers.ModelSerializer):
    station = MRTStationSerializer(read_only=True)
    line = MRTLineSerializer(read_only=True)

    class Meta:
        model = MRTSchedule
        fields = ["line", "station", "arrival_time", "updated_at"]


# --- User Preferences, Favourites, Alerts ---
class FavouriteRouteSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    route_type = serializers.ChoiceField(choices=[("bus", "Bus"), ("mrt", "MRT")])

    class Meta:
        model = FavouriteRoute
        fields = ["id", "user", "route_type", "route_id", "created_at"]

class UserPreferenceSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = UserPreference
        fields = ["id", "user", "preferred_mode", "avoid_crowded_routes", "notifications_enabled"]

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportAlert
        fields = ["id", "alert_type", "message", "timestamp", "severity", "active"]