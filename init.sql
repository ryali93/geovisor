su - postgres
psql -c "CREATE DATABASE db;"
psql -d db -c "CREATE EXTENSION postgis;"