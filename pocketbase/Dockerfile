FROM alpine:latest

# Install dependencies
RUN apk add --no-cache unzip ca-certificates

# Download Pocketbase (Update the version number as needed)
ARG PB_VERSION=0.36.6
ADD https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_amd64.zip /tmp/pb.zip

# Unzip to /pb directory
RUN unzip /tmp/pb.zip -d /pb/

# Set working directory so data is stored in /pb/pb_data
WORKDIR /pb

# Expose the default port
EXPOSE 8080

# Start PocketBase
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]
