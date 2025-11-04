from ..models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import password_validation

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

# For change password on settings
class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        password_validation.validate_password(value)
        return value