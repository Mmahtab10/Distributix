import json
from flask import Flask, request, jsonify
import requests
import os
import logging
import threading
import pika

app = Flask(__name__)

# Basic Configuration
SERVICE_ID = int(os.getenv('SERVICE_ID', '1'))
PORT = 5000 + SERVICE_ID
# Assuming a static ring for simplicity
NEXT_NODE_PORT = PORT + 1 if PORT < 5003 else 5001
NEXT_NODE_URL = f"http://localhost:{NEXT_NODE_PORT}"
PEERS = [f"http://localhost:{5000 + i}" for i in range(1, 4) if 5000 + i != PORT]
LEADER = ""  # Initially assume a leader
ELECTION_ACTIVE = False  # Flag to indicate if an election is in progress
PLACE_ORDER_URL = "http://localhost:5000/place_order"
GET_TICKETS_URL = "http://localhost:5000/get_tickets"

logging.basicConfig(level=logging.INFO)

@app.route('/place_order', methods=['POST'])
def place_order():
    order_data = request.json
    if not order_data:
        return jsonify({"message": "Invalid order data."}), 400

    # Forward the order data to the order service
    try:
        response = requests.post(PLACE_ORDER_URL, json=order_data)
        if response.status_code == 200:
            logging.info("Order placed successfully in the order service.")
            # Assuming the order service responds with JSON including ticket_confirmation_id
            response_data = response.json()
            ticket_confirmation_id = response_data.get('ticket_confirmation_id')
            if ticket_confirmation_id:
                return jsonify({"message": "Order placed successfully in the order service.", 
                                "ticket_confirmation_id": ticket_confirmation_id}), 200
            else:
                # Handle case where ticket_confirmation_id is not provided in the response
                logging.error("Order service did not provide a ticket_confirmation_id.")
                return jsonify({"message": "Order placed, but no confirmation ID received."}), 200
        else:
            logging.error("Failed to place order in the order service.")
            return jsonify({"message": "Failed to place order in the order service."}), response.status_code
    except requests.RequestException as e:
        logging.error(f"Request failed: {e}")
        return jsonify({"message": "Failed to connect to the order service."}), 500

@app.route('/get_tickets', methods=['GET'])
def get_tickets():
    try:
        response = requests.get(GET_TICKETS_URL)
        if response.status_code == 200:
            logging.info("Received ticket information successfully.")
            response_data = response.json()
            # Assuming the response contains an array of tickets under a key like 'tickets'
            tickets = response_data.get('tickets')
            if tickets is not None:
                return jsonify({"tickets": tickets}), 200
            else:
                # Handle case where 'tickets' key is not in the response
                logging.error("'tickets' key not found in the response from the ticket service.")
                return jsonify({"message": "Failed to retrieve tickets, 'tickets' key missing in response."}), 500
        else:
            logging.error(f"Failed to retrieve tickets. Status code: {response.status_code}")
            return jsonify({"message": "Failed to retrieve tickets from the ticket service."}), response.status_code
    except requests.RequestException as e:
        logging.error(f"Request failed: {e}")
        return jsonify({"message": "Failed to connect to the ticket service."}), 500

def send_election_message(service_id):
    global ELECTION_ACTIVE
    ELECTION_ACTIVE = True
    next_node_url = f"{NEXT_NODE_URL}/election"
    try:
        response = requests.post(next_node_url, json={'id': service_id})
        if response.status_code == 200:
            logging.info(f"Election message sent to {NEXT_NODE_URL} successfully.")
    except requests.RequestException as e:
        logging.error(f"Failed to send election message to {NEXT_NODE_URL}: {e}")
    finally:
        ELECTION_ACTIVE = False

@app.route('/initiate_election', methods=['POST'])
def initiate_election():
    logging.info("Manual election initiated.")
    # Send immediate response back
    response_thread = threading.Thread(target=send_election_after_response, args=(SERVICE_ID,))
    response_thread.start()
    return jsonify({"message": "Election initiation request received."}), 200

def send_election_after_response(service_id):
    send_election_message(service_id)

@app.route('/election', methods=['POST'])
def election():
    global LEADER, ELECTION_ACTIVE
    incoming_id = request.json.get('id')
    if incoming_id == SERVICE_ID:
        # Election message came back to initiator, declare self as leader
        LEADER = f"http://localhost:{PORT}"
        # Notify all nodes in the ring of the new leader
        send_leader_announcement(SERVICE_ID)
        return jsonify({"message": "Election completed, new leader elected."}), 200
    elif incoming_id > SERVICE_ID:
        # Forward the election message to the next node
        send_election_message(incoming_id)
    else:
        # Replace the incoming ID with this node's ID and forward
        send_election_message(SERVICE_ID)
    return jsonify({"message": "Election message forwarded."}), 200

def send_leader_announcement(service_id):
    announcement_data = {'new_leader': f"http://localhost:{5000 + service_id}"}
    for peer in PEERS:
        try:
            response = requests.post(f"{peer}/new_leader", json=announcement_data, timeout=5)
            if response.status_code == 200:
                logging.info(f"Leader announcement sent to {peer} successfully.")
        except requests.RequestException as e:
            logging.error(f"Failed to send leader announcement to {peer}: {e}")

@app.route('/new_leader', methods=['POST'])
def update_leader():
    global LEADER
    new_leader = request.json.get('new_leader')
    LEADER = new_leader
    logging.info(f"Updated leader to {LEADER}")
    return jsonify({"message": "Leader updated."}), 200


@app.route('/heartbeat', methods=['GET'])
def heartbeat():
    global LEADER
    # Simple heartbeat response. In a real application, you might include more status info.
    return jsonify({"leader": LEADER}), 200

@app.route('/leader', methods=['GET'])
def get_leader():
    global LEADER
    return jsonify({"leader": LEADER}), 200

if __name__ == '__main__':
    # In a real application, consider using a production server like Gunicorn.
    app.run(debug=True, host='0.0.0.0', port=PORT)
