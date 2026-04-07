#!/bin/sh

export MQTT_HOST="${MQTT_HOST:-}"
export MQTT_PORT="${MQTT_PORT:-}"
export MQTT_SSL="${MQTT_SSL:-}"
export MQTT_USER="${MQTT_USER:-}"
export MQTT_PASS="${MQTT_PASS:-}"
export GATEWAY="${GATEWAY:-none}"
export GATEWAY_HOST="${GATEWAY_HOST:-}"
export GATEWAY_PORT="${GATEWAY_PORT:-}"
export GATEWAY_KEY="${GATEWAY_KEY:-}"
export GATEWAY_USER="${GATEWAY_USER:-}"
export GATEWAY_PASS="${GATEWAY_PASS:-}"

if [ "${IGNORE_CRC}" = "true" ]; then
  export TTLOCK_IGNORE_CRC=1
fi

if [ "${GATEWAY}" = "noble" ]; then
  export NOBLE_WEBSOCKET=1
fi

if [ "${DEBUG_COMMUNICATION}" = "true" ]; then
  export TTLOCK_DEBUG_COMM=1
fi

if [ "${DEBUG_MQTT}" = "true" ]; then
  export MQTT_DEBUG=1
fi

if [ "${GATEWAY_DEBUG}" = "true" ]; then
  export WEBSOCKET_DEBUG=1
fi

cd /app
exec npm start
