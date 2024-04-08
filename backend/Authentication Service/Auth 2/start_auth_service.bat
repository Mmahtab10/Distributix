@echo off

rem Start auth service instance
start cmd /k "flask --app auth.py run --port 5010 -h 0.0.0.0"