import time
import subprocess
import platform
import requests
import os

# Define the base URL for localhost
base_url = "http://localhost:5010"

def check_instances():
    while True:
        try:
            response = requests.get(f"{base_url}/heartbeat")
            if response.status_code != 200:
                print("Instance is not responding. Restarting...")
                start_instance()
        except requests.RequestException as e:
            print(f"Error checking instance: {e}")
            print("Restarting instance...")
            start_instance()

        # Wait for some time before checking again (e.g., every 5 seconds)
        time.sleep(5)

def start_instance():
    if platform.system() == "Windows":
        os.system(f'start cmd /c python C:\\CPSC-559\\auth.py"')
    else:
        os.system(f'python auth.py')

if __name__ == "__main__":
    check_instances()