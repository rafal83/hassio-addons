# Hassio Add-ons by Rafal83

This repository contains custom Home Assistant add-ons, including:

- **SNMP UPS Simulator** – Simulates an APC UPS via SNMP, updated in real time through MQTT messages (ideal for ESPHome-based UPS telemetry).

---

## 📦 Available Add-ons

| Add-on | Description | Docker Image | Status |
|--------|-------------|---------------|--------|
| [SNMP UPS Simulator](./snmp-ups-sim) | Simulates UPS metrics over SNMP using MQTT values | [`rafal83/snmp-ups-sim`](https://hub.docker.com/r/rafal83/snmp-ups-sim) | ![Docker](https://img.shields.io/docker/v/rafal83/snmp-ups-sim?sort=semver&label=version) |

---

## 🔁 CI/CD & Docker

This repository uses [GitHub Actions](.github/workflows/docker.yml) to:

- Automatically build and publish **multi-architecture Docker images** (`amd64`, `armv7`, `arm64`)
- Tag images as `latest` and `:<version>` (extracted from `config.json`)

Build status:  
[![Build & Push](https://github.com/rafal83/hassio-addons/actions/workflows/docker.yml/badge.svg)](https://github.com/rafal83/hassio-addons/actions/workflows/docker.yml)

---

## 🧪 How to use in Home Assistant

1. Go to **Settings → Add-ons → Add-on Store → ⋮ → Repositories**
2. Add this URL:

```text
https://github.com/rafal83/hassio-addons
