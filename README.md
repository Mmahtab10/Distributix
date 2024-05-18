# DistribuTix

## Distributed Ticketing System

### Project Overview

DistribuTix is a robust, scalable, and reliable distributed ticketing system designed to transform the traditional ticketing landscape by leveraging advanced distributed systems principles. This project, developed as part of the CPSC 559 course (Introduction to Distributed Systems) at the University of Calgary, aims to address the complexities and inefficiencies inherent in conventional ticketing frameworks.

### Group 19 Members
- Redwanul Islam
- Ehab Islam
- Mahtab Khan
- Zeyad Omran
- Ahnaf Eusa

### Motivation and Objectives

The primary motivation for developing DistribuTix is to resolve inefficiencies and limitations of traditional centralized ticketing systems, especially during high-demand scenarios. Our key objectives are:
- Ensuring real-time data consistency to avoid overbooking and discrepancies.
- Enhancing user experience with a smooth and rapid ticket purchasing process.
- Ensuring reliability and availability through a fault-tolerant architecture.
- Designing for scalability to manage increasing user requests efficiently.

### System Architecture

#### Overall Design
- **Client (Browser)**: User interaction point with the system via a web browser.
- **Load Balancer**: Distributes incoming client requests evenly across frontend servers.
- **Front End**: Facilitates direct interaction with clients and processes incoming requests.
- **Communication Service**: Manages internal communication with leader election for consistency.
- **Order and Authentication Services**: Dedicated microservices for order processing and user authentication, each with an active standby replica.
- **Service Manager**: Central control system tracking services, instances, and health status.
- **Databases**: Separate databases for tickets and authentication, each with a replica for high availability and data redundancy.

### Key Components

1. **RESTful APIs**: Enable flexible service interaction.
2. **JSON**: Streamlines data serialization.
3. **Layered Protocols**: Foundation of network communication ensuring efficient and secure data transmission.
4. **Virtual Private Cloud (VPC)**: Enhances security and control by isolating the network.

### Synchronization and Consistency

- **Ring Algorithm**: Used for leader election, ensuring efficient synchronization with minimal overhead.
- **Multithreading with Locking Mechanism**: Ensures data consistency and integrity during concurrent operations.
- **Eventual Consistency**: Guarantees that all states converge consistently over time.

### Replication and Fault Tolerance

- **Passive Replication Strategy**: Ensures consistency and high availability by keeping replicas ready to take over in case of primary service failure.
- **Service Replication and Failover Mechanisms**: Enhance system resilience by providing seamless transition to backup instances during failures.
- **Comprehensive Failure Detection and Management**: Monitors and manages various failure types, ensuring uninterrupted service delivery.

### System Requirements

- At least one host for each type of service: Communication, Authentication, Order, and Front-end (at least 2 recommended for failover and high availability).
- Private network between the physical nodes.
- SQL database (RDS recommended).
- Windows OS.

### System Inputs

- **Authentication Page**: Username and Password for account management.
- **Create Ticket Page**: Event details including Name, Description, Price, Date, Location, Coordinates, and Quantity.
- **Home Page**: Filters for events by Start Date and End Date, and a Search description field.
- **Ticket Detail Page**: Options to Order Now or Go Back.

### System Guarantees

- **Scalability**: Efficiently handles increasing user requests, especially during peak times.
- **Availability**: Ensures the system is always online and accessible.
- **Reliability**: Maintains stability and consistent performance over time.
- **User Experience**: Provides a seamless and efficient ticket purchasing process.
- **Consistency**: Real-time data uniformity to avoid overbooking and data conflicts.

### Challenges and Future Work

- **Challenges with Ring Algorithm**: Time complexity issues affecting scalability.
- **Limited Dynamic Scalability**: Current architecture requires manual adjustments to add nodes, limiting real-time scaling.

### Summary

DistribuTix demonstrates the potential of distributed systems in revolutionizing the ticketing landscape by ensuring scalability, reliability, and enhanced user experience. The project highlights the successful implementation of fault-tolerant, consistent, and scalable architecture ready to meet the dynamic needs of the ticketing industry.

---

For more detailed information, please refer to the [Final Report](documentation/documentation.pdf).
