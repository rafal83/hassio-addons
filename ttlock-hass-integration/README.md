# Home Assistant Add-on TTLock

> This is a **WORK IN PROGRESS**. Help with testing and report bugs [here](https://github.com/kind3r/hass-addons/issues).

Feeling generous and want to support my work, here is [my PayPal link](https://paypal.me/kind3r).

## Requirements
- **Bluetooth adapter**: The addon uses `host_dbus` to access the Bluetooth adapter on your Home Assistant host via BlueZ
  - If your HA host has built-in Bluetooth (Raspberry Pi, most mini PCs), it works out of the box
  - Otherwise, add a USB BLE dongle (e.g., ASUS USB-BT500)
- **MQTT broker** (optional but recommended if you want to report lock status in HA and use it for automations)

### Bluetooth Compatibility
- This addon requires direct access to the Bluetooth adapter via DBus (enabled by `host_dbus: true`)
- **Not compatible** with ESPHome Bluetooth Proxy (TTLock uses proprietary BLE protocol)
- **Not compatible** with TTLock G2/G3 cloud gateway (uses cloud API, not local BLE)

## Features
- Ingress Web UI for
  - Pair new lock
  - Unpair lock
  - Lock / unlock
  - Manage auto-lock time
  - Manage sound on/off
  - Add / edit PIN codes
  - Add / remove IC Cards
  - Add / remove fingerprints
  - View operations log
  - Get updates about lock / unlock status
- (optional) HA reporting and controling via `lock` domain device using MQTT discovery
  - Signal level
  - Battery level
  - Lock/unlock status

## Screenshots

### Lock list  
![Lock list](https://raw.githubusercontent.com/kind3r/hass-addons/master/ttlock-hass-integration/img/frontend1.png)  

### Credentials  
![Credentials](https://raw.githubusercontent.com/kind3r/hass-addons/master/ttlock-hass-integration/img/frontend2.png)  

### Add fingerprint  
![Add fingerprint](https://raw.githubusercontent.com/kind3r/hass-addons/master/ttlock-hass-integration/img/frontend3.png)  

### HA device
![HA device](https://raw.githubusercontent.com/kind3r/hass-addons/master/ttlock-hass-integration/img/ha1.png)  

