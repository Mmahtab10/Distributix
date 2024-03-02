from flask import Flask, request, jsonify  # Import Flask modules for the web application and handling JSON

app = Flask(__name__)  # Initialize Flask app

# Define a route to enqueue orders for processing with POST method
@app.route('/enqueue', methods=['POST'])
def enqueue_order():
    order_details = request.json  # Extract order details from the request JSON body
    print(f"Order queued for processing: {order_details}")  # Log the received order
    # Respond that the order was successfully received and queued
    return jsonify({"message": "Order queued for processing"}), 200

# Run the Flask application on port 5004
if __name__ == '__main__':
    app.run(debug=True, port=5004)
