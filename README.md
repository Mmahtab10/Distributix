# Distributed Ticketing System

This project demonstrates a distributed ticketing system using a microservices architecture and RabbitMQ for inter-service communication. It consists of several services: an Authentication Service, a Ticket Service, an Order Service, a RabbitMQ Consumer (also referred to as the Communication Service), and an Order Queue Service.

## System Overview

- **Auth Service**: Handles user authentication requests.
- **Ticket Service**: Manages event information, including ticket availability and pricing.
- **Order Service**: Processes ticket orders by placing them into a queue.
- **RabbitMQ Consumer (Communication Service)**: Acts as a middleware that listens for messages from RabbitMQ queues and forwards them appropriately.
- **Order Queue Service**: Receives orders from the RabbitMQ Consumer and manages the order processing queue.

## Installation

### Prerequisites

- Python 3.6+
- Flask
- Pika
- RabbitMQ server
- Requests library

Ensure RabbitMQ is installed and running on your system. Installation instructions can be found at [RabbitMQ's official site](https://www.rabbitmq.com/download.html).

### Setup Python Environment

Install the necessary Python libraries using pip:

```sh
pip install flask pika requests
```

Running the Services
Start each service in a separate terminal window or process. Here are the commands to start each service:

Start Auth Service
```sh
python auth_service.py
```

Start Ticket Service
```sh
python ticket_service.py
```

Start Order Service
```sh
python order_service.py
```

Start Order Queue Service
```sh
python order_queue_service.py
```

Start RabbitMQ Consumer (Communication Service)
```sh
python rabbitmq_consumer.py
```

Interacting with the Services
Use curl or any HTTP client to interact with the services. Below are some sample commands for common operations:

Auth Service (Login request)
```sh
curl -X POST http://localhost:5001/login -H "Content-Type: application/json" -d '{"username":"admin", "password":"password"}'
```

Ticket Service (List all events)
```sh
curl http://localhost:5003/events
```

Order Service (Place an order)
```sh
curl -X POST http://localhost:5002/order -H "Content-Type: application/json" -d '{"order_id": "12345", "event_id": "event1", "quantity": 2}'
```

For detailed information about each service, refer to the individual service files and comments within the code.
