# File for setting up celery tasks
# (e.g. carpark polling)
from celery import shared_task
import time


# Test Task
@shared_task
def test_poll():
    """
    Sample task that simulates polling an external API
    and updating your Django models.
    """
    print("Starting polling task...")
    time.sleep(2)  # Simulate network delay or processing
    print("Polling complete!")
    return "Done"