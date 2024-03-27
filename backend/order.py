from flask import Flask, request, jsonify
import threading
from concurrent.futures import ThreadPoolExecutor
import mysql.connector
from mysql.connector import Error
import os

app = Flask(__name__)

# Lock for managing access to the critical section
critical_section_lock = threading.Lock()

# Executor for managing worker threads
executor = ThreadPoolExecutor(max_workers=4)

# Database connection parameters
db_config = {
    'host': 'cpsc-559-1.c7ew4uk0crkj.us-east-2.rds.amazonaws.com',
    'user': 'admin',
    'password': 'osD8KUPYxEaq89UfiD6hL',
    'database': 'cpsc-559-1'
}

def process_order(order_data):
    """Process an order with SQL operations in a critical section."""
    with critical_section_lock:
        # Start of critical section
        print(f"Processing order in critical section: {order_data}")

        try:
            connection = mysql.connector.connect(**db_config)
            if connection.is_connected():
                cursor = connection.cursor()
                # Begin transaction
                connection.start_transaction()

                # Simulate SQL operation - replace these with your actual operations
                # For example, inserting order data into an 'orders' table
                sql_query = "INSERT INTO orders (order_id, details) VALUES (%s, %s)"
                values = (order_data.get('order_id'), order_data.get('details'))

                cursor.execute(sql_query, values)
                # You can add more SQL operations here as needed

                # Commit transaction
                connection.commit()

                print(f"Order processed: {order_data}")
        except Error as e:
            print("Error while connecting to MySQL", e)
            # Rollback in case of error
            if connection:
                connection.rollback()
        finally:
            if connection.is_connected():
                cursor.close()
                connection.close()
        # End of critical section

@app.route('/place_order', methods=['POST'])
def place_order():
    order_data = request.json
    if not order_data:
        return jsonify({"message": "Invalid order data."}), 400

    # Submit the order processing task to the executor
    executor.submit(process_order, order_data)

    return jsonify({"message": "Order is being processed."}), 202

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)