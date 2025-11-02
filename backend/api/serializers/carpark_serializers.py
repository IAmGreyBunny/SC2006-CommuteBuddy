from rest_framework import serializers
from ..models import CarparkSource, Carpark, CarparkAvailability
from ..utils.CoordinateConverter import convert_xy_to_latlng

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
            'availability_path_mapping',
            'info_path_mapping',
            'carparks',
        ]
        extra_kwargs = {
            "carparks": {"read_only": True},
            "availability_path_mapping":{"write_only":True}        ,
            "info_path_mapping": {"write_only": True},
            "headers": {"write_only": True}
        }

    def create(self, validated_data):
        carparkSource = CarparkSource.objects.create(**validated_data)
        return carparkSource