# File for setting up celery tasks
# (e.g. carpark polling)
from .models import CarparkSource, Carpark, CarparkAvailability
import os

from celery import shared_task
import requests
from dotenv import load_dotenv

load_dotenv()


# Test Task
@shared_task
def test_poll():
    print("Beat is Running Properly")
    return "Done"


@shared_task
def hdb_carpark_availability_poll():
    headers = {"X-Api-Key": os.getenv("HDB_CARPARK_AVAILABILITY_API_KEY")}

    # Loop through the sources (Dummy data for now)

    # Get all associated Carpark and it's CarparkAvailability

    # Use external_id to compare availability

    # Collect objects that needs to be updated

def update_carpark_info():
    sources = CarparkSource.objects.all()
    for source in sources:
        # Make API request
        if not source.info_api_url:
            continue
        try:
            # Check for any necessary headers (api key etc.)
            headers = source.headers or {}

            response = requests.get(source.info_api_url, headers=headers,timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"[{source.name}] Failed to fetch info: {e}")
            continue

        records = []
        if response.json():
            records = response.json()["records"]

        # Loop through collected carpark info
        mapping = source.field_mapping

        for record in records:
            external_id = record.get(mapping.get("external_id"))
            x_coord = record.get(mapping.get("x_coord"))
            y_coord = record.get(mapping.get("y_coord"))

            # Update database
            Carpark.objects.update_or_create(
                source=source,
                external_id=external_id,
                defaults={
                    "x_coord": x_coord,
                    "y_coord": y_coord,
                }
            )


