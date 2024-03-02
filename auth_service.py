from flask import Flask, request, jsonify  # Import necessary modules from Flask
import pika  # Import the Pika library for interacting with RabbitMQ

app = Flask(__name__)  # Initialize a Flask application

# Define a route for user login with POST method
@app.route('/login', methods=['POST'])
def login():
    # Extract username and password from the request's JSON body
    username = request.json['username']
    password = request.json['password']
    # Simplified authentication check (in production, use secure methods)
    if username == "admin" and password == "password":
        # Establish a connection to the local RabbitMQ server
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        channel = connection.channel()  # Open a channel
        channel.queue_declare(queue='auth')  # Declare a queue named 'auth'
        # Publish a login success message to the 'auth' queue
        channel.basic_publish(exchange='', routing_key='auth', body=f'User {username} logged in')
        connection.close()  # Close the RabbitMQ connection
        return jsonify({"message": "Login successful"}), 200  # Return a success response
    # Return a login failed response if credentials don't match
    return jsonify({"message": "Login failed"}), 401

# Run the Flask app on port 5001
if __name__ == '__main__':
    app.run(debug=True, port=5001)
