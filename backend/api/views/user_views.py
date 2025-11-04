from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import generics, permissions, status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response

from ..models import User
from ..serializers import UserSerializer, TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView

# Overwrite the default token obtain pair view with our custom one
# This also serves as the login view since obtaining a token is what login does
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

# For the edit profile in settings
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
# For change password on settings
class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            current_password = serializer.validated_data["current_password"]
            new_password = serializer.validated_data["new_password"]

            if not user.check_password(current_password):
                return Response(
                    {"message": "Current password is incorrect."},
                    status=400
                )

            user.set_password(new_password)
            user.save()
            return Response({"message": "Password changed successfully."})
        
        return Response(serializer.errors, status=400)