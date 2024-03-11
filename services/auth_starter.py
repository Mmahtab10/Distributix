import subprocess
from flask import Flask, request
import os

app = Flask(__name__)

# Function to check if a port is available
def check_port_available(port):
    try:
        result = subprocess.run(['lsof', '-i', f':{port}'], stdout=subprocess.PIPE)
        if result.returncode == 0:
            return False
        else:
            return True
    except Exception as e:
        print(f"An error occurred while checking port availability: {e}")
        return False

# Function to kill any process using the specified port
def kill_process_using_port(port):
    try:
        subprocess.run(['kill', '-9', f'$(lsof -ti:{port})'])
    except Exception as e:
        print(f"An error occurred while killing the process: {e}")

# REST endpoint to start an app on a specified port
@app.route('/start-app', methods=['POST'])
def start_app():
    try:
        data = request.json  # Extract JSON data from the request body
        name = data.get('name')  # Get the app name from the JSON data
        port = data.get('port')  # Get the port number from the JSON data

        # Check if both name and port are provided in the JSON data
        if name is None or port is None:
            return "Both 'name' and 'port' must be provided in the request body.", 400

        # Check if the port is available, and if not, free it by killing the process using it
        if not check_port_available(port):
            kill_process_using_port(port)

        # Start the Flask app on the specified port
        os.system(f"nohup flask --app {name}.py run --port {port} &")
        return f"{name.capitalize()} started on port {port}.", 200
    except Exception as e:
        return f"An error occurred: {e}", 500

if __name__ == '__main__':
    app.run(debug=True, port=5007)
