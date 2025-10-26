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

# NEW PUBLIC TRANSPORT TASKS
@shared_task
def poll_bus_arrivals():
    """Poll LTA API for bus arrivals and update RealTimeBus entities"""
    from .services.lta_service import LTADataService
    from .models import BusStop, RealTimeBus, BusRoute
    from django.utils import timezone
    import logging

    logger = logging.getLogger(__name__)
    service = LTADataService()

    # Get some popular bus stops to poll
    popular_stops = ['83139', '83141', '01012', '01013', '02061']

    updated_count = 0

    for stop_code in popular_stops:
        result = service.get_bus_arrival(stop_code)

        if result['success']:
            # Process and update RealTimeBus entities
            for service_data in result['data'].get('Services', []):
                try:
                    # Get or create bus route
                    route, created = BusRoute.objects.get_or_create(
                        route_id=service_data['ServiceNo'],
                        defaults={'name': f"Bus {service_data['ServiceNo']}"}
                    )

                    # Update real-time bus positions
                    next_bus = service_data.get('NextBus', {})
                    if next_bus and next_bus.get('Latitude') and next_bus.get('Longitude'):
                        RealTimeBus.objects.update_or_create(
                            route=route,
                            defaults={
                                'latitude': float(next_bus.get('Latitude', 0)),
                                'longitude': float(next_bus.get('Longitude', 0)),
                                'last_updated': timezone.now()
                            }
                        )
                        updated_count += 1

                except Exception as e:
                    logger.error(f"Error processing bus {service_data['ServiceNo']}: {str(e)}")
                    continue

    logger.info(f"Updated {updated_count} real-time bus positions")
    return f"Updated {updated_count} bus positions"

@shared_task
def populate_bus_stops():
    """Populate bus stops from LTA API"""
    from .services.lta_service import LTADataService
    from .models import BusStop

    service = LTADataService()
    result = service.get_all_bus_stops()

    if result['success']:
        count = 0
        for stop_data in result['data']:
            BusStop.objects.update_or_create(
                bus_stop_code=stop_data['BusStopCode'],
                defaults={
                    'road_name': stop_data.get('RoadName', ''),
                    'description': stop_data.get('Description', ''),
                    'latitude': float(stop_data.get('Latitude', 0)),
                    'longitude': float(stop_data.get('Longitude', 0)),
                }
            )
            count += 1
        return f"Populated {count} bus stops"
    return "Failed to populate bus stops"