from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, unique=True)

    REQUIRED_FIELDS = ["username"]
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

class BusRoute(models.Model):
    service_no = models.CharField(max_length=10, unique=True)  # Changed from route_id
    operator = models.CharField(max_length=10)
    direction = models.IntegerField(default=1)
    category = models.CharField(max_length=10, default="TRUNK")

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

class CarparkSource(models.Model):
    name = models.CharField(max_length=100, unique=True)
    availability_api_url = models.URLField()
    info_api_url = models.URLField()
    headers = models.JSONField(blank=True, null=True, help_text="allows user to add additional info like api keys")
    field_mapping = models.JSONField(blank=True, null=True, help_text="Maps external fields to internal ones")

    def __str__(self):
        return self.name

class Carpark(models.Model):
    source = models.ForeignKey(
        'CarparkSource',
        on_delete=models.CASCADE,
        related_name='carparks'
    )
    external_id = models.CharField(max_length=100, db_index=True)
    x_coord = models.FloatField()
    y_coord = models.FloatField()

    class Meta:
        unique_together = ('source', 'external_id')
        indexes = [
            models.Index(fields=['x_coord', 'y_coord']),
        ]

    def __str__(self):
        return f"{self.external_id} ({self.source.name})"

class CarparkAvailability(models.Model):
    carpark = models.ForeignKey(Carpark, on_delete=models.CASCADE)
    available_lots = models.IntegerField()
    total_lots = models.IntegerField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.carpark.external_id} - {self.available_lots}/{self.total_lots}"