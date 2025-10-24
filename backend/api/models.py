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
    availability_api_url = models.URLField()
    info_api_url = models.URLField()
    headers = models.JSONField(blank=True, null=True, help_text="allows user to add additional info like api keys")

    # optional — store how external fields map to internal ones
    field_mapping = models.JSONField(blank=True, null=True, help_text="Maps external fields to internal ones")

    def __str__(self):
        return self.name

class Carpark(models.Model):
    source = models.ForeignKey(
        'CarparkSource',
        on_delete=models.CASCADE,
        related_name='carparks'
    )

    # This helps us identify the carparks from the external api
    external_id = models.CharField(
        max_length=100,
        db_index=True
    )

    x_coord = models.FloatField()
    y_coord = models.FloatField()

    # The indexes help to improve read performance
    class Meta:
        unique_together = ('source', 'external_id')
        indexes = [
            models.Index(fields=['x_coord', 'y_coord']),
        ]

    def __str__(self):
        return f"{self.external_id} ({self.source_id.name})"

# Public Transport Models

class BusStop(models.Model):
    stop_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"{self.name} ({self.stop_id})"


class BusRoute(models.Model):
    route_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    start_stop = models.ForeignKey(BusStop, on_delete=models.CASCADE, related_name='route_starts')
    end_stop = models.ForeignKey(BusStop, on_delete=models.CASCADE, related_name='route_ends')

    def __str__(self):
        return f"{self.name} ({self.route_id})"


class BusSchedule(models.Model):
    route = models.ForeignKey(BusRoute, on_delete=models.CASCADE)
    stop = models.ForeignKey(BusStop, on_delete=models.CASCADE)
    arrival_time = models.TimeField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('route', 'stop', 'arrival_time')

    def __str__(self):
        return f"{self.route} @ {self.stop} -> {self.arrival_time}"


class RealTimeBus(models.Model):
    route = models.ForeignKey(BusRoute, on_delete=models.CASCADE)
    current_stop = models.ForeignKey(BusStop, on_delete=models.SET_NULL, null=True, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Bus {self.id} on {self.route.name} at {self.current_stop}"

class MRTStation(models.Model):
    station_code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"{self.name} ({self.station_code})"


class MRTLine(models.Model):
    line_code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    start_station = models.ForeignKey(MRTStation, on_delete=models.CASCADE, related_name='line_start')
    end_station = models.ForeignKey(MRTStation, on_delete=models.CASCADE, related_name='line_end')

    def __str__(self):
        return f"{self.name} ({self.line_code})"


class MRTSchedule(models.Model):
    line = models.ForeignKey(MRTLine, on_delete=models.CASCADE)
    station = models.ForeignKey(MRTStation, on_delete=models.CASCADE)
    arrival_time = models.TimeField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('line', 'station', 'arrival_time')


class UserPreference(models.Model):
    TRANSPORT_CHOICES = [
        ("BUS", "Bus"),
        ("MRT", "MRT"),
        ("MIXED", "Mixed"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="preference")
    preferred_transport = models.CharField(max_length=10, choices=TRANSPORT_CHOICES, default="MIXED")
    avoid_crowded_routes = models.BooleanField(default=False)
    receive_alerts = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.user.username}'s Preferences"



class FavouriteRoute(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favourites")
    route_type = models.CharField(max_length=10, choices=[("bus", "Bus"), ("mrt", "MRT")])
    route_id = models.CharField(max_length=50)  # Could reference BusRoute or MRTLine
    nickname = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('user', 'route_id', 'route_type')

    def __str__(self):
        return f"{self.user.email} - {self.route_type.upper()} {self.route_id}"


class TransportAlert(models.Model):
    ALERT_TYPE_CHOICES = [
        ("PEAK", "Peak Hour"),
        ("DISRUPTION", "Service Disruption"),
        ("INFO", "Information"),
    ]

    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    message = models.TextField()
    affected_routes = models.ManyToManyField("BusRoute", blank=True)
    affected_mrt_lines = models.ManyToManyField("MRTLine", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.alert_type}: {self.message[:30]}"

