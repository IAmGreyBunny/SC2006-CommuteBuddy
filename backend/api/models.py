from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

# Custom User Class that overwrites the default django User model
class User(AbstractUser):

    # Overwriting default fields to fit requirements
    email = models.EmailField(unique=True)                      # Must be unique if used for login
    username = models.CharField(max_length=150, unique=True)    # Explicitly require username to be unique

    # Setting up the user model
    REQUIRED_FIELDS = ["username"]                              # Explicitly require username field during creation of user
    USERNAME_FIELD = "email"

    def __str__(self):
        return self.email

class CarparkSource(models.Model):
    name = models.CharField(max_length=100, unique=True)
    api_url = models.URLField()
    info_url = models.URLField()

    # optional — store how external fields map to internal ones
    field_mapping = models.JSONField(blank=True, null=True, help_text="Maps external fields to internal ones")

    def __str__(self):
        return self.name

class Carpark(models.Model):
    source_id = models.ForeignKey(
        'CarparkSource',
        on_delete=models.CASCADE,
        related_name='carparks'
    )

    # This helps us identify the carparks from the external api
    external_id = models.CharField(
        max_length=100,
        db_index=True
    )

    lat = models.FloatField()
    lon = models.FloatField()

    # The indexes help to improve read performance
    class Meta:
        unique_together = ('source_id', 'external_id')
        indexes = [
            models.Index(fields=['lat', 'lon']),
        ]

    def __str__(self):
        return f"{self.external_id} ({self.source_id.name})"

class CarparkAvailability(models.Model):
    carpark_id = models.ForeignKey(
        'Carpark',
        on_delete=models.CASCADE,
        related_name='availability')
    available_lots = models.PositiveIntegerField()
    total_lots = models.PositiveIntegerField()

    def __str__(self):
        return f"Availability for carpark {self.carpark_id}"