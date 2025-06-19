#!/bin/sh
set -e

# Lire les options depuis /data/options.json (fichier injecté par HA)
MQTT_BROKER=$(jq -r '.mqtt_broker' /data/options.json)
MQTT_USERNAME=$(jq -r '.mqtt_username' /data/options.json)
MQTT_PASSWORD=$(jq -r '.mqtt_password' /data/options.json)

# Utilise les variables d'environnement standards
echo "🔧 MQTT_BROKER: $MQTT_BROKER"
echo "🔧 MQTT_USERNAME: $MQTT_USERNAME"

node snmp-agent.js