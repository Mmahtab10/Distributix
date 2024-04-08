from flask import Flask, request, jsonify
import threading
from concurrent.futures import ThreadPoolExecutor
import mysql.connector
from mysql.connector import Error
import os
import json
import logging
import uuid
import time

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# Lock for managing access to the critical section
critical_section_lock = threading.Lock()

# Executor for managing worker threads
executor = ThreadPoolExecutor(max_workers=4)

# Database connection parameters
db_config = {
    'host': os.getenv('Tickets_DB_HOST'),
    'user': os.getenv('Tickets_DB_USER'),
    'password': os.getenv('Tickets_DB_PASSWORD'),
    'database': os.getenv('Tickets_DB_NAME')
}

# Function to process an order based on the received order data
def process_order(order_data):
    # Define thread_id here using the current thread's ident
    thread_id = threading.current_thread().ident
    logging.info(f"Thread {thread_id}: Attempting to acquire the lock for order processing.")
    # Use a lock to ensure that this block of code is executed by only one thread at a time
    with critical_section_lock:
        logging.info(f"Thread {thread_id}: Lock acquired for order processing.")
        # Print the order data being processed for logging/debugging purposes
        print(f"Processing order: {order_data}")

        try:
            # Establish a connection to the MySQL database using the configuration specified
            connection = mysql.connector.connect(**db_config)
            # Check if the database connection was successful
            if connection.is_connected():
                # Create a cursor to execute SQL queries
                cursor = connection.cursor()
                # Start a new transaction to ensure the following operations are atomic
                connection.start_transaction()

                # SQL query to fetch the current quantity and confirmation IDs for a specific ticket
                ticket_query = "SELECT quantity, confirmation_ids FROM tickets WHERE ticket_id = %s"
                # Execute the query with the provided ticket ID
                cursor.execute(ticket_query, (order_data['ticket_id'],))
                # Fetch the query result
                ticket_info = cursor.fetchone()

                # Check if the ticket exists and has enough quantity to fulfill the order
                if ticket_info and ticket_info[0] >= order_data['quantity']:
                    # Calculate the new ticket quantity after the order is processed
                    new_quantity = ticket_info[0] - order_data['quantity']
                    # Load the confirmation IDs (assumed to be stored as a JSON array of UUID strings)
                    confirmation_ids_json = ticket_info[1]
                    confirmation_ids = json.loads(confirmation_ids_json)
                    # Extract the confirmation IDs to be used for this order
                    used_confirmation_ids = confirmation_ids[:order_data['quantity']]
                    # Update the list of remaining confirmation IDs after removing the used ones
                    remaining_confirmation_ids = confirmation_ids[order_data['quantity']:]

                    # SQL query to update the ticket entry with the new quantity and the updated confirmation IDs
                    update_query = """
                        UPDATE tickets
                        SET quantity = %s, confirmation_ids = %s
                        WHERE ticket_id = %s
                    """
                    # Execute the update query with the new values
                    cursor.execute(update_query, (new_quantity, json.dumps(remaining_confirmation_ids), order_data['ticket_id']))
                    
                    # Commit the transaction to save the changes made during this transaction
                    connection.commit()
                    
                    # Log the processed order's details, specifically the used confirmation IDs
                    print(f"Order processed with confirmation IDs: {used_confirmation_ids}")
                    # Return the list of used confirmation IDs as a result of this function
                    return used_confirmation_ids  
                else:
                    # Log a message indicating there were not enough tickets available to fulfill the order
                    print("Not enough tickets available.")
                    # Rollback the transaction to undo any changes made since the transaction started
                    connection.rollback()
                    # Return an empty list to indicate no confirmation IDs were processed/used
                    return []

        except Error as e:
            # Log any errors encountered during database connection or query execution
            print("Error while connecting to MySQL", e)
            # Rollback the transaction in case of any error to ensure data consistency
            if connection:
                connection.rollback()
            # Return an empty list as the function result in case of error
            return []
        finally:
            # Ensure the database connection is closed properly to free up resources
            if connection.is_connected():
                cursor.close()
                connection.close()
            # Log the release after the with block.
            logging.info(f"Thread {thread_id}: Lock released after order processing.")

def fetch_tickets():
    # Define thread_id here using the current thread's ident
    thread_id = threading.current_thread().ident
    logging.info(f"Thread {thread_id}: Attempting to acquire the lock for fetching tickets.")
    # Use a lock to ensure that this block of code is executed by only one thread at a time
    with critical_section_lock:
        logging.info(f"Thread {thread_id}: Lock acquired for fetching tickets.")
        try:
            # Attempt to establish a connection to the MySQL database using the parameters defined in db_config
            connection = mysql.connector.connect(**db_config)
            # Check if the connection to the database was successful
            if connection.is_connected():
                # Create a cursor object using the connection, set to return rows as dictionaries
                cursor = connection.cursor(dictionary=True)
                # SQL query to select all records from the tickets table
                query = "SELECT * FROM tickets"
                # Execute the SQL query using the cursor
                cursor.execute(query)
                # Fetch all rows of the query result, returning them as a list of dictionaries
                tickets = cursor.fetchall()
                return tickets  # Return the fetched ticket data to the caller
        except Error as e:
            # If an error occurs (e.g., database connection fails), print the error message
            print(f"Error while fetching tickets: {e}")
            return None  # Return None to indicate that an error occurred during the fetch operation
        finally:
            # This block ensures that the database connection is closed properly, regardless of whether
            # the try block succeeded or an exception was raised
            if connection and connection.is_connected():
                cursor.close()  # Close the cursor
                connection.close()  # Close the connection to the database
            # Log the release after the with block.
            logging.info(f"Thread {thread_id}: Lock released after fetching tickets.")

def process_ticket_creation(ticket_data):
    # Define thread_id here using the current thread's ident
    thread_id = threading.current_thread().ident
    logging.info(f"Thread {thread_id}: Attempting to acquire the lock for ticket creation.")
    # Use a lock to ensure that this block of code is executed by only one thread at a time
    with critical_section_lock:
        logging.info(f"Thread {thread_id}: Lock acquired for ticket creation.")
        # Print the ticket data being processed for logging/debugging purposes
        print(f"Creating ticket: {ticket_data}")

        try:
            # Establish a connection to the MySQL database using the configuration specified
            connection = mysql.connector.connect(**db_config)
            # Check if the database connection was successful
            if connection.is_connected():
                # Create a cursor to execute SQL queries
                cursor = connection.cursor()
                # Start a new transaction to ensure the following operations are atomic
                connection.start_transaction()

                # Generate confirmation IDs for the ticket
                confirmation_ids = [str(uuid.uuid4()) for _ in range(ticket_data['quantity'])]

                # SQL query to insert the ticket data into the database
                insert_query = """
                    INSERT INTO tickets (eventName, price, description, date, location, coordinates, quantity, confirmation_ids)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                # Execute the insert query with the provided ticket data
                cursor.execute(insert_query, (ticket_data['eventName'], ticket_data['price'], ticket_data['description'],
                                               ticket_data['date'], ticket_data['location'], ticket_data['coordinates'],
                                               ticket_data['quantity'], json.dumps(confirmation_ids)))
                
                # Commit the transaction to save the changes made during this transaction
                connection.commit()
                
                # Log the ticket creation details, specifically the generated confirmation IDs
                print(f"Ticket created with confirmation IDs: {confirmation_ids}")
                # Return the list of generated confirmation IDs as a result of this function
                return confirmation_ids  
                
        except Exception as e:
            # Log the error that occurred during ticket creation
            logging.error(f"An error occurred while creating the ticket: {e}")
            # Rollback the transaction to undo any changes made since the transaction started
            connection.rollback()
            # Raise the exception to be handled by the caller
            raise e
        finally:
            # Ensure the database connection is closed properly to free up resources
            if connection.is_connected():
                cursor.close()
                connection.close()
            # Log the release after the with block.
            logging.info(f"Thread {thread_id}: Lock released after ticket creation.")

@app.route('/place_order', methods=['POST'])
def place_order():
    order_data = request.json
    if not order_data:
        return jsonify({"message": "Invalid order data."}), 400

    # Execute the order processing function directly or using Future.result() to wait for the completion
    # In this case, we use executor.submit() for its Future and then call .result() to wait for the function to complete.
    future = executor.submit(process_order, order_data)
    try:
        # Wait for the process_order function to complete and get its result
        confirmation_ids = future.result()

        if confirmation_ids:
            return jsonify({"message": "Order processed successfully.", "confirmation_ids": confirmation_ids}), 200
        else:
            return jsonify({"message": "Failed to process order due to insufficient tickets."}), 422
    except Exception as e:
        # Handle any exceptions that occurred during order processing
        return jsonify({"message": "An error occurred while processing your order.", "error": str(e)}), 500
    

@app.route('/get_tickets', methods=['GET'])
def get_tickets():
    future = executor.submit(fetch_tickets)
    try:
        # Wait for the fetch_tickets function to complete and get its result
        tickets = future.result()

        if tickets:
            return jsonify({"tickets": tickets}), 200
        else:
            return jsonify({"message": "Failed to retrieve tickets."}), 500
    
    except Exception as e:
        # Handle any exceptions that occurred during order processing
        return jsonify({"message": "An error occurred while fetching tickets.", "error": str(e)}), 500

@app.route('/create_ticket', methods=['POST'])
def create_ticket():
    ticket_data = request.json
    if not ticket_data:
        return jsonify({"message": "Invalid ticket data."}), 400

    # Execute the ticket creation function directly or using Future.result() to wait for the completion
    # In this case, we use executor.submit() for its Future and then call .result() to wait for the function to complete.
    future = executor.submit(process_ticket_creation, ticket_data)
    try:
        # Wait for the process_ticket_creation function to complete and get its result
        ticket_id = future.result()

        if ticket_id:
            return jsonify({"message": "Ticket created successfully.", "ticket_id": ticket_id}), 200
        else:
            return jsonify({"message": "Failed to create ticket."}), 500
    except Exception as e:
        # Handle any exceptions that occurred during ticket creation
        return jsonify({"message": "An error occurred while creating the ticket.", "error": str(e)}), 500

@app.route('/get_ticket/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    future = executor.submit(fetch_ticket, ticket_id)
    try:
        # Wait for the fetch_ticket function to complete and get its result
        ticket = future.result()

        if ticket:
            return jsonify({"ticket_details": ticket}), 200
        else:
            return jsonify({"message": "Ticket not found."}), 404
    
    except Exception as e:
        # Handle any exceptions that occurred during the ticket retrieval process
        return jsonify({"message": "An error occurred while fetching the ticket.", "error": str(e)}), 500

def fetch_ticket(ticket_id):
    # Utilize thread ID for logging as before
    thread_id = threading.current_thread().ident
    logging.info(f"Thread {thread_id}: Attempting to acquire the lock for fetching ticket.")
    with critical_section_lock:
        logging.info(f"Thread {thread_id}: Lock acquired for fetching ticket.")
        try:
            connection = mysql.connector.connect(**db_config)
            if connection.is_connected():
                cursor = connection.cursor(dictionary=True)
                # Modify the query to select a single ticket by ID
                query = "SELECT * FROM tickets WHERE ticket_id = %s"
		
                cursor.execute(query, (ticket_id,))  # Ensure ticket_id is passed as a tuple
                ticket = cursor.fetchone()  # Fetch the single matching ticket
                return ticket
        except Error as e:
            print(f"Error while fetching ticket: {e}")
            return None
        finally:
            if connection and connection.is_connected():
                cursor.close()
                connection.close()
            logging.info(f"Thread {thread_id}: Lock released after fetching ticket.")

@app.route('/heartbeat', methods=['GET'])
def order_heartbeat():
    return jsonify({"status":"OK"}), 200

if __name__ == '__main__':
    # Start the Flask application.
    app.run(debug=True, host='0.0.0.0', port=5011)