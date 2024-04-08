@echo off

start cmd /k "set SERVICE_ID=1 && python C:\CPSC_559_Project\communication.py"
start cmd /k "set SERVICE_ID=2 && python C:\CPSC_559_Project\communication.py"
start cmd /k "set SERVICE_ID=3 && python C:\CPSC_559_Project\communication.py"

rem Start order service instances
start cmd /k "python order.py"
