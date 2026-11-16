// NexusFlow - IoT Telemetry Data Validator

const SENSOR_RANGES = {
  temperature: { min: -50, max: 150, unit: "°C" },
  humidity: { min: 0, max: 100, unit: "%" },
  pressure: { min: 0, max: 50, unit: "bar" },
  vibration: { min: 0, max: 100, unit: "mm/s" }
};

export function validateTelemetry(reading) {
  const errors = [];

  if (!reading || typeof reading !== "object") {
    return { valid: false, errors: ["Invalid reading object"] };
  }

  if (!reading.deviceId) {
    errors.push("Device ID is required");
  }

  if (!Object.hasOwn(SENSOR_RANGES, reading.type)) {
    errors.push("Unsupported sensor type");
  }

  if (!Number.isFinite(reading.value)) {
    errors.push("Sensor value must be a number");
  }

  if (
    Object.hasOwn(SENSOR_RANGES, reading.type) &&
    Number.isFinite(reading.value)
  ) {
    const range = SENSOR_RANGES[reading.type];

    if (reading.value < range.min || reading.value > range.max) {
      errors.push(
        `${reading.type} must be between ${range.min} and ${range.max}`
      );
    }
  }

  if (reading.timestamp && Number.isNaN(Date.parse(reading.timestamp))) {
    errors.push("Invalid timestamp format");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function normalizeTelemetry(reading) {
  const result = validateTelemetry(reading);

  if (!result.valid) {
    throw new Error(result.errors.join(", "));
  }

  const range = SENSOR_RANGES[reading.type];

  return {
    deviceId: reading.deviceId,
    type: reading.type,
    value: Number(reading.value),
    unit: range.unit,
    timestamp: reading.timestamp || new Date().toISOString(),
    status: "VALID"
  };
}

export function validateTelemetryBatch(readings) {
  if (!Array.isArray(readings)) {
    throw new Error("Telemetry input must be an array");
  }

  return readings.map((reading, index) => ({
    index,
    ...validateTelemetry(reading)
  }));
}

export function getSensorRanges() {
  return { ...SENSOR_RANGES };
}
