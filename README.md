# CPSC 559-TicketSystem

Below is a markdown (.md) template for a README file that explains the distributed ticketing system, its components, and detailed instructions on how to install and run the proof of concept. This README assumes that the system comprises an Auth Service, an Order Service, and a RabbitMQ instance for inter-service communication.

```markdown
# Distributed Ticketing System

## Overview

This proof of concept demonstrates a simple distributed ticketing system using microservices architecture. The system includes an Authentication Service (Auth Service) and an Order Service, with RabbitMQ serving as the message broker for inter-service communication.

## System Components

- **Auth Service**: Authenticates users and publishes a login message to RabbitMQ.
- **Order Service**: Processes orders and publishes order messages to RabbitMQ.
- **RabbitMQ**: Acts as the central communication hub between services.

## Prerequisites

- Python 3.6 or later
- Flask
- Pika (RabbitMQ Python client)
- RabbitMQ server

## Installation

### 1. Install RabbitMQ

Follow the official RabbitMQ [installation guide](https://www.rabbitmq.com/download.html) for your operating system.

### 2. Set Up Python Environment

It's recommended to use a virtual environment for Python projects.

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```

### 3. Install Python Dependencies

Install Flask and Pika within your virtual environment.

```bash
pip install Flask pika
```

## Running the Proof of Concept

### Start RabbitMQ

Ensure RabbitMQ is running. Consult the RabbitMQ documentation for instructions specific to your OS.

### Start the Auth Service

Navigate to the directory containing `auth_service.py` and run:

```bash
python auth_service.py
```

### Start the Order Service

In a new terminal window, navigate to the directory containing `order_service.py` and run:

```bash
python order_service.py
```

### Start the RabbitMQ Consumer

In a new terminal window, navigate to the directory containing `rabbitmq_consumer.py` and run:

```bash
python rabbitmq_consumer.py
```

The consumer script will listen for messages on the `auth` and `orders` queues and print them to the console.

## Testing the System

### Test the Auth Service (Using Postman)

Use `curl` to send a login request:

```bash
curl -X POST http://localhost:5001/login -H "Content-Type: application/json" -d '{"username":"admin", "password":"password"}'
```

### Test the Order Service

Use `curl` to place an order:

```bash
curl -X POST http://localhost:5002/order -H "Content-Type: application/json" -d '{"order_id":"123"}'
```

If everything is set up correctly, you should see messages from both services printed by the RabbitMQ consumer in the terminal.

## Conclusion

This proof of concept demonstrates basic inter-service communication in a distributed system using RabbitMQ. It's a foundational step towards building more complex, scalable, and resilient distributed applications.
```

This README provides a comprehensive guide for users to understand, install, and run the distributed ticketing system proof of concept. Adjust paths, filenames, or specific commands as necessary based on your project structure or any additional setup steps your implementation may require.
