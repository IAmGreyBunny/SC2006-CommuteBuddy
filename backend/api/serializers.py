from .models import User
from .models import CarparkSource, Carpark, CarparkAvailability
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .utils.CoodinateConverter import convert_xy_to_latlng

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

class CarparkAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CarparkAvailability
        fields = ['id', 'available_lots', 'total_lots']


class CarparkSerializer(serializers.ModelSerializer):
    availability = CarparkAvailabilitySerializer(many=True, read_only=True)
    lat = serializers.SerializerMethodField()
    lng = serializers.SerializerMethodField()

    class Meta:
        model = Carpark
        fields = ['id','name', 'external_id', 'x_coord', 'y_coord', 'lat', 'lng', 'availability']

    # Dummy for now
    def get_lat(self,obj):
        lat,_ = convert_xy_to_latlng(obj.x_coord,obj.y_coord)
        return lat

    def get_lng(self,obj):
        _,lng = convert_xy_to_latlng(obj.x_coord, obj.y_coord)
        return lng


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
            'carparks',
        ]