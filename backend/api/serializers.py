from .models import User
from .models import CarparkSource, Carpark
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