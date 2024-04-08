from flask import Flask, request, jsonify
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
import os
import threading
from concurrent.futures import ThreadPoolExecutor
import logging
import time

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)

# Initialize a lock for managing access to critical sections.
critical_section_lock = threading.Lock()

# Initialize a ThreadPoolExecutor for managing asynchronous tasks.
executor = ThreadPoolExecutor(max_workers=4)

# Database connection parameters retrieved from environment variables for security.
db_config = {
    'host': os.getenv('Auth_DB_HOST'),
    'user': os.getenv('Auth_DB_USER'),
    'password': os.getenv('Auth_DB_PASSWORD'),
    'database': os.getenv('Auth_DB_NAME')
}

# Function to register a new user in the database.
def register_user(user_data):
    # Extract username and password from the request data.
    username = user_data['username']
    password = user_data['password']
    # Hash the password for secure storage.
    hashed_password = generate_password_hash(password)

    thread_id = threading.current_thread().ident
    logging.info(f"Thread {thread_id}: Attempting to acquire the lock for registration.")
    # Critical section starts here to prevent race conditions.
    with critical_section_lock:
        logging.info(f"Thread {thread_id}: Lock acquired for registration.")
        try:
            # Establish a connection to the database.
            connection = mysql.connector.connect(**db_config)
            cursor = connection.cursor()
            # Check if the username already exists in the database.
            cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
            if cursor.fetchone() is not None:
                return {"message": "Username already exists."}, 409

            # Insert the new user into the database.
            cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_password))
            connection.commit()
            return {"message": "User registered successfully."}, 201
        except Error as e:
            # Handle database connection or execution errors.
            print(f"Error while connecting to MySQL: {e}")
            return {"message": "An error occurred during registration."}, 500
        finally:
            # Ensure the database connection is closed after the operation.
            if connection.is_connected():
                cursor.close()
                connection.close()
            # Log the release after the with block.
            logging.info(f"Thread {thread_id}: Lock released after registration.")

#Function to verify user login credentials with thread safety.
def verify_login(credentials):
    username = credentials['username']
    password = credentials['password']

    # Define thread_id here using the current thread's ident
    thread_id = threading.current_thread().ident  
    logging.info(f"Thread {thread_id}: Attempting to acquire the lock for login.")
    # Use the lock to ensure thread safety during the login process.
    with critical_section_lock:
        logging.info(f"Thread {thread_id}: Lock acquired for login.")
        #logging.info(f"Thread {thread_id}: Sleeping for 30 seconds (for demo purposes).")
        #time.sleep(30)
        try:
            # Establish a connection to the database.
            connection = mysql.connector.connect(**db_config)
            if connection.is_connected():
                cursor = connection.cursor(dictionary=True)
                # Retrieve the user's hashed password from the database.
                cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
                user = cursor.fetchone()
                # Verify the provided password against the stored hash.
                if user and check_password_hash(user['password'], password):
                    return {"message": "Login successful."}, 200
                else:
                    return {"message": "Invalid username or password."}, 401
        except Error as e:
            # Handle database connection or execution errors.
            print(f"Error while connecting to MySQL: {e}")
            return {"message": "An error occurred while attempting to log in."}, 500
        finally:
            # Ensure the database connection is closed after the operation.
            if connection.is_connected():
                cursor.close()
                connection.close()
            # Log the release after the with block.
            logging.info(f"Thread {thread_id}: Lock released after login.")

#API endpoint for registering a new user.
@app.route('/register', methods=['POST'])
def register():
    user_data = request.json
    if not user_data or not user_data.get('username') or not user_data.get('password'):
        return jsonify({"message": "Username and password are required."}), 400

    # Asynchronously execute the user registration function.
    future = executor.submit(register_user, user_data)
    result, status = future.result()  # Wait for the function to complete.
    return jsonify(result), status

#API endpoint for user login.
@app.route('/login', methods=['POST'])
def login():
    credentials = request.json
    if not credentials or not credentials.get('username') or not credentials.get('password'):
        return jsonify({"message": "Username and password are required."}), 400

    # Asynchronously execute the login verification function.
    future = executor.submit(verify_login, credentials)
    result, status = future.result()  # Wait for the function to complete.
    return jsonify(result), status

@app.route('/heartbeat', methods=['GET'])
def order_heartbeat():
    return jsonify({"status":"OK"}), 200

if __name__ == '__main__':
    # Start the Flask application.
    app.run(debug=True, host='0.0.0.0', port=5010)
