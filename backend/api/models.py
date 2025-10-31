from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

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

class BusStop(models.Model):
    bus_stop_code = models.CharField(max_length=50, unique=True)  # Changed from stop_id
    road_name = models.CharField(max_length=200, blank=True)
    description = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return f"{self.description} ({self.bus_stop_code})"

# class BusRoute(models.Model):
#     service_no = models.CharField(max_length=10, unique=True)  # Changed from route_id
#     operator = models.CharField(max_length=10)
#     direction = models.IntegerField(default=1)
#     category = models.CharField(max_length=10, default="TRUNK")

#     def __str__(self):
#         return f"Bus {self.service_no}"


# api/models.py - Add route_id field to BusRoute
class BusRoute(models.Model):
    route_id = models.CharField(max_length=10, unique=True, blank=True, null=True)  # Add this line
    service_no = models.CharField(max_length=10, unique=True)
    operator = models.CharField(max_length=10)
    direction = models.IntegerField(default=1)
    category = models.CharField(max_length=10, default="TRUNK")

    def save(self, *args, **kwargs):
        # Auto-populate route_id from service_no if not provided
        if not self.route_id:
            self.route_id = self.service_no
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Bus {self.service_no}"

class BusSchedule(models.Model):
    route = models.ForeignKey(BusRoute, on_delete=models.CASCADE)
    stop = models.ForeignKey(BusStop, on_delete=models.CASCADE)
    arrival_time = models.TimeField()
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('route', 'stop', 'arrival_time')

class RealTimeBus(models.Model):
    route = models.ForeignKey(BusRoute, on_delete=models.CASCADE)
    latitude = models.FloatField()
    longitude = models.FloatField()
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Bus {self.route.service_no} at {self.last_updated}"

class MRTLine(models.Model):
    LINE_CHOICES = [
        ('NSL', 'North South Line'),
        ('EWL', 'East West Line'),
        ('NEL', 'North East Line'),
        ('CCL', 'Circle Line'),
        ('DTL', 'Downtown Line'),
        ('TEL', 'Thomson East Coast Line'),
    ]

    line_code = models.CharField(max_length=20, choices=LINE_CHOICES, unique=True)
    name = models.CharField(max_length=100)
    start_station = models.ForeignKey(
        'MRTStation',
        on_delete=models.CASCADE,
        related_name='line_start',
        null=True,  # Make it optional for now
        blank=True
    )
    end_station = models.ForeignKey(
        'MRTStation',
        on_delete=models.CASCADE,
        related_name='line_end',
        null=True,  # Make it optional for now
        blank=True
    )

    def __str__(self):
        return self.name

class MRTStation(models.Model):
    station_code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    lines = models.ManyToManyField(MRTLine, related_name='stations')

    def __str__(self):
        return f"{self.name} ({self.station_code})"

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
    route_id = models.CharField(max_length=50)
    nickname = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

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

    SEVERITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
    ]

    alert_type = models.CharField(max_length=20, choices=ALERT_TYPE_CHOICES)
    message = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, default="MEDIUM")
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.alert_type}: {self.message[:30]}"


# Add this to your existing models.py, before the BusStop model


def default_info_mapping():
    return {
        "records_path": "result.records",  # path to the list of records
        "external_id": "car_park_no",
        "x_coord": "x_coord",
        "y_coord": "y_coord",
        "name": "address"
    }


def default_availability_mapping():
    return {
        "records_path": "items[0].carpark_data",   # path to the list of carparks
        "external_id": "carpark_number",         # unique carpark ID
        "total_lots": "carpark_info[0].total_lots",      # first entry in carpark_info
        "available_lots": "carpark_info[0].lots_available",  # first entry
    }


class CarparkSource(models.Model):
    name = models.CharField(max_length=100, unique=True)
    availability_api_url = models.URLField()
    info_api_url = models.URLField()
    headers = models.JSONField(blank=True, null=True, help_text="allows user to add additional info like api keys")

    # optional — store how external fields map to internal ones
    info_path_mapping = models.JSONField(blank=True, default=default_info_mapping)
    availability_path_mapping = models.JSONField(blank=True, default=default_availability_mapping)

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

    name = models.CharField(
        max_length=512,
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
        return f"({self.source.name}) | {self.external_id} | {self.name}"


class CarparkAvailability(models.Model):
    carpark = models.ForeignKey(
        'Carpark',
        on_delete=models.CASCADE,
        related_name='availability')
    available_lots = models.PositiveIntegerField()
    total_lots = models.PositiveIntegerField()

    def __str__(self):
        return f"Availability for carpark {self.carpark}"
