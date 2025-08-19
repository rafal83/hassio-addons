# SNMP UPS Simulator

Simulates an APC UPS via SNMP and dynamically updates values from MQTT (e.g. ESPHome). Compatible with standard UPS monitoring tools that expect APC PowerNet-MIB and UPS-MIB OIDs.

## Features

- **SNMP Agent**: Listens on port 161 with communities `public` and `private`
- **MQTT Integration**: Subscribes to `ups/#` topics for real-time updates
- **APC Compatible**: Implements both standard UPS-MIB and APC PowerNet-MIB OIDs
- **Real-time Updates**: MQTT messages instantly update SNMP values

## MQTT Topics Expected

The simulator subscribes to the following MQTT topics and maps them to corresponding SNMP OIDs:

| MQTT Topic | Description | SNMP OIDs Updated |
|------------|-------------|-------------------|
| `ups/voltage` | Input voltage (V) | `upsInputVoltage`, `upsAdvInputLineVoltage` |
| `ups/outoutVoltage` | Output voltage (V) | `upsOutputVoltage` |
| `ups/batteryVoltage` | Battery voltage (V) | `upsBatteryVoltage` |
| `ups/batteryTemperature` | Battery temperature (°C) | `upsAdvBatteryTemperature` |
| `ups/remaining` | Runtime remaining (seconds) | `upsAdvBatteryRunTimeRemaining` |
| `ups/percent` | Battery charge percentage | `upsEstimatedChargeRemaining`, `upsAdvBatteryCapacity`, `upsAlarmLowBattery` |
| `ups/status` | UPS status (MAINS/BATTERY) | `upsBasicOutputStatus`, `upsBatteryStatus`, `upsBasicBatteryStatus` |
| `ups/current` | Output current (A) | `upsAdvOutputCurrent` |
| `ups/power` | Output active power (W) | `upsAdvOutputActivePower` |

## Status Mapping

- **MAINS**: UPS on mains power (SNMP value: 2 = onLine)
- **BATTERY**: UPS on battery power (SNMP value: 3 = onBattery)
- **Low Battery Alarm**: Automatically triggered when battery < 10%

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MQTT_BROKER` | `localhost` | MQTT broker hostname/IP |
| `MQTT_PORT` | `1883` | MQTT broker port |
| `MQTT_USERNAME` | - | MQTT authentication username |
| `MQTT_PASSWORD` | - | MQTT authentication password |

## Usage

### Docker Run
```bash
docker run -d --name snmp-ups \
  -e MQTT_BROKER=192.168.1.10 \
  -e MQTT_PORT=1883 \
  -e MQTT_USERNAME=user \
  -e MQTT_PASSWORD=password \
  -p 161:161/udp \
  rafal83/snmp-ups-sim:latest
```

### Docker Compose
```yaml
version: '3.8'
services:
  snmp-ups:
    image: rafal83/snmp-ups-sim:latest
    container_name: snmp-ups
    environment:
      - MQTT_BROKER=192.168.1.10
      - MQTT_PORT=1883
      - MQTT_USERNAME=user
      - MQTT_PASSWORD=password
    ports:
      - "161:161/udp"
    restart: unless-stopped
```

## Testing

### SNMP Walk
```bash
# Test basic connectivity
snmpwalk -v2c -c public localhost 1.3.6.1.4.1.318

# Check specific values
snmpget -v2c -c public localhost 1.3.6.1.4.1.318.1.1.1.4.1.1  # Output status
snmpget -v2c -c public localhost 1.3.6.1.4.1.318.1.1.1.2.2.1  # Battery capacity
```

### MQTT Test
```bash
# Publish test values
mosquitto_pub -h localhost -t ups/voltage -m "230"
mosquitto_pub -h localhost -t ups/percent -m "85"
mosquitto_pub -h localhost -t ups/status -m "MAINS"
```

## SNMP OIDs Supported

### System Information
- `1.3.6.1.2.1.1.1` - System Description
- `1.3.6.1.2.1.1.2` - System Object ID
- `1.3.6.1.2.1.1.3` - System Uptime

### UPS-MIB (Standard)
- `1.3.6.1.2.1.33.1.1.2` - UPS Model
- `1.3.6.1.2.1.33.1.2.1` - Battery Status
- `1.3.6.1.2.1.33.1.2.4` - Battery Charge Remaining
- `1.3.6.1.2.1.33.1.2.5` - Battery Voltage
- `1.3.6.1.2.1.33.1.3.3.1.3` - Input Voltage
- `1.3.6.1.2.1.33.1.4.4.1.2` - Output Voltage
- `1.3.6.1.2.1.33.1.4.4.1.5` - Output Load Percentage
- `1.3.6.1.2.1.33.1.6.3.3` - Low Battery Alarm

### PowerNet-MIB (APC Specific)
- `1.3.6.1.4.1.318.1.1.1.1.1.1` - UPS Model
- `1.3.6.1.4.1.318.1.1.1.2.1.1` - Basic Battery Status
- `1.3.6.1.4.1.318.1.1.1.2.2.1` - Battery Capacity
- `1.3.6.1.4.1.318.1.1.1.2.2.2` - Battery Temperature
- `1.3.6.1.4.1.318.1.1.1.2.2.3` - Runtime Remaining
- `1.3.6.1.4.1.318.1.1.1.2.2.4` - Battery Replace Indicator
- `1.3.6.1.4.1.318.1.1.1.3.2.1` - Input Line Voltage
- `1.3.6.1.4.1.318.1.1.1.3.2.2` - Input Max Line Voltage
- `1.3.6.1.4.1.318.1.1.1.3.2.5` - Input Line Fail Cause
- `1.3.6.1.4.1.318.1.1.1.4.1.1` - Basic Output Status
- `1.3.6.1.4.1.318.1.1.1.4.2.4` - Output Current
- `1.3.6.1.4.1.318.1.1.1.4.2.8` - Output Active Power

## Integration Examples

### ESPHome Configuration
```yaml
# ESPHome YAML snippet for UPS monitoring
mqtt:
  broker: your-mqtt-broker
  
sensor:
  - platform: adc
    pin: A0
    name: "UPS Battery Voltage"
    filters:
      - multiply: 3.3
    on_value:
      then:
        - mqtt.publish:
            topic: ups/batteryVoltage
            payload: !lambda return to_string(x);

binary_sensor:
  - platform: gpio
    pin: D1
    name: "UPS On Battery"
    on_state:
      then:
        - mqtt.publish:
            topic: ups/status
            payload: !lambda return x ? "BATTERY" : "MAINS";
```

### Home Assistant
The simulated UPS will be discoverable by Home Assistant's SNMP integration using the container's IP address and standard APC OIDs.

## Requirements

- Node.js runtime
- Network access to MQTT broker
- UDP port 161 available for SNMP

## Notes

- The simulator identifies itself as "ESP32-UPS" model
- All MQTT message values are automatically rounded to integers for SNMP compatibility
- Low battery alarm automatically activates when battery percentage drops below 10%
- SNMP communities "public" and "private" are both supported with read-only access
