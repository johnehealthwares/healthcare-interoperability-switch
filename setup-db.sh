#!/bin/bash

# Healthcare Interoperability Switch - Database Setup Script

echo "Starting database initialization..."

# Create database
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'health_interop_db'" | grep -q 1 || psql -U postgres -c "CREATE DATABASE health_interop_db"

echo "Database created successfully!"
echo "Run 'npm run dev' to start the server"
