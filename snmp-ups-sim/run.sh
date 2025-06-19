#!/usr/bin/env bash
set -e

# ⬅️ Sourcer bashio (important)
source /usr/bin/bashio

export MQTT_BROKER="$(bashio::config 'mqtt_broker')"
export MQTT_USERNAME="$(bashio::config 'mqtt_username')"
export MQTT_PASSWORD="$(bashio::config 'mqtt_password')"

echo "🔧 MQTT_BROKER: $MQTT_BROKER"
node snmp-agent.js