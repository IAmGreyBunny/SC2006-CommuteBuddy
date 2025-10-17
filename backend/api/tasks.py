# File for setting up celery tasks
# (e.g. carpark polling)
import os

from celery import shared_task
import requests
from dotenv import load_dotenv

load_dotenv()

# Test Task
@shared_task
def test_poll():
    print("Beat is Running Properly")
    return "Done"

@shared_task
def hdb_carpark_availability_poll():
    headers = {"X-Api-Key": os.getenv("HDB_CARPARK_AVAILABILITY_API_KEY")}
    response = requests.get('https://api.data.gov.sg/v1/transport/carpark-availability',headers=headers)

    print("Carpark Poll Successful")

