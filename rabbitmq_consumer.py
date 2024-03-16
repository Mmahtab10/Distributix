import pika  # Import pika for interacting with RabbitMQ
import requests  # Import requests to make HTTP requests (for forwarding orders)
import paramiko
from apscheduler.schedulers.background import BackgroundScheduler


# Initialize the SSH client
ssh_client = paramiko.SSHClient()
ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

# Setup RabbitMQ connection and channel
# ...
# Assuming you've already set up the RabbitMQ connection and channel

# Configuration for your services
services = {
    'auth_service': {'host': 'auth_service_host', 'health_check_url': 'http://127.0.0.1:5001/authHealth', 'restart': 'http://127.0.0.1:5007/start-app', 'port': 5001},
    'ticket_service': {'host': 'ticket_service_host', 'health_check_url': 'http://127.0.0.1:5003/ticketHealth', 'restart': 'http://127.0.0.1:5007/start-app', 'port': 5003},
    'order_service': {'host': 'order_service_host', 'health_check_url': 'http://127.0.0.1:5002/orderHealth', 'restart': 'http://127.0.0.1:5007/start-app', 'port': 5002},
    'order_queue_service': {'host': 'order_queue_service_host', 'health_check_url': 'http://127.0.0.1:5004/orderQueueHealth', 'restart': 'http://127.0.0.1:5007/start-app', 'port': 5004},
}

# Function to restart a service on its host
def restart_service(host, name, port, restart):
    json_data = {
        "name": name,
        "port": port
    }
    response = requests.post(restart, json=json_data)
    print(response.text)

# Function to perform a health check for a service
def perform_health_check(service_name, service_info):
    try:
        response = requests.get(service_info['health_check_url'], timeout=5)
        print(response.text)
        # if response.status_code != 200: 
        #     restart_service(service_info['host'], service_info['path'])
    except requests.RequestException as e:
        print(f"An error occurred while performing the health check on {service_name}")
        # Optionally, you can handle the error further, such as retrying the request or logging it.
        restart_service(service_info['host'], service_name, service_info['port'], service_info['restart'])

# Set up the scheduler
scheduler = BackgroundScheduler()
for service_name, service_info in services.items():
    scheduler.add_job(perform_health_check, 'interval', seconds=10, args=[service_name, service_info])
scheduler.start()


# Define the callback function for processing messages received from RabbitMQ
def callback(ch, method, properties, body):
    # Decode the message body
    message_body = body.decode()
    
    # Check the routing key to determine the type of message
    if method.routing_key == 'auth':
        # If the message is from the 'auth' queue, it's related to authentication
        print(f"Authentication successful: {message_body}")
    elif method.routing_key == 'orders':
        # If the message is from the 'orders' queue, it's an order that needs processing
        print(f"Order received: {message_body}")
        # Before forwarding, show a message indicating the action
        print("Forwarding order to Order Queue Service...")
        # Forward the order to the Order Queue Service
        response = requests.post('http://localhost:5004/enqueue', data=body, headers={'Content-Type': 'application/json'})
        print(f"Order forwarded to Order Queue Service: {response.text}")

# Establish connection to RabbitMQ server
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()  # Open a channel

# Declare queues we are expecting to consume messages from
channel.queue_declare(queue='auth')  # Queue for authentication messages
channel.queue_declare(queue='orders')  # Queue for order messages

# Start consuming messages from both 'auth' and 'orders' queues using the callback function
channel.basic_consume(queue='auth', on_message_callback=callback, auto_ack=True)
channel.basic_consume(queue='orders', on_message_callback=callback, auto_ack=True)

# Print a message to indicate that the consumer is running and ready to receive messages
print('RabbitMQ Consumer is running. To exit press CTRL+C')
# Enter a never-ending loop that waits for messages and runs the callback when necessary
channel.start_consuming()
