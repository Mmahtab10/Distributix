import time
import subprocess
import platform
import requests
import os

# Define the base URL of your instances and the service IDs
base_url = "http://localhost:500"
service_ids = [1, 2, 3]

def check_instances():
    while True:
        for service_id in service_ids:
            url = f"{base_url}{service_id}/heartbeat"
            try:
                response = requests.get(url)
                if response.status_code != 200:
                    print(f"Instance with service ID {service_id} is not responding. Restarting...")
                    start_instance(service_id)
            except requests.RequestException as e:
                print(f"Error checking instance with service ID {service_id}: {e}")
                print(f"Restarting instance with service ID {service_id}...")
                start_instance(service_id)

        # Wait for some time before checking again (e.g., every 5 minutes)
        time.sleep(20)

def start_instance(service_id):
    if platform.system() == "Windows":
        os.system(f'start cmd /c "set SERVICE_ID={service_id} && python C:\\CPSC-559\\communication.py" && curl -X POST http://localhost:500{service_id}/initiate_election')
    else:
        os.system(f'python communication.py {service_id} && curl -X POST http://localhost:500{service_id}/initiate_election')

if __name__ == "__main__":
    check_instances()
