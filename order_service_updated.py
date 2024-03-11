
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

# Pseudo-function to save order to a database - implement with actual database logic
def save_order_to_db(order):
    pass

# Pseudo-function to get order by id from a database - implement with actual database logic
def get_order_by_id(order_id):
    pass

# Pseudo-function to update order in a database - implement with actual database logic
def update_order_in_db(order):
    pass

# Create Order endpoint
@app.route('/api/order/create', methods=['POST'])
@token_required
def create_order(current_user_id):
    data = request.get_json()
    # Implement logic to fetch ticket info and verify quantity
    # Pseudo-code to get ticket details (e.g., price) and check available quantity
    ticket_info = {}  # This should come from the Ticket Service
    if data['quantity'] > ticket_info['quantity']:
        return jsonify({'error': 'Not enough tickets available'}), 400
    order_id = str(uuid.uuid4())  # Generate unique order id
    order = {
        'id': order_id,
        'ticketId': data['ticketId'],
        'userId': current_user_id,
        'quantity': int(data['quantity']),
        'price': float(ticket_info['price']) * int(data['quantity']),
        'orderCreated': datetime.utcnow().isoformat(),
        'orderCompleted': None,
        'status': 'CREATED'
    }
    save_order_to_db(order)
    # Send message to Order Queue Service with orderId and orderCreated as payload
    # Implement RabbitMQ message sending logic here
    return jsonify({'orderId': order_id}), 201

# Complete Order endpoint
@app.route('/api/order/<order_id>/complete', methods=['POST'])
@token_required
def complete_order(current_user_id, order_id):
    order = get_order_by_id(order_id)
    if not order:
        abort(404, description="Order not found")
    if order['userId'] != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    order['orderCompleted'] = datetime.utcnow().isoformat()
    order['status'] = 'COMPLETED'
    update_order_in_db(order)
    return jsonify({'status': order['status']}), 200

# Get Order By ID endpoint
@app.route('/api/order/<order_id>', methods=['GET'])
@token_required
def get_order_by_id_endpoint(current_user_id, order_id):
    order = get_order_by_id(order_id)
    if not order:
        abort(404, description="Order not found")
    return jsonify(order), 200

# Health check route for the order service
@app.route('/orderHealth', methods=['GET'])
def health_check():
    return "OrderService is up and running", 200

# Run the Flask app on the specified port
if __name__ == '__main__':
    app.run(debug=True, port=5002)
