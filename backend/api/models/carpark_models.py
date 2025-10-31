from django.db import models

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