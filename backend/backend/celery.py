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

    # Bus arrival polling - all major bus stops in batches
    "poll_all_bus_arrivals_batch_1": {
        "task": "api.tasks.poll_bus_arrivals_batch",
        "schedule": 30.0,
        "kwargs": {'batch_number': 1, 'total_batches': 10}
    },
    "poll_all_bus_arrivals_batch_2": {
        "task": "api.tasks.poll_bus_arrivals_batch",
        "schedule": 30.0,
        "kwargs": {'batch_number': 2, 'total_batches': 10}
    },
    "poll_all_bus_arrivals_batch_3": {
        "task": "api.tasks.poll_bus_arrivals_batch",
        "schedule": 30.0,
        "kwargs": {'batch_number': 3, 'total_batches': 10}
    },

    # MRT crowd density polling
    "poll_mrt_crowd_nsl": {
        "task": "api.tasks.poll_mrt_crowd_density",
        "schedule": 60.0,
        "kwargs": {'train_line': 'NSL'}
    },
    "poll_mrt_crowd_ewl": {
        "task": "api.tasks.poll_mrt_crowd_density",
        "schedule": 60.0,
        "kwargs": {'train_line': 'EWL'}
    },
    "poll_mrt_crowd_nel": {
        "task": "api.tasks.poll_mrt_crowd_density",
        "schedule": 60.0,
        "kwargs": {'train_line': 'NEL'}
    },
    "poll_mrt_crowd_ccl": {
        "task": "api.tasks.poll_mrt_crowd_density",
        "schedule": 60.0,
        "kwargs": {'train_line': 'CCL'}
    },
    "poll_mrt_crowd_dtl": {
        "task": "api.tasks.poll_mrt_crowd_density",
        "schedule": 60.0,
        "kwargs": {'train_line': 'DTL'}
    },
    "poll_mrt_crowd_tel": {
        "task": "api.tasks.poll_mrt_crowd_density",
        "schedule": 60.0,
        "kwargs": {'train_line': 'TEL'}
    },

    # MRT service alerts
    "poll_mrt_service_alerts": {
        "task": "api.tasks.poll_mrt_service_alerts",
        "schedule": 120.0,
    },

    "poll_popular_bus_stops": {
    "task": "api.tasks.poll_popular_bus_stops",
    "schedule": 15.0,  # Every 15 seconds for popular stops
    },

    # Existing tasks

    "populate_bus_stops_daily": {
        "task": "api.tasks.populate_bus_stops",
        "schedule": crontab(hour=2, minute=0),
    },
    "update_carpark_availability": {
        "task": "api.tasks.update_carpark_availability",
        "schedule": 20.0,  # every 20 seconds
    },
    "update_carpark_info": {
        "task": "api.tasks.update_carpark_info",
        "schedule": 60.0,  # every 60 seconds
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