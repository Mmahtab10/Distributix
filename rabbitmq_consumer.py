import pika  # Import pika for interacting with RabbitMQ

def main():
    # Establish connection to RabbitMQ server
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()

    # Declare the queues we expect to listen to
    channel.queue_declare(queue='auth')
    channel.queue_declare(queue='orders')

    # Define a callback function that will be called when a message is received
    def callback(ch, method, properties, body):
        print(f"Received {body.decode()} from queue {method.routing_key}")

    # Start consuming messages from both 'auth' and 'orders' queues using the callback function
    channel.basic_consume(queue='auth', on_message_callback=callback, auto_ack=True)
    channel.basic_consume(queue='orders', on_message_callback=callback, auto_ack=True)

    print('Waiting for messages. To exit press CTRL+C')
    # Enter a never-ending loop that waits for data and runs callbacks whenever necessary
    channel.start_consuming()

if __name__ == '__main__':
    main()  # Execute the main function
