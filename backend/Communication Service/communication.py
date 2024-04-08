import json
from functools import wraps
from flask import Flask, request, jsonify
import requests
import os
import logging
import threading
from threading import Lock
import socket
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_private_ip():
    try:
        # This creates a socket object
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Try to connect to an address that is non-routable
        s.connect(("8.8.8.8", 80))
        # Get the socket's own address
        IP = s.getsockname()[0]
        s.close()
    except Exception as e:
        print(f"Error obtaining private IP: {e}")
        IP = "127.0.0.1"  # Fallback to localhost
    return IP

# Basic Configuration
SERVICE_ID = int(os.getenv('SERVICE_ID', '1'))
PORT = 5000 + SERVICE_ID
# PRIVATE_IP = get_private_ip()
PRIVATE_IP = "3.17.227.54"
# Assuming a static ring for simplicity
NEXT_NODE_PORT = PORT + 1 if PORT < 5003 else 5001
NEXT_NODE_URL = f"http://{PRIVATE_IP}:{NEXT_NODE_PORT}"
PEERS = [f"http://{PRIVATE_IP}:{5000 + i}" for i in range(1, 4) if 5000 + i != PORT]
LEADER = f"http://{PRIVATE_IP}:5003"  # Initially assume a leader
ELECTION_ACTIVE = False  # Flag to indicate if an election is in progress

AUTH_URLs = [f"http://172.31.11.47:5009", f"http://172.31.4.133:5010"]
ORDER_URLs = [f"http://172.31.4.31:5011", f"http://172.31.5.193:5012"]


auth_urls_lock = Lock()
order_urls_lock = Lock()

logging.basicConfig(level=logging.DEBUG)

def require_leader(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check if this instance is the leader
        if LEADER != f"http://{PRIVATE_IP}:{PORT}":
            return jsonify({
                "message": "This instance is not the leader and cannot process the request.",
                "leader": LEADER  # Include the current leader's URL in the response
            }), 403
        return f(*args, **kwargs)
    return decorated_function

@app.route('/place_order', methods=['POST'])
@require_leader
def place_order():
    order_data = request.json
    if not order_data:
        return jsonify({"message": "Invalid order data."}), 400

    with order_urls_lock:  # Acquire the lock before accessing or modifying the list
        for order_url in list(ORDER_URLs):  # Iterate over the list
            try:
                response = requests.post(f"{order_url}/place_order", json=order_data, timeout=5)
                if response.status_code == 200:
                    logging.info("Order placed successfully in the order service.")
                    response_data = response.json()
                    confirmation_ids = response_data.get('confirmation_ids')
                    if confirmation_ids:
                        return jsonify({"message": "Order placed successfully in the order service.", 
                                        "confirmation_id": confirmation_ids}), 200
                    else:
                        logging.error("Order service did not provide confirmation_ids.")
                        return jsonify({"message": "Order placed, but no confirmation ID received."}), 200
                elif response.status_code == 422:
                    # If one service can't process due to business logic, it's unlikely others can; stop retrying.
                    return jsonify({"message": "Failed to process order due to insufficient tickets."}), response.status_code
                else:
                    # Log other responses but don't remove the URL
                    logging.error(f"Failed to place order in the order service with status {response.status_code}.")
            except requests.RequestException as e:
                # On connection error, remove the failed URL and log the error
                logging.error(f"Request failed for {order_url}: {e}")

    # If the loop completes without returning, all attempts have failed
    return jsonify({"message": "Failed to connect to any order service."}), 500


@app.route('/create_ticket', methods=['POST'])
@require_leader
def create_ticket():
    # Extract ticket data from the request
    ticket_data = request.json
    if not ticket_data:
        return jsonify({"message": "Invalid ticket data."}), 400

    # Iterate over the list of order URLs to try creating the ticket
    with order_urls_lock:  # Acquire the lock before accessing or modifying the list
        for order_url in list(ORDER_URLs):  # Iterate over a copy of the list
            try:
                # Send a POST request to the order service's create_ticket endpoint
                response = requests.post(f"{order_url}/create_ticket", json=ticket_data, timeout=5)
                if response.status_code == 200:
                    # Ticket creation successful
                    logging.info("Ticket created successfully in the order service.")
                    response_data = response.json()
                    ticket_id = response_data.get('ticket_id')
                    if ticket_id:
                        # Provide the ticket ID in the response
                        return jsonify({"message": "Ticket created successfully in the order service.", 
                                        "ticket_id": ticket_id}), 200
                    else:
                        # Handle case where ticket ID is not provided in the response
                        logging.error("Order service did not provide ticket_id.")
                        return jsonify({"message": "Ticket created, but no ticket ID received."}), 200
                else:
                    # Log error if ticket creation fails
                    logging.error(f"Failed to create ticket in the order service with status {response.status_code}.")
            except requests.RequestException as e:
                # Log error if the request to the order service fails
                logging.error(f"Request failed for {order_url}: {e}")

    # If the loop completes without returning, all attempts have failed
    return jsonify({"message": "Failed to connect to any order service."}), 500

@app.route('/get_tickets', methods=['GET'])
@require_leader
def get_tickets():
    with order_urls_lock:  # Acquire the lock before accessing or modifying the list
        for order_url in list(ORDER_URLs):  # Iterate over a copy of the list
            try:
                response = requests.get(f"{order_url}/get_tickets", timeout=5)
                if response.status_code == 200:
                    logging.info("Received ticket information successfully.")
                    response_data = response.json()
                    tickets = response_data.get('tickets')
                    if tickets is not None:
                        return jsonify({"tickets": tickets}), 200
                    else:
                        logging.error("'tickets' key not found in the response from the ticket service.")
                        # Continue to the next URL instead of returning an error immediately
                else:
                    logging.error(f"Failed to retrieve tickets from {order_url}. Status code: {response.status_code}")
                    # Continue to try with the next URL in the list
            except requests.RequestException as e:
                # Log the error and remove the failed URL from the global list
                logging.error(f"Request failed for {order_url}: {e}")
                # Continue to try with the next URL in the list

    # If the loop completes without returning, all attempts have failed
    return jsonify({"message": "Failed to connect to any ticket service."}), 500

@app.route('/get_ticket/<ticket_id>', methods=['GET'])
@require_leader
def get_ticket(ticket_id):
    if ticket_id is None:
        return jsonify({"message": "Ticket ID not provided."}), 400

    with order_urls_lock:
        for order_url in list(ORDER_URLs):
            try:
                # Construct URL with ticket_id as part of the route
                url = f"{order_url}/get_ticket/{ticket_id}"
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    logging.info(f"Received ticket information successfully for ticket ID {ticket_id}.")
                    response_data = response.json()
                    ticket_details = response_data.get('ticket_details')
                    if ticket_details is not None:
                        return jsonify({"ticket": ticket_details}), 200
                    else:
                        logging.error("Ticket details not found in the response from the ticket service.")
                        # Continue to the next URL instead of returning an error immediately
                else:
                    logging.error(f"Failed to retrieve ticket details for ticket ID {ticket_id} from {order_url}. Status code: {response.status_code}")
                    # Continue to try with the next URL in the list
            except requests.RequestException as e:
                # Log the error and remove the failed URL from the global list
                logging.error(f"Request failed for {order_url}: {e}")
                # Continue to try with the next URL in the list

    # If the loop completes without returning, all attempts have failed
    return jsonify({"message": f"Failed to retrieve details for ticket ID {ticket_id} from any ticket service."}), 500

    
@app.route('/register', methods=['POST'])
@require_leader
def register():
    user_data = request.json
    if not user_data:
        return jsonify({"message": "Invalid user data."}), 400

    with auth_urls_lock:  # Acquire the lock before modifying the list
        for auth_url in list(AUTH_URLs):  # Make a copy of the list to iterate over
            try:
                response = requests.post(f"{auth_url}/register", json=user_data, timeout=5)
                if response.status_code == 201:
                    # If successful, relay the response back to the client
                    return jsonify(response.json()), response.status_code
                elif response.status_code == 409:
                    # If user already exists
                    return jsonify(response.json()), response.status_code
                else:
                    # Log responses but don't remove the URL
                    logging.error(f"Registration request failed with status {response.status_code} for {auth_url}")
            except requests.RequestException as e:
                # On connection error, remove the failed URL and log the error
                logging.error(f"Request failed for {auth_url}: {e}")

    # If the loop completes without returning, all attempts have failed
    return jsonify({"message": "Failed to connect to any authentication service."}), 500

@app.route('/login', methods=['POST'])
@require_leader
def login():
    user_credentials = request.json
    if not user_credentials:
        return jsonify({"message": "Invalid login data."}), 400

    with auth_urls_lock:  # Acquire the lock before accessing or modifying the list
        for auth_url in list(AUTH_URLs):  # Iterate over a copy of the list
            try:
                response = requests.post(f"{auth_url}/login", json=user_credentials, timeout=5)
                if response.status_code == 200:
                    # If successful, relay the response back to the client
                    return jsonify(response.json()), response.status_code
                elif response.status_code == 401:
                    # If the username/password is incorrect
                    return jsonify(response.json()), response.status_code
                else:
                    # Log responses but don't remove the URL;
                    logging.error(f"Login request failed with status {response.status_code} for {auth_url}")
            except requests.RequestException as e:
                # On connection error, remove the failed URL and log the error
                logging.error(f"Request failed for {auth_url}: {e}")

    # If the loop completes without returning, all attempts have failed
    return jsonify({"message": "Failed to connect to any authentication service."}), 500


def send_election_message(service_id):
    global ELECTION_ACTIVE
    ELECTION_ACTIVE = True
    next_node_url = f"{NEXT_NODE_URL}/election"
    try:
        logging.info(f"Sending election message to {NEXT_NODE_URL}.")
        response = requests.post(next_node_url, json={'id': service_id}, timeout=3)
        if response.status_code == 200:
            logging.info(f"Election message sent to {NEXT_NODE_URL} successfully.")
    except requests.RequestException as e:
        try:
            if (NEXT_NODE_PORT == 5003):
                logging.error(f"Failed to send election message to {NEXT_NODE_URL}. Sending election message to http://{PRIVATE_IP}:5001/election")
                response = requests.post(f"http://{PRIVATE_IP}:5001/election", json={'id': 2})
                # logging.info(f"Election message sent to http://{PRIVATE_IP}:5001 successfully.")
            elif (NEXT_NODE_PORT == 5001):
                logging.error(f"Failed to send election message to {NEXT_NODE_URL}. Sending election message to http://{PRIVATE_IP}:5002/election")
                response = requests.post(f"http://{PRIVATE_IP}:5002/election", json={'id': 3})
                # logging.info(f"Election message sent to http://{PRIVATE_IP}:5001 successfully.")
            elif (NEXT_NODE_PORT == 5002):
                logging.error(f"Failed to send election message to {NEXT_NODE_URL}. Sending election message to http://{PRIVATE_IP}:5003/election")
                response = requests.post(f"http://{PRIVATE_IP}:5003/election", json={'id': 1})
                # logging.info(f"Election message sent to http://{PRIVATE_IP}:5001 successfully.")
        except requests.RequestException as f:
            logging.error(f"Failed to send election message to {NEXT_NODE_URL}. Declaring self as leader")
            response = requests.post(f"http://{PRIVATE_IP}:{PORT}/new_leader", json={'new_leader': f"http://{PRIVATE_IP}:{5000 + service_id}"})
            
    finally:
        ELECTION_ACTIVE = False

@app.route('/initiate_election', methods=['POST'])
def initiate_election():
    logging.info("Manual election initiated.")
    # Send immediate response back
    response_thread = threading.Thread(target=send_election_message, args=(SERVICE_ID,))
    response_thread.start()
    return jsonify({"message": "Election initiation request received."}), 200

@app.route('/election', methods=['POST'])
def election():
    global LEADER, ELECTION_ACTIVE
    incoming_id = request.json.get('id')
    logging.error(f"Received election message {incoming_id}")
    if incoming_id == SERVICE_ID:
        # Election message came back to initiator, declare self as leader
        LEADER = f"http://{PRIVATE_IP}:{PORT}"
        logging.error(f"Declaring self as leader {incoming_id}")
        # Notify all nodes in the ring of the new leader
        send_leader_announcement(SERVICE_ID)
        return jsonify({"message": "Election completed, new leader elected."}), 200
    elif incoming_id > SERVICE_ID:
        logging.error(f"Sending election message {incoming_id}")
        # Forward the election message to the next node
        send_election_message(incoming_id)
    else:
        logging.error(f"Sending election message {SERVICE_ID}")
        # Replace the incoming ID with this node's ID and forward
        send_election_message(SERVICE_ID)
                
    return '', 200

def send_leader_announcement(service_id):
    announcement_data = {'new_leader': f"http://{PRIVATE_IP}:{5000 + service_id}"}
    for peer in PEERS:
        try:
            response = requests.post(f"{peer}/new_leader", json=announcement_data, timeout=3)
            if response.status_code == 200:
                logging.info(f"Leader announcement sent to {peer} successfully.")
        except requests.RequestException as e:
            logging.error(f"Failed to send leader announcement to {peer}")

@app.route('/new_leader', methods=['POST'])
def update_leader():
    global LEADER
    new_leader = request.json.get('new_leader')
    LEADER = new_leader
    logging.info(f"Updated leader to {LEADER}")
    return jsonify({"message": "Leader updated."}), 200

@app.route('/simpleLeader', methods=['GET'])
def get_simpleLeader():
    global LEADER
    return jsonify({"leader": LEADER}), 200

@app.route('/leader', methods=['GET'])
def get_leader():
    global LEADER
    try:
        # Attempt to check if the leader is reachable
        response = requests.get(f"{LEADER}/heartbeat", timeout=3)
        # If the request is successful, return the current leader
        return jsonify({"leader": LEADER}), 200
    except requests.RequestException:
        try:
            response = requests.post(f"http://localhost:{PORT}/initiate_election")
            return jsonify({"message": "Leader not reachable, election initiated."}), 202  # HTTP 202 Accepted indicates the request has been accepted but not yet acted upon
        except:
            return jsonify({"message": "Election cannot be initiated"}), 500

@app.route('/heartbeat', methods=['GET'])
def order_heartbeat():
    return jsonify({"status":"OK"}), 200

def get_private_ip():
    try:
        # This creates a socket object
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        # Try to connect to an address that is non-routable
        s.connect(("8.8.8.8", 80))
        # Get the socket's own address
        IP = s.getsockname()[0]
        s.close()
    except Exception as e:
        print(f"Error obtaining private IP: {e}")
        IP = "127.0.0.1"  # Fallback to localhost
    return IP


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=PORT)
