// NexusFlow - Real-Time IoT Telemetry Simulator

export const devices = [
  {
    id: "DEV001",
    name: "Temperature Sensor",
    type: "temperature",
    unit: "°C",
    min: 20,
    max: 100,
    threshold: 75
  },
  {
    id: "DEV002",
    name: "Humidity Sensor",
    type: "humidity",
    unit: "%",
    min: 20,
    max: 90,
    threshold: 70
  },
  {
    id: "DEV003",
    name: "Pressure Sensor",
    type: "pressure",
    unit: "bar",
    min: 1,
    max: 12,
    threshold: 9
  },
  {
    id: "DEV004",
    name: "Vibration Sensor",
    type: "vibration",
    unit: "mm/s",
    min: 0,
    max: 15,
    threshold: 10
  }
];

// Generate simulated readings
export function generateTelemetry(device) {
  const value =
    Math.random() * (device.max - device.min) +
    device.min;

  const reading = Number(value.toFixed(2));

  return {
    deviceId: device.id,
    deviceName: device.name,
    type: device.type,
    value: reading,
    unit: device.unit,
    timestamp: new Date().toISOString(),
    status: reading > device.threshold
      ? "WARNING"
      : "NORMAL"
  };
}

// Evaluate sensor threshold rules
export function evaluateRule(reading, threshold) {
  return {
    triggered: reading.value > threshold,
    deviceId: reading.deviceId,
    value: reading.value,
    threshold,
    timestamp: reading.timestamp
  };
}

// Generate telemetry for all devices
export function generateAllTelemetry() {
  return devices.map(generateTelemetry);
}
