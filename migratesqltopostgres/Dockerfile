# Use the official Ubuntu base image
FROM ubuntu:latest

# Set environment variables to avoid interactive installations
ENV DEBIAN_FRONTEND=noninteractive

# Update package lists and install necessary packages
RUN apt-get update && \
    apt-get install -y \
    postgresql \
    postgresql-contrib \
    golang-go \
    && apt-get clean
# Create a new PostgreSQL cluster with UTF-8 encoding
# Adjust PostgreSQL configuration files for Docker and remote connections
#RUN ls /etc/postgresql/
RUN echo "host all  all    0.0.0.0/0  md5" >> /etc/postgresql/14/main/pg_hba.conf && \
    echo "listen_addresses='*'" >> /etc/postgresql/14/main/postgresql.conf

# Expose the PostgreSQL port
EXPOSE 5432

# Set the Go environment variables
ENV GOPATH /go
ENV PATH $GOPATH/bin:/usr/local/go/bin:$PATH

# Create a directory for the Go code
RUN mkdir -p "$GOPATH/src" "$GOPATH/bin" && chmod -R 777 "$GOPATH"

# Copy the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]
