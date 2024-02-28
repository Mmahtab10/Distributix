from flask import Flask, request, jsonify
import pika  # Import pika for RabbitMQ interaction

app = Flask(__name__)

@app.route('/order', methods=['POST'])
def order():
    # Extract order_id from the request
    order_id = request.json.get('order_id')
    # Connect to RabbitMQ server
    connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
    channel = connection.channel()
    # Declare a queue named 'orders'. RabbitMQ will create it if it doesn't exist.
    channel.queue_declare(queue='orders')
    # Publish a message to the 'orders' queue indicating an order has been placed
    channel.basic_publish(exchange='', routing_key='orders', body=f'Order {order_id} placed')
    connection.close()  # Close the connection to RabbitMQ
    return jsonify({"message": f"Order {order_id} received"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5002)  # Run the Flask app on port 5002
