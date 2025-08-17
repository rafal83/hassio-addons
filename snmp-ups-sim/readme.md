# SNMP UPS Simulator

Simulates an APC UPS via SNMP and dynamically updates values from MQTT (e.g. ESPHome).

## MQTT Topics expected

- `ups/voltage` → updates SNMP input voltage
- `ups/percent` → updates battery charge %
- `ups/status` → MAINS / BATTERY → affects SNMP battery status
- `ups/power` → output power
- `ups/remaining` → updates remaining runtime (in seconds)

## Usage

```bash
docker run -d --name snmp-ups \
  -e MQTT_BROKER=mqtt://192.168.1.10 \
  -e MQTT_USERNAME=user \
  -e MQTT_PASSWORD=password \
  -p 161:161/udp \
  rafal83/snmp-ups-sim:latest
