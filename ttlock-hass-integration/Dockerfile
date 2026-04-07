ARG BUILD_FROM
FROM $BUILD_FROM

ENV LANG C.UTF-8

# Remove version pins that cause conflicts, then upgrade and install packages
RUN apk update && \
    # Remove problematic version pins from world file
    sed -i '/^musl=/d; /^libcrypto3=/d; /^libssl3=/d' /etc/apk/world && \
    # Upgrade all packages to latest
    apk upgrade --no-cache && \
    # Install dependencies
    apk add --no-cache \
        nodejs \
        npm \
        python3 \
        py3-pip \
        alpine-sdk \
        libcap \
        bluez \
        bluez-dev \
        eudev-dev && \
    # Set capabilities for Node.js BLE access
    setcap cap_net_raw+eip $(eval readlink -f $(which node))

WORKDIR /app

COPY start.sh /app/start.sh
COPY addon/ /app/

# Install Node.js dependencies (npm install for platforms with native deps)
RUN rm -rf /app/node_modules && npm install --omit=dev

# Ensure proper permissions
RUN chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]

LABEL io.hass.version="VERSION" io.hass.type="addon" io.hass.arch="amd64|aarch64"
