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
def update_carpark_availability():

    # Loop through the sources
    sources = CarparkSource.objects.all()
    for source in sources:
        # Make API request
        if not source.availability_api_url:
            continue
        try:
            # Check for any necessary headers (api key etc.)
            headers = source.headers or {}

            response = requests.get(source.availability_api_url, headers=headers, timeout=10)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"[{source.name}] Failed to fetch info: {e}")
            continue

        mapping = source.field_mapping
        records = response.json().get("items",[])[0]
        records = records.get("carpark_data")

        # Get all associated Carpark
        carparks = {cp.external_id: cp for cp in Carpark.objects.filter(source=source)}

        print()
        for record in records:
            # Use external_id to compare availability
            external_id = record.get(mapping.get("external_id")) # THIS DOESNT WORK YET... CURRENTLY USING A WORKAROUND... NEED WORK ON THE MAPPING
            available_lots = record.get("carpark_info",[])[0].get(mapping.get("available_lots"))
            total_lots = record.get("carpark_info",[])[0].get(mapping.get("total_lots"))

            carpark = carparks.get(record.get("carpark_number"))
            if not carpark:
                continue

            CarparkAvailability.objects.update_or_create(
                carpark=carpark,
                defaults={"available_lots": available_lots,"total_lots":total_lots}
            )
            print("Carpark Updated")

@shared_task
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
            records = response.json().get("result").get("records")

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


