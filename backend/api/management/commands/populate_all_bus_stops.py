from django.core.management.base import BaseCommand
from api.models import BusStop
from api.services.lta_service import LTADataService
import time

class Command(BaseCommand):
    help = 'Populate ALL bus stops from LTA API'
    
    def handle(self, *args, **options):
        self.stdout.write('🚍 Fetching ALL bus stops from LTA API...')
        
        service = LTADataService()
        result = service.get_all_bus_stops()
        
        if result['success']:
            count = 0
            total = len(result['data'])
            self.stdout.write(f'Found {total} bus stops to process...')
            
            for stop_data in result['data']:
                try:
                    # Skip if essential data is missing
                    if not stop_data.get('BusStopCode') or not stop_data.get('Description'):
                        continue
                    
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
                    
                    # Progress update every 100 records
                    if count % 100 == 0:
                        self.stdout.write(f'✅ Processed {count}/{total} bus stops...')
                        
                except Exception as e:
                    self.stdout.write(f'❌ Error with {stop_data.get("BusStopCode", "Unknown")}: {str(e)}')
                    continue
            
            self.stdout.write(
                self.style.SUCCESS(f'🎉 Successfully populated {count} bus stops!')
            )
            
            # Verify the count
            final_count = BusStop.objects.count()
            self.stdout.write(f'📊 Total bus stops in database: {final_count}')
            
        else:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed to fetch bus stops: {result.get("error", "Unknown error")}')
            )