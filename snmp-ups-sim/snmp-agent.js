// Version complète pour simuler un onduleur APC compatible SNMP (UPS-MIB + PowerNet-MIB)

const snmp = require("net-snmp");
const fs = require("fs");
const mqtt = require("mqtt");

const broker = (process.env.MQTT_BROKER || "localhost")
const mqttClient = mqtt.connect("mqtt://" + broker, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD
});

mqttClient.on("connect", () => {
  console.log("🔗 MQTT connecté", broker);
  mqttClient.subscribe("ups/#");
});

mqttClient.on("message", (topic, message) => {
  const payload = message.toString();
  const floatVal = parseFloat(payload);
  if (isNaN(floatVal)) return;

  switch (topic) {
    case "ups/voltage":
      mib.setScalarValue("upsInputVoltage", Math.round(floatVal));
      mib.setScalarValue("upsAdvInputLineVoltage", Math.round(floatVal));
      break;
    case "ups/batteryTemperature":
      mib.setScalarValue("upsAdvBatteryTemperature", Math.round(floatVal));
    case "ups/remaining":
      mib.setScalarValue("upsAdvBatteryRunTimeRemaining", Math.round(floatVal));
    case "ups/percent":
      mib.setScalarValue("upsEstimatedChargeRemaining", Math.round(floatVal));
      mib.setScalarValue("upsAdvBatteryCapacity", Math.round(floatVal));
      break;
    case "ups/status":
      const status = payload.toUpperCase();
      const snmpStatus = status === "MAINS" ? 2 : 3; // 2 = onLine, 3 = onBattery
      mib.setScalarValue("upsBasicOutputStatus", snmpStatus);
      mib.setScalarValue("upsBatteryStatus", snmpStatus); // optionnel
      mib.setScalarValue("upsBasicBatteryStatus", snmpStatus);
      break;
    case "ups/power":
      mib.setScalarValue("upsAdvOutputCurrent", Math.round(floatVal));
      break;
    default:
      console.log(`🛈 MQTT non géré : ${topic} => ${payload}`);
  }
});

const agent = snmp.createAgent({
  port: 161,
  disableAuthorization: true,
  accessControlModelType: snmp.AccessControlModelType.Simple
}, function (error, data) {
  if (error) {
    console.error("SNMP error:", error);
    return;
  }
  //console.log(data.pdu.varbinds);
  console.log("SNMP request received:", JSON.stringify(data.pdu.varbinds, null, 2));
});

const authorizer = agent.getAuthorizer();
authorizer.addCommunity("public");
authorizer.addCommunity("private");

const mib = agent.getMib();

// Fournisseurs d'OID simulant un onduleur APC
const apcProviders = [
  // SNMPv2-MIB
  { name: "sysDescr", oid: "1.3.6.1.2.1.1.1", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.OctetString, maxAccess: snmp.MaxAccess["read-only"] },
  { name: "sysObjectID", oid: "1.3.6.1.2.1.1.2", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.ObjectIdentifier, maxAccess: snmp.MaxAccess["read-only"] },
{
  name: "sysUpTime",
  oid: "1.3.6.1.2.1.1.3",
  type: snmp.MibProviderType.Scalar,
  scalarType: snmp.ObjectType.TimeTicks,
  maxAccess: snmp.MaxAccess["read-only"]
},
  // UPS-MIB
  {
  name: "upsBasicOutputStatus",
  oid: "1.3.6.1.4.1.318.1.1.1.4.1.1",
  type: snmp.MibProviderType.Scalar,
  scalarType: snmp.ObjectType.Integer,
  maxAccess: snmp.MaxAccess["read-only"],
  constraints: {
    enumeration: {
      1: "unknown",
      2: "onLine",
      3: "onBattery",
      4: "onBoost",
      5: "onBuck"
    }
  }
},
{
  name: "upsAdvInputLineFailCause",
  oid: "1.3.6.1.4.1.318.1.1.1.3.2.5",
  type: snmp.MibProviderType.Scalar,
  scalarType: snmp.ObjectType.Integer,
  maxAccess: snmp.MaxAccess["read-only"],
  constraints: {
    enumeration: {
      1: "noTransfer",
      2: "highLineVoltage",
      3: "brownout",
      4: "blackout",
      5: "smallMomentarySag",
      6: "deepMomentarySag",
      7: "smallMomentarySpike",
      8: "largeMomentarySpike",
      9: "selfTest",
      10: "rateOfVoltageChange"
    }
  }
},
  { name: "upsIdentModel", oid: "1.3.6.1.2.1.33.1.1.2", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.OctetString, maxAccess: snmp.MaxAccess["read-only"] },
  { name: "upsBatteryStatus", oid: "1.3.6.1.2.1.33.1.2.1", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"], constraints: { enumeration: { 1: "unknown", 2: "batteryNormal", 3: "batteryLow", 4: "batteryDepleted" } } },
  { name: "upsEstimatedChargeRemaining", oid: "1.3.6.1.2.1.33.1.2.4", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"] },
  { name: "upsInputVoltage", oid: "1.3.6.1.2.1.33.1.3.3.1.3", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"] },
  { name: "upsOutputPercentLoad", oid: "1.3.6.1.2.1.33.1.4.4.1.5", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"] },

  // PowerNet-MIB
  { name: "upsBasicIdentModel", oid: "1.3.6.1.4.1.318.1.1.1.1.1.1", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.OctetString, maxAccess: snmp.MaxAccess["read-only"] },
  { name: "upsAdvBatteryCapacity", oid: "1.3.6.1.4.1.318.1.1.1.2.2.1", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"] },
  { name: "upsAdvBatteryRunTimeRemaining", oid: "1.3.6.1.4.1.318.1.1.1.2.2.3", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"] },
  { name: "upsBasicBatteryStatus", oid: "1.3.6.1.4.1.318.1.1.1.2.1.1", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"], constraints: { enumeration: { 1: "unknown", 2: "batteryNormal", 3: "batteryLow", 4: "batteryInFaultCondition" } } },
  { name: "upsAdvBatteryReplaceIndicator", oid: "1.3.6.1.4.1.318.1.1.1.2.2.4", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"], constraints: { enumeration: { 1: "noBatteryNeedsReplacing", 2: "batteryNeedsReplacing" } } },
  { name: "upsAdvInputMaxLineVoltage", oid: "1.3.6.1.4.1.318.1.1.1.3.2.2", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"] },
  { name: "upsAdvOutputCurrent", oid: "1.3.6.1.4.1.318.1.1.1.4.2.4", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"] },
  { name: "upsAdvInputLineVoltage", oid: "1.3.6.1.4.1.318.1.1.1.3.2.1", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Gauge32, maxAccess: snmp.MaxAccess["read-only"] },
  { name: "upsAdvBatteryTemperature", oid: "1.3.6.1.4.1.318.1.1.1.2.2.2", type: snmp.MibProviderType.Scalar, scalarType: snmp.ObjectType.Integer, maxAccess: snmp.MaxAccess["read-only"] }
];

apcProviders.forEach(provider => agent.registerProvider(provider));

// Valeurs simulées
mib.setScalarValue("sysDescr", "APC UPS simulated by Node.js");
mib.setScalarValue("sysObjectID", "1.3.6.1.4.1.318.1.1.1");
mib.setScalarValue("sysUpTime", 123456); // en centièmes de secondes

mib.setScalarValue("upsIdentModel", "ESP32-UPS");
mib.setScalarValue("upsBasicOutputStatus", 2); // 2 = onLine
mib.setScalarValue("upsAdvInputLineFailCause", 1); // 1 = noTransfer

mib.setScalarValue("upsBatteryStatus", 2);
mib.setScalarValue("upsEstimatedChargeRemaining", 85);
mib.setScalarValue("upsInputVoltage", 12);
mib.setScalarValue("upsOutputPercentLoad", 42);

mib.setScalarValue("upsBasicIdentModel", "ESP32-UPS");
mib.setScalarValue("upsAdvBatteryCapacity", 85);
mib.setScalarValue("upsAdvBatteryRunTimeRemaining", 180);
mib.setScalarValue("upsBasicBatteryStatus", 2);
mib.setScalarValue("upsAdvBatteryReplaceIndicator", 1);
mib.setScalarValue("upsAdvInputMaxLineVoltage", 230);
mib.setScalarValue("upsAdvOutputCurrent", 42);
mib.setScalarValue("upsAdvInputLineVoltage", 12);
mib.setScalarValue("upsAdvBatteryTemperature", 31);

console.log("✅ Agent SNMP APC simulé démarré sur le port 161");
apcProviders.forEach(p => console.log(`${p.name} => ${p.oid}`));
