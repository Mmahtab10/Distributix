import pika  # Import pika for interacting with RabbitMQ
import requests  # Import requests to make HTTP requests (for forwarding orders)

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
