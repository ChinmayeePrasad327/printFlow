const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");

const requiredVars = [
  "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "EXPO_PUBLIC_API_URL",
  "EXPO_PUBLIC_SOCKET_URL",
];

function readEnvFile(fileName) {
  const filePath = path.join(projectRoot, fileName);
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const env = {};
  const content = fs.readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

const fileEnv = {
  ...readEnvFile(".env"),
  ...readEnvFile(".env.local"),
};

function getEnv(name) {
  return process.env[name] || fileEnv[name] || "";
}

const missing = requiredVars.filter((name) => !getEnv(name).trim());

const clerkKey = getEnv("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY").trim();
const invalid = [];

if (clerkKey && !clerkKey.startsWith("pk_")) {
  invalid.push("EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_");
}

for (const name of ["EXPO_PUBLIC_API_URL", "EXPO_PUBLIC_SOCKET_URL"]) {
  const value = getEnv(name).trim();
  if (value && !/^https?:\/\//.test(value)) {
    invalid.push(`${name} must start with http:// or https://`);
  }
}

if (missing.length || invalid.length) {
  console.error("PrintFlow frontend environment validation failed.");

  if (missing.length) {
    console.error(`Missing required variables: ${missing.join(", ")}`);
  }

  for (const message of invalid) {
    console.error(message);
  }

  console.error(
    "For APK builds, add these values to EAS environment variables/secrets before rebuilding.",
  );
  process.exit(1);
}

console.log("PrintFlow frontend environment validation passed.");
