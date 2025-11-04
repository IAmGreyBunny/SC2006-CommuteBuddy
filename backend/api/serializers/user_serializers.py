from ..models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Overwrites the default simple jwt serializer
class TokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = User.USERNAME_FIELD 

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add username to the response
        data['username'] = self.user.username
        return data 

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id","username","email","password"]
        extra_kwargs = {"password":{"write_only":True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user