from flask import Flask, request, jsonify
import pika  # Import pika for interacting with RabbitMQ

app = Flask(__name__)

@app.route('/login', methods=['POST'])
def login():
    # Extract username and password from the request
    username = request.json.get('username')
    password = request.json.get('password')
    # Here, you would typically validate the credentials against a database or another secure storage
    if username == "admin" and password == "password":
        # Connect to RabbitMQ server
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        channel = connection.channel()
        # Declare a queue named 'auth'. If it doesn't exist, RabbitMQ will create it.
        channel.queue_declare(queue='auth')
        # Publish a message to the 'auth' queue indicating successful login
        channel.basic_publish(exchange='', routing_key='auth', body=f'User {username} logged in')
        connection.close()  # Close the connection to RabbitMQ
        return jsonify({"message": "Login successful"}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5001)  # Run the Flask app on port 5001
