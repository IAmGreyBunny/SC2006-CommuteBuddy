# File For Setting Up Celery
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab
import platform

# Set default Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Create Celery app
app = Celery('backend')

# Load config from Django settings, using CELERY_ namespace
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks from all apps
app.autodiscover_tasks()

# This run celery task on a schedule
app.conf.beat_schedule = {
    "test_poll": {
        "task": "api.tasks.test_poll",
        "schedule": 30.0,
    },
    "update_carpark_availability": {
        "task": "api.tasks.update_carpark_availability",
        "schedule": 20.0,  # every 20 seconds
    },
    "update_carpark_info": {
        "task": "api.tasks.update_carpark_info",
        "schedule": 120.0,  # every 120 seconds
    }
}

# Automatically choose pool type and concurrency
# not doing this will fail on windows
if platform.system() == "Windows":
    app.conf.worker_pool = "threads"
    app.conf.worker_concurrency = 8  # Increased for better performance
else:
    app.conf.worker_pool = "prefork"
    app.conf.worker_concurrency = 8  # Increased for better performance
