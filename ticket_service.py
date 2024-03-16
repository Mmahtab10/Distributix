
from flask import Flask, request, jsonify, abort
from functools import wraps
import jwt
import uuid
from datetime import datetime

app = Flask(__name__)  # Initialize a Flask application
SECRET_KEY = 'your_secret_key'

# Pseudo-function to authenticate and decode JWT - in production use an authentication library
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            # Decode the token and extract the user id - this is pseudo-code
            data = jwt.decode(token, SECRET_KEY)
            current_user_id = data['user_id']
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

# Pseudo-function to save ticket to a database - implement with actual database logic
def save_ticket_to_db(ticket):
    pass

# Pseudo-function to get ticket by id from a database - implement with actual database logic
def get_ticket_by_id(ticket_id):
    pass

# Pseudo-function to update ticket in a database - implement with actual database logic
def update_ticket_in_db(ticket):
    pass

# Create Ticket endpoint
@app.route('/api/ticket/create', methods=['POST'])
@token_required
def create_ticket(current_user_id):
    data = request.get_json()
    ticket_id = str(uuid.uuid4())  # Generate unique ticket id
    ticket = {
        'id': ticket_id,
        'name': data['name'],
        'description': data['description'],
        'price': float(data['price']),
        'imageUrl': data.get('imageUrl'),  # Optional
        'date': data['date'],
        'locationName': data['locationName'],
        'coordinates': list(map(float, data['coordinates'].split(','))),
        'quantity': int(data['quantity'])
    }
    save_ticket_to_db(ticket)
    return jsonify({'ticketId': ticket_id}), 201

# Get Ticket By ID endpoint
@app.route('/api/ticket/<ticket_id>', methods=['GET'])
@token_required
def get_ticket_by_id_endpoint(current_user_id, ticket_id):
    ticket = get_ticket_by_id(ticket_id)
    if not ticket:
        abort(404, description="Ticket not found")
    return jsonify(ticket), 200

# Health check route for the ticket service
@app.route('/ticketHealth', methods=['GET'])
def health_check():
    return "TicketService is up and running", 200

# Run the Flask app on the specified port
if __name__ == '__main__':
    app.run(debug=True, port=5003)
