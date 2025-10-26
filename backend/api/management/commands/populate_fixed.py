from django.core.management.base import BaseCommand
from api.models import MRTLine, MRTStation, BusStop

class Command(BaseCommand):
    help = 'Populate fixed transport data'
    
    def handle(self, *args, **options):
        self.stdout.write('Populating transport data...')
        
        # Create stations first
        stations_data = [
            ('NS1', 'Jurong East', 1.3330, 103.7422),
            ('NS4', 'Choa Chu Kang', 1.3854, 103.7444), 
            ('NS16', 'Ang Mo Kio', 1.3699, 103.8494),
            ('NS24', 'Dhoby Ghaut', 1.2990, 103.8452),
            ('EW2', 'Tampines', 1.3534, 103.9454),
            ('EW12', 'Bugis', 1.3003, 103.8558),
        ]
        
        stations = {}
        for code, name, lat, lng in stations_data:
            station, created = MRTStation.objects.get_or_create(
                station_code=code,
                defaults={'name': name, 'latitude': lat, 'longitude': lng}
            )
            stations[code] = station
            self.stdout.write(f'✓ MRT Station: {name}')
        
        # Create MRT Lines with station references
        mrt_lines = [
            ('NSL', 'North South Line', 'NS1', 'NS24'),
            ('EWL', 'East West Line', 'EW2', 'EW12'),
            ('NEL', 'North East Line', 'NS16', 'NS24'),
            ('CCL', 'Circle Line', 'NS24', 'NS24'),
            ('DTL', 'Downtown Line', 'NS16', 'EW12'),
            ('TEL', 'Thomson East Coast Line', 'NS16', 'EW2'),
        ]
        
        for code, name, start_code, end_code in mrt_lines:
            MRTLine.objects.get_or_create(
                line_code=code,
                defaults={
                    'name': name,
                    'start_station': stations.get(start_code),
                    'end_station': stations.get(end_code)
                }
            )
            self.stdout.write(f'✓ MRT Line: {name}')
        
        # Bus Stops
        bus_stops = [
            ('01012', 'Victoria St', 'Hotel Grand Central', 1.3000, 103.8550),
            ('83139', 'Clementi Rd', 'Clementi Int', 1.3150, 103.7650),
            ('04168', 'Orchard Blvd', 'Orchard Stn', 1.3040, 103.8320),
        ]
        
        for code, road, desc, lat, lng in bus_stops:
            BusStop.objects.get_or_create(
                bus_stop_code=code,
                defaults={
                    'road_name': road,
                    'description': desc,
                    'latitude': lat,
                    'longitude': lng
                }
            )
            self.stdout.write(f'✓ Bus Stop: {desc}')
        
        self.stdout.write(self.style.SUCCESS('✅ Data populated successfully!'))