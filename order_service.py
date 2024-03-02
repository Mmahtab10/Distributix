from flask import Flask, request, jsonify  # Import Flask modules for the web service and handling requests/responses
import pika, json  # Import Pika for RabbitMQ and json for JSON processing

app = Flask(__name__)  # Initialize the Flask app

# Define a route for placing orders with POST method
@app.route('/order', methods=['POST'])
def order():
    # Serialize the request JSON to a string to be sent as the message body
    order_details = json.dumps(request.json)
    # Establish a connection to the local RabbitMQ server
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()  # Open a channel
    channel.queue_declare(queue='orders')  # Declare a queue named 'orders'
    # Publish the order details to the 'orders' queue
    channel.basic_publish(exchange='', routing_key='orders', body=order_details)
    connection.close()  # Close the RabbitMQ connection
    # Respond to the client that the order was received and sent to RabbitMQ
    return jsonify({"message": "Order received and sent to RabbitMQ"}), 200

# Run the Flask application on port 5002
if __name__ == '__main__':
    app.run(debug=True, port=5002)
