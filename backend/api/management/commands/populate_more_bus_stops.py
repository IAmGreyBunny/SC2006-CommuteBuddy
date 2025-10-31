# api/management/commands/populate_more_bus_stops.py
from django.core.management.base import BaseCommand
from api.models import BusStop

class Command(BaseCommand):
    help = 'Populate more bus stops for testing'
    
    def handle(self, *args, **options):
        major_bus_stops = [
            # Major interchanges
            ('75009', 'Boon Lay Way', 'Boon Lay Int', 1.3386, 103.7060),
            ('64009', 'Ang Mo Kio Ave 8', 'Ang Mo Kio Int', 1.3699, 103.8494),
            ('54009', 'Bedok Rd', 'Bedok Int', 1.3239, 103.9273),
            ('77009', 'Tampines Ave 7', 'Tampines Int', 1.3534, 103.9454),
            ('65009', 'Jurong West Ave 1', 'Jurong West Int', 1.3493, 103.7247),
            ('52009', 'Pasir Ris Dr 1', 'Pasir Ris Int', 1.3724, 103.9495),
            ('72009', 'Sengkang East Way', 'Sengkang Int', 1.3925, 103.8950),
            ('66009', 'Punggol Central', 'Punggol Temp Int', 1.4044, 103.9024),
            # Popular stops
            ('02061', 'Orchard Rd', 'Orchard Stn', 1.3040, 103.8318),
            ('03031', 'Raffles Blvd', 'Suntec City', 1.2945, 103.8573),
            ('04111', 'Victoria St', 'Bugis Stn', 1.3003, 103.8558),
            ('05013', 'Bras Basah Rd', 'SMU', 1.2970, 103.8505),
            ('06009', 'Stamford Rd', 'City Hall Stn', 1.2934, 103.8527),
            ('07019', 'Fullerton Rd', 'One Fullerton', 1.2865, 103.8542),
        ]
        
        created_count = 0
        for bus_stop_code, road_name, description, lat, lng in major_bus_stops:
            obj, created = BusStop.objects.get_or_create(
                bus_stop_code=bus_stop_code,
                defaults={
                    'road_name': road_name,
                    'description': description,
                    'latitude': lat,
                    'longitude': lng,
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f'✅ Created: {description}')
        
        self.stdout.write(self.style.SUCCESS(f'Created {created_count} new bus stops!'))