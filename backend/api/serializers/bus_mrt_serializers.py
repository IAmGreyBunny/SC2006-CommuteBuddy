from ..models import BusStop, BusRoute, BusSchedule, RealTimeBus, MRTLine, MRTStation, MRTSchedule, FavouriteRoute, UserPreference, TransportAlert
from rest_framework import serializers

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

    class Meta:
        model = FavouriteRoute
        fields = ["id", "user", "route_type", "route_id", "nickname", "created_at"]

class UserPreferenceSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = UserPreference
        fields = ["id", "user", "preferred_transport", "avoid_crowded_routes", "receive_alerts"]


class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportAlert
        fields = ["id", "alert_type", "message", "severity", "active", "created_at", "expires_at"]
