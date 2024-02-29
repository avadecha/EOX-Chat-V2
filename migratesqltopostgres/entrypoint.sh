#!/bin/bash

# Start PostgreSQL
/etc/init.d/postgresql start

# Create a PostgreSQL user and database for Mattermost
echo "Creating Mattermost user and database..."
psql -U postgres -c "CREATE USER mattermost WITH PASSWORD 'mattermost';"
psql -U postgres -c "CREATE DATABASE mattermost WITH OWNER mattermost;"

# Keep the container running
tail -f /dev/null
