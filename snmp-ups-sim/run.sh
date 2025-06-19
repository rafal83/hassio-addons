#!/bin/sh
set -e

# Utilise les variables d'environnement standards
echo "🔧 MQTT_BROKER: $MQTT_BROKER"
echo "🔧 MQTT_USERNAME: $MQTT_USERNAME"

node snmp-agent.js