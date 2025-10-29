# File for setting up celery tasks
# (e.g. carpark polling)
from .models import CarparkSource, Carpark, CarparkAvailability
import os
import re

from celery import shared_task
import requests
from dotenv import load_dotenv

load_dotenv()


# Test Task
@shared_task
def test_poll():
    print("Beat is Running Properly")
    return "Done"

# Helper function for parsing api paths
# This still needs some work, currently it check if its a list or a dictionary,
# If list, it will access the element if index is specified, otherwise a list will be returned as data to be iterated
# If dictionary, it will access using the next item as key
def get_by_path(data, path):
    parts = path.split(".")
    for part in parts:
        match = re.match(r"([^\[\]]+)(?:\[(\d+)\])?", part)
        if not match:
            return None
        key, idx = match.groups()
        if isinstance(data, dict):
            data = data.get(key)
        else:
            return None
        if idx is not None:
            if isinstance(data, list):
                index = int(idx)
                if 0 <= index < len(data):
                    data = data[index]
                else:
                    return None
            else:
                return None
        if data is None:
            return None
    return data

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

        mapping = source.availability_path_mapping
        records = get_by_path(response.json(),mapping.get("records_path"))

        # Get all associated Carpark
        carparks = {cp.external_id: cp for cp in Carpark.objects.filter(source=source)}

        for record in records:
            # Use external_id to compare availability
            external_id = get_by_path(record,mapping.get("external_id"))
            available_lots = get_by_path(record,mapping.get("available_lots"))
            total_lots = get_by_path(record,mapping.get("total_lots"))

            carpark = carparks.get(external_id)
            if not carpark:
                continue

            CarparkAvailability.objects.update_or_create(
                carpark=carpark,
                defaults={"available_lots": available_lots,"total_lots":total_lots}
            )

@shared_task
def update_carpark_info():
    sources = CarparkSource.objects.all()

    for source in sources:
        if not source.info_api_url:
            continue

        try:
            headers = source.headers or {}
            mapping = source.info_path_mapping
            all_records = []
            limit = 100  # depends on the API — adjust as needed
            offset = 0

            while True:
                # Construct paginated URL (common pattern)
                params = {"limit": limit, "offset": offset}
                response = requests.get(source.info_api_url, headers=headers, params=params, timeout=10)
                response.raise_for_status()

                data = response.json()
                records = get_by_path(data, mapping.get("records_path"))
                if not records:
                    break  # no more pages
                all_records.extend(records)

                # Stop if fewer than `limit` were returned (last page)
                if len(records) < limit:
                    break

                offset += limit  # move to next page

        except requests.RequestException as e:
            print(f"[{source.name}] Failed to fetch info: {e}")
            continue

        # Loop through all collected carpark info
        for record in all_records:
            external_id = get_by_path(record, mapping.get("external_id"))
            x_coord = get_by_path(record, mapping.get("x_coord"))
            y_coord = get_by_path(record, mapping.get("y_coord"))
            name = get_by_path(record, mapping.get("name"))

            Carpark.objects.update_or_create(
                source=source,
                external_id=external_id,
                defaults={
                    "name": name,
                    "x_coord": x_coord,
                    "y_coord": y_coord,
                }
            )


