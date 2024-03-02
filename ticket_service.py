from flask import Flask, jsonify  # Import Flask and jsonify for creating the web service and JSON responses
import pika  # Import Pika for RabbitMQ interaction

app = Flask(__name__)  # Initialize Flask app

# Sample event data stored in a dictionary
events = {"event1": {"event_id": "event1", "name": "Concert A", "tickets_available": 100, "price": 50}}

# Route to list all events
@app.route('/events', methods=['GET'])
def list_events():
    return jsonify(events)  # Return all events as a JSON response

# Run the Flask application on port 5003
if __name__ == '__main__':
    app.run(debug=True, port=5003)
