from rest_framework.permissions import AllowAny
from rest_framework import generics, permissions, status
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