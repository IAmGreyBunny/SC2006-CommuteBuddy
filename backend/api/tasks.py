# File for setting up celery tasks
# (e.g. carpark polling)
from .models import CarparkSource, Carpark, CarparkAvailability
import re

from celery import shared_task
import requests
from dotenv import load_dotenv
from django.core.cache import cache
import logging
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import transaction, DatabaseError
import time


load_dotenv()

logger = logging.getLogger(__name__)

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

# NEW PUBLIC TRANSPORT TASKS
@shared_task(bind=True, max_retries=3)
def poll_bus_arrivals_batch(self, batch_number=1, total_batches=10):
    """Poll LTA API for bus arrivals in batches with retry logic"""
    from .services.lta_service import LTADataService
    from .models import BusStop, RealTimeBus, BusRoute
    import logging

    logger = logging.getLogger(__name__)
    service = LTADataService()

    # Get all bus stops and split into batches
    all_stops = BusStop.objects.all().order_by('bus_stop_code')
    total_stops = all_stops.count()
    
    batch_size = total_stops // total_batches
    start_index = (batch_number - 1) * batch_size
    end_index = start_index + batch_size if batch_number < total_batches else total_stops
    
    batch_stops = all_stops[start_index:end_index]
    
    logger.info(f"Processing batch {batch_number}/{total_batches}: {len(batch_stops)} bus stops")
    
    updated_count = 0
    error_count = 0

    for stop in batch_stops:
        try:
            result = service.get_bus_arrival(stop.bus_stop_code)

            if result['success']:
                for service_data in result['data'].get('Services', []):
                    try:
                        # Use atomic transaction for each bus update
                        with transaction.atomic():
                            # Get or create bus route
                            route, created = BusRoute.objects.get_or_create(
                                route_id=service_data['ServiceNo'],
                                defaults={
                                    'service_no': service_data['ServiceNo'],
                                    'operator': service_data['Operator'],
                                    'direction': 1,
                                    'category': 'TRUNK'
                                }
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

                    except DatabaseError as e:
                        logger.warning(f"Database locked for bus {service_data['ServiceNo']} at stop {stop.bus_stop_code}, retrying...")
                        time.sleep(0.1)  # Small delay before retry
                        try:
                            with transaction.atomic():
                                route, created = BusRoute.objects.get_or_create(
                                    route_id=service_data['ServiceNo'],
                                    defaults={
                                        'service_no': service_data['ServiceNo'],
                                        'operator': service_data['Operator'],
                                        'direction': 1,
                                        'category': 'TRUNK'
                                    }
                                )

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
                        except DatabaseError:
                            logger.error(f"Failed to update bus {service_data['ServiceNo']} after retry")
                            error_count += 1
                            continue

                    except Exception as e:
                        logger.error(f"Error processing bus {service_data['ServiceNo']} at stop {stop.bus_stop_code}: {str(e)}")
                        error_count += 1
                        continue

        except Exception as e:
            logger.error(f"Error polling bus stop {stop.bus_stop_code}: {str(e)}")
            error_count += 1
            continue

    logger.info(f"Batch {batch_number}: Updated {updated_count} bus positions, {error_count} errors")
    return f"Batch {batch_number}: Updated {updated_count} bus positions"

@shared_task(bind=True, max_retries=3)
def poll_popular_bus_stops(self):
    """Poll only popular/high-traffic bus stops more frequently with better error handling"""
    from .services.lta_service import LTADataService
    from .models import RealTimeBus, BusRoute

    service = LTADataService()
    
    # Define popular bus stops (interchanges, MRT stations, etc.)
    popular_stops = [
        '75009',  # Boon Lay Int
        '64009',  # Ang Mo Kio Int
        '54009',  # Bedok Int
        '77009',  # Tampines Int
        '52009',  # Pasir Ris Int
        '83139',  # Clementi Int
        '01012',  # Bugis
        '04168',  # Orchard
        '02061',  # Orchard Stn
        '03031',  # Suntec City
    ]

    updated_count = 0
    error_count = 0

    for stop_code in popular_stops:
        try:
            result = service.get_bus_arrival(stop_code)

            if result['success']:
                for service_data in result['data'].get('Services', []):
                    try:
                        # Use atomic transaction for each update
                        with transaction.atomic():
                            route, created = BusRoute.objects.get_or_create(
                                route_id=service_data['ServiceNo'],
                                defaults={
                                    'service_no': service_data['ServiceNo'],
                                    'operator': service_data['Operator'],
                                    'direction': 1,
                                    'category': 'TRUNK'
                                }
                            )

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

                    except DatabaseError as e:
                        logger.warning(f"Database locked for popular bus {service_data['ServiceNo']} at {stop_code}, skipping...")
                        error_count += 1
                        continue
                    except Exception as e:
                        logger.error(f"Error processing popular bus {service_data['ServiceNo']}: {str(e)}")
                        error_count += 1
                        continue

        except Exception as e:
            logger.error(f"Error polling popular bus stop {stop_code}: {str(e)}")
            error_count += 1
            continue

    logger.info(f"Popular stops: Updated {updated_count} positions, {error_count} errors")
    return f"Updated {updated_count} popular bus positions"

@shared_task
def poll_mrt_crowd_density(train_line):
    """Poll MRT crowd density for a specific train line"""
    from .services.lta_service import LTADataService
    import logging

    logger = logging.getLogger(__name__)
    service = LTADataService()

    try:
        # Get real-time crowd density
        real_time_result = service.get_mrt_crowd_real_time(train_line)
        
        if real_time_result['success']:
            # Cache the real-time data
            cache_key = f"mrt_crowd_realtime_{train_line}"
            cache.set(cache_key, real_time_result['data'], timeout=300)
            logger.info(f"Updated real-time crowd density for {train_line}")
        else:
            logger.error(f"Failed to get real-time crowd density for {train_line}: {real_time_result.get('error')}")

        # Get forecast data
        forecast_result = service.get_mrt_crowd_forecast(train_line)
        
        if forecast_result['success']:
            # Cache the forecast data
            cache_key = f"mrt_crowd_forecast_{train_line}"
            cache.set(cache_key, forecast_result['data'], timeout=3600)
            logger.info(f"Updated forecast crowd density for {train_line}")
        else:
            logger.error(f"Failed to get forecast crowd density for {train_line}: {forecast_result.get('error')}")

        return f"Updated crowd density for {train_line}"

    except Exception as e:
        logger.error(f"Error polling MRT crowd density for {train_line}: {str(e)}")
        return f"Error polling MRT crowd density for {train_line}"

@shared_task
def poll_mrt_service_alerts():
    """Poll MRT service alerts and disruptions"""
    from .services.lta_service import LTADataService
    from .models import TransportAlert
    import logging

    logger = logging.getLogger(__name__)
    service = LTADataService()

    try:
        result = service.get_train_service_alerts()

        if result['success']:
            data = result['data']
            
            # Use atomic transaction for alert updates
            try:
                with transaction.atomic():
                    # Clear old active alerts
                    TransportAlert.objects.filter(active=True, alert_type='DISRUPTION').update(active=False)
                    
                    # Check if there are any disruptions
                    status = data.get('value', {}).get('Status', 1)
                    
                    if status != 1:  # 1 means normal service
                        affected_segments = data.get('value', {}).get('AffectedSegments', [])
                        messages = data.get('value', {}).get('Message', [])
                        
                        # Create alerts for disruptions
                        for segment in affected_segments:
                            TransportAlert.objects.create(
                                alert_type='DISRUPTION',
                                message=f"Service disruption on {segment.get('Line', 'Unknown line')}",
                                severity='HIGH',
                                active=True,
                                expires_at=timezone.now() + timedelta(hours=2)
                            )
                        
                        for message in messages:
                            if message:  # Check if message is not empty
                                TransportAlert.objects.create(
                                    alert_type='DISRUPTION',
                                    message=message,
                                    severity='HIGH',
                                    active=True,
                                    expires_at=timezone.now() + timedelta(hours=2)
                                )
                        
                        logger.info(f"Created {len(affected_segments) + len(messages)} disruption alerts")
                    else:
                        logger.info("No MRT service disruptions detected")
            except DatabaseError:
                logger.warning("Database locked while updating MRT alerts, will retry next cycle")
            
            # Cache the alerts data
            cache.set("mrt_service_alerts", data, timeout=300)
            
            return "Updated MRT service alerts"
        else:
            logger.error(f"Failed to get MRT service alerts: {result.get('error')}")
            return f"Failed to get MRT service alerts: {result.get('error')}"

    except Exception as e:
        logger.error(f"Error polling MRT service alerts: {str(e)}")
        return f"Error polling MRT service alerts: {str(e)}"

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
            try:
                with transaction.atomic():
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
            except DatabaseError:
                logger.warning(f"Database locked while creating bus stop {stop_data['BusStopCode']}")
                continue
        return f"Populated {count} bus stops"
    return "Failed to populate bus stops"