#!/bin/bash

# Export SERVICE_ID and start communication.py in the background with specific SERVICE_ID
export SERVICE_ID=1 && python /CPSC_559_Project/communication.py &
export SERVICE_ID=2 && python /CPSC_559_Project/communication.py &
export SERVICE_ID=3 && python /CPSC_559_Project/communication.py &

# Start order service instance
python /CPSC_559_Project/order.py &
