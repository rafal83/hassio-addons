FROM node:22-alpine

ENV LANG C.UTF-8

# Install runtime dependencies + BLE support
RUN apk add --no-cache \
    bluez \
    libcap

# Set capabilities for Node.js BLE access
RUN setcap cap_net_raw+eip $(eval readlink -f $(which node))

WORKDIR /app

COPY start.sh /app/start.sh
COPY addon/ /app/

# Install Node.js dependencies (npm install for platforms with native deps)
RUN rm -rf /app/node_modules && npm install --omit=dev

# Ensure proper permissions
RUN chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]
