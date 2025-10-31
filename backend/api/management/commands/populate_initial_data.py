from django.core.management.base import BaseCommand
from api.models import MRTLine, MRTStation
from api.services.lta_service import LTADataService

class Command(BaseCommand):
    help = 'Populate initial MRT data'
    
    def handle(self, *args, **options):
        # Create MRT Lines
        mrt_lines = [
            ('NSL', 'North South Line'),
            ('EWL', 'East West Line'),
            ('NEL', 'North East Line'),
            ('CCL', 'Circle Line'),
            ('DTL', 'Downtown Line'),
            ('TEL', 'Thomson East Coast Line'),
        ]
        
        for line_code, name in mrt_lines:
            MRTLine.objects.get_or_create(line_code=line_code, defaults={'name': name})
        
        self.stdout.write(self.style.SUCCESS('Successfully populated MRT lines'))