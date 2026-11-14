// NexusFlow - Configurable IoT Rule Engine

const OPERATORS = {
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  eq: (a, b) => a === b,
  neq: (a, b) => a !== b
};

const SYMBOLS = {
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  eq: "===",
  neq: "!=="
};

const SEVERITIES = ["info", "warning", "critical"];

// Default automation rules for IoT devices
export const DEFAULT_RULES = [
  {
    id: "TEMP001",
    name: "High Temperature",
    deviceType: "temperature",
    operator: "gt",
    threshold: 75,
    severity: "critical",
    message: "Temperature exceeded safe operating limit.",
    enabled: true
  },
  {
    id: "HUM001",
    name: "High Humidity",
    deviceType: "humidity",
    operator: "gt",
    threshold: 70,
    severity: "warning",
    message: "Humidity level is above normal.",
    enabled: true
  },
  {
    id: "PRS001",
    name: "High Pressure",
    deviceType: "pressure",
    operator: "gt",
    threshold: 9,
    severity: "warning",
    message: "Pressure threshold exceeded.",
    enabled: true
  },
  {
    id: "VIB001",
    name: "High Vibration",
    deviceType: "vibration",
    operator: "gte",
    threshold: 10,
    severity: "critical",
    message: "Critical vibration detected.",
    enabled: true
  }
];

// Validate user-defined rules
export function validateRule(rule) {
  const errors = [];

  if (!rule || typeof rule !== "object") {
    return ["Rule must be an object."];
  }

  if (!rule.id || !rule.name) {
    errors.push("Rule ID and name are required.");
  }

  if (!rule.deviceType) {
    errors.push("Device type is required.");
  }

  if (!Object.hasOwn(OPERATORS, rule.operator)) {
    errors.push("Unsupported comparison operator.");
  }

  if (!Number.isFinite(rule.threshold)) {
    errors.push("Threshold must be a valid number.");
  }

  if (!SEVERITIES.includes(rule.severity)) {
    errors.push("Invalid alert severity.");
  }

  return errors;
}

// Evaluate one telemetry reading against a rule
export function evaluateRule(rule, reading) {
  const errors = validateRule(rule);

  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  if (!reading || !Number.isFinite(reading.value)) {
    throw new Error("Invalid telemetry reading.");
  }

  if (rule.enabled === false) return null;

  if (
    rule.deviceType !== "*" &&
    rule.deviceType !== reading.type
  ) {
    return null;
  }

  const triggered = OPERATORS[rule.operator](
    reading.value,
    rule.threshold
  );

  if (!triggered) return null;

  const timestamp =
    reading.timestamp || new Date().toISOString();

  return {
    id: `${rule.id}-${reading.deviceId}-${timestamp}`,
    ruleId: rule.id,
    ruleName: rule.name,
    deviceId: reading.deviceId,
    deviceName: reading.deviceName || reading.deviceId,
    actualValue: reading.value,
    threshold: rule.threshold,
    operator: rule.operator,
    expression:
      `${reading.value} ${SYMBOLS[rule.operator]} ${rule.threshold}`,
    severity: rule.severity,
    message: rule.message,
    status: "ACTIVE",
    triggeredAt: timestamp
  };
}

// Evaluate all rules for a device
export function evaluateRules(
  reading,
  rules = DEFAULT_RULES
) {
  if (!Array.isArray(rules)) {
    throw new Error("Rules must be an array.");
  }

  return rules
    .map(rule => evaluateRule(rule, reading))
    .filter(alert => alert !== null);
}

// Evaluate multiple sensor readings
export function evaluateTelemetryBatch(
  readings,
  rules = DEFAULT_RULES
) {
  if (!Array.isArray(readings)) {
    throw new Error("Readings must be an array.");
  }

  return readings.flatMap(reading =>
    evaluateRules(reading, rules)
  );
}
