
from django.core.management.base import BaseCommand
from api.models import MRTLine

class Command(BaseCommand):
    help = 'Populate MRT lines'
    
    def handle(self, *args, **options):
        self.stdout.write('🛤️ Creating MRT lines...')
        
        mrt_lines = [
            ('NSL', 'North South Line'),
            ('EWL', 'East West Line'),
            ('NEL', 'North East Line'),
            ('CCL', 'Circle Line'),
            ('DTL', 'Downtown Line'),
            ('TEL', 'Thomson East Coast Line'),
        ]
        
        created_count = 0
        for line_code, name in mrt_lines:
            obj, created = MRTLine.objects.get_or_create(
                line_code=line_code,
                defaults={'name': name}
            )
            if created:
                created_count += 1
                self.stdout.write(f'✅ Created: {name} ({line_code})')
            else:
                self.stdout.write(f'ℹ️ Already exists: {name} ({line_code})')
        
        self.stdout.write(
            self.style.SUCCESS(f'🎉 Created {created_count} new MRT lines!')
        )