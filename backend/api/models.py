from django.contrib.auth.models import AbstractUser
from django.db import models

# Custom User Class that overwrites the default django User model
class User(AbstractUser):

    # Overwriting default fields to fit requirements
    email = models.EmailField(unique=True)  # Must be unique if used for login
    username = models.CharField(max_length=150, unique=True)  # Explicitly require username to be unique

    # Setting up the user model
    REQUIRED_FIELDS = ["username"]  # Explicitly require username field during creation of user
    USERNAME_FIELD = "email"

    def __str__(self):
        return self.email

# Additional Models
from .additional_models import *