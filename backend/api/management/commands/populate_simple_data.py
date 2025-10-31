# api/management/commands/populate_simple_data.py
from django.core.management.base import BaseCommand
from api.models import MRTLine, MRTStation, BusStop

class Command(BaseCommand):
    help = 'Populate simple initial data for testing'
    
    def handle(self, *args, **options):
        self.stdout.write('Starting to populate simple data...')
        
        try:
            # Create MRT Lines (simple - just line_code and name)
            self.create_mrt_lines()
            
            # Create MRT Stations  
            self.create_mrt_stations()
            
            # Create Bus Stops
            self.create_bus_stops()
            
            self.stdout.write(
                self.style.SUCCESS('✅ Successfully populated all data!')
            )
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Failed: {str(e)}')
            )
    
    def create_mrt_lines(self):
        """Create MRT lines - very simple"""
        lines = [
            ('NSL', 'North South Line'),
            ('EWL', 'East West Line'), 
            ('NEL', 'North East Line'),
            ('CCL', 'Circle Line'),
            ('DTL', 'Downtown Line'),
            ('TEL', 'Thomson East Coast Line'),
        ]
        
        for code, name in lines:
            obj, created = MRTLine.objects.get_or_create(
                line_code=code,
                defaults={'name': name}
            )
            if created:
                self.stdout.write(f'  ✅ Created MRT line: {name}')
            else:
                self.stdout.write(f'  ℹ️  MRT line already exists: {name}')
    
    def create_mrt_stations(self):
        """Create MRT stations"""
        stations = [
            ('NS1', 'Jurong East', 1.3330, 103.7422),
            ('NS4', 'Choa Chu Kang', 1.3854, 103.7444),
            ('NS16', 'Ang Mo Kio', 1.3699, 103.8494),
            ('NS24', 'Dhoby Ghaut', 1.2990, 103.8452),
            ('EW2', 'Tampines', 1.3534, 103.9454),
            ('EW12', 'Bugis', 1.3003, 103.8558),
            ('EW13', 'City Hall', 1.2934, 103.8527),
            ('CC1', 'Dhoby Ghaut', 1.2990, 103.8452),
        ]
        
        for code, name, lat, lng in stations:
            obj, created = MRTStation.objects.get_or_create(
                station_code=code,
                defaults={
                    'name': name,
                    'latitude': lat,
                    'longitude': lng
                }
            )
            if created:
                self.stdout.write(f'  ✅ Created MRT station: {name}')
    
    def create_bus_stops(self):
        """Create bus stops"""
        bus_stops = [
            ('01012', 'Victoria St', 'Hotel Grand Central', 1.3000, 103.8550),
            ('83139', 'Clementi Rd', 'Clementi Int', 1.3150, 103.7650),
            ('04168', 'Orchard Blvd', 'Orchard Stn', 1.3040, 103.8320),
        ]
        
        for code, road, desc, lat, lng in bus_stops:
            obj, created = BusStop.objects.get_or_create(
                bus_stop_code=code,
                defaults={
                    'road_name': road,
                    'description': desc,
                    'latitude': lat,
                    'longitude': lng,
                }
            )
            if created:
                self.stdout.write(f'  ✅ Created bus stop: {desc}')